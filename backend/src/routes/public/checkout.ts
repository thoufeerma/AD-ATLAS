import { Router } from "express";
import { randomInt } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { quoteCart } from "../../lib/pricing.js";
import { conflict, notFound, parse } from "../../lib/http.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { afterResponse, type Email } from "../../lib/mail.js";
import { alertNewOrder, mailContext, orderConfirmation } from "../../lib/emails.js";

export const checkoutRouter = Router();

const CartItem = z.object({
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  shade: z.string().nullish(),
});

const QuoteBody = z.object({
  items: z.array(CartItem).min(1).max(50),
  couponCode: z.string().trim().max(40).nullish(),
  email: z.email().nullish(),
  shippingMethodId: z.string().max(40).nullish(),
});

/** Live cart pricing for the cart and checkout pages. Writes nothing. */
checkoutRouter.post("/cart/quote", async (req, res) => {
  const body = parse(QuoteBody, req.body);
  const quote = await quoteCart(body);
  res.json({ data: quote });
});

const Indian10Digit = z
  .string()
  .transform((s) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"));

const OrderBody = z.object({
  items: z.array(CartItem).min(1).max(50),
  couponCode: z.string().trim().max(40).nullish(),
  email: z.email().transform((e) => e.toLowerCase()),
  name: z.string().trim().min(2).max(100),
  phone: Indian10Digit,
  shipping: z.object({
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).nullish(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  }),
  paymentMethod: z.enum(["UPI", "CARD", "NETBANKING", "WALLET", "COD"]),
  shippingMethodId: z.string().max(40).nullish(),
});

/** VL + YYMMDD + 4 digits, e.g. VL2605291234. */
function makeOrderNumber() {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  return `VL${ymd}${String(randomInt(0, 10_000)).padStart(4, "0")}`;
}

async function uniqueOrderNumber(tx: Prisma.TransactionClient) {
  for (let i = 0; i < 8; i++) {
    const number = makeOrderNumber();
    const taken = await tx.order.findUnique({ where: { number }, select: { id: true } });
    if (!taken) return number;
  }
  throw conflict("Could not allocate an order number, please retry");
}

// A real shopper places one order, maybe retries a couple of times.
const orderLimit = rateLimit({ name: "order", max: 20, windowMs: 10 * 60_000 });

checkoutRouter.post("/orders", orderLimit, async (req, res) => {
  const body = parse(OrderBody, req.body);

  const order = await prisma.$transaction(async (tx) => {
    // Re-price inside the transaction from current database values.
    const quote = await quoteCart(
      {
        items: body.items,
        couponCode: body.couponCode,
        email: body.email,
        shippingMethodId: body.shippingMethodId,
      },
      tx,
    );

    // Same principle as coupons: never quietly swap the delivery option (and
    // its price) the shopper picked.
    if (!quote.shipping) throw conflict("Delivery isn't available right now — please try again later");
    if (body.shippingMethodId && quote.shipping.id !== body.shippingMethodId) {
      throw conflict("That delivery option is no longer available — please choose another");
    }

    // A code that was entered but no longer applies must not silently vanish
    // from an order the customer believes is discounted.
    if (body.couponCode && !quote.coupon) {
      throw conflict(quote.couponError ?? "That code can no longer be applied");
    }

    // Reserve stock. The conditional update is race-safe: if two shoppers take
    // the last unit at once, only one update matches `stock >= qty`.
    //
    // TODO(payments): online orders reserve stock while PENDING. When Razorpay
    // lands, release it on payment failure or after an expiry window.
    const qtyByProduct = new Map<string, number>();
    for (const l of quote.lines) {
      qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
    }
    for (const [productId, qty] of qtyByProduct) {
      const { count } = await tx.product.updateMany({
        where: { id: productId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (count === 0) throw conflict("An item in your cart just sold out");
    }

    if (quote.coupon) {
      const coupon = await tx.coupon.findUniqueOrThrow({ where: { code: quote.coupon.code } });
      const { count } = await tx.coupon.updateMany({
        where: {
          id: coupon.id,
          ...(coupon.usageLimit != null ? { usedCount: { lt: coupon.usageLimit } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (count === 0) throw conflict("That code has just reached its usage limit");
    }

    const customer = await tx.customer.upsert({
      where: { email: body.email },
      update: { phone: body.phone },
      create: { email: body.email, name: body.name, phone: body.phone },
    });

    // COD needs no payment step, so it is confirmed immediately. Online
    // methods wait in PENDING until the payment gateway confirms.
    const isCod = body.paymentMethod === "COD";
    const status = isCod ? "CONFIRMED" : "PENDING";

    return tx.order.create({
      data: {
        number: await uniqueOrderNumber(tx),
        email: body.email,
        status,
        paymentStatus: "PENDING",
        paymentMethod: body.paymentMethod,
        subtotalPaise: quote.subtotalPaise,
        discountPaise: quote.discountPaise,
        shippingPaise: quote.shippingPaise,
        taxPaise: quote.taxPaise,
        totalPaise: quote.totalPaise,
        couponCode: quote.coupon?.code,
        shippingMethod: quote.shipping.name,
        shippingEta: quote.shipping.eta,
        shipName: body.name,
        shipPhone: body.phone,
        shipLine1: body.shipping.line1,
        shipLine2: body.shipping.line2,
        shipCity: body.shipping.city,
        shipState: body.shipping.state,
        shipPincode: body.shipping.pincode,
        customerId: customer.id,
        items: {
          create: quote.lines.map((l) => ({
            productId: l.productId,
            productName: l.name,
            sku: l.sku,
            shadeName: l.shadeName,
            unitPricePaise: l.unitPricePaise,
            quantity: l.quantity,
            lineTotalPaise: l.lineTotalPaise,
          })),
        },
        events: {
          create: {
            status,
            note: isCod ? "Order confirmed — cash on delivery" : "Awaiting payment",
          },
        },
      },
      include: { items: { include: { product: { select: { slug: true } } } } },
    });
  });

  // Confirmation to the shopper and an alert to the team, sent after this
  // response so a slow or failing email can never affect the order.
  afterResponse(async () => {
    const { store, notifications: n } = await mailContext();
    const emails: Email[] = [];
    if (n.orderConfirmation) emails.push(orderConfirmation(order, store));
    if (n.alertNewOrder) emails.push(...n.alertRecipients.map((to) => alertNewOrder(order, store, to)));
    return emails;
  });

  res.status(201).json({
    data: {
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotalPaise: order.subtotalPaise,
      discountPaise: order.discountPaise,
      shippingPaise: order.shippingPaise,
      taxPaise: order.taxPaise,
      totalPaise: order.totalPaise,
      couponCode: order.couponCode,
      shippingMethod: order.shippingMethod,
      shippingEta: order.shippingEta,
      placedAt: order.placedAt,
      items: order.items.map((i) => ({
        slug: i.product?.slug ?? null,
        name: i.productName,
        shade: i.shadeName,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise,
        lineTotalPaise: i.lineTotalPaise,
      })),
    },
  });
});

const TrackQuery = z.object({
  number: z.string().trim().toUpperCase(),
  email: z.email().transform((e) => e.toLowerCase()),
});

/**
 * Requires BOTH the order number and the email on it. Order numbers are short
 * and guessable; pairing them with the email stops anyone enumerating other
 * customers' orders and addresses.
 */
checkoutRouter.get("/orders/track", async (req, res) => {
  const q = parse(TrackQuery, req.query);
  const order = await prisma.order.findFirst({
    where: { number: q.number, email: q.email },
    include: {
      items: { include: { product: { select: { slug: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  // Same response for "no such order" and "wrong email", so the endpoint
  // can't be used to confirm which order numbers exist.
  if (!order) throw notFound("Order");

  res.json({
    data: {
      number: order.number,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      placedAt: order.placedAt,
      subtotalPaise: order.subtotalPaise,
      discountPaise: order.discountPaise,
      shippingPaise: order.shippingPaise,
      totalPaise: order.totalPaise,
      couponCode: order.couponCode,
      shippingMethod: order.shippingMethod,
      shippingEta: order.shippingEta,
      shipping: {
        name: order.shipName,
        city: order.shipCity,
        state: order.shipState,
        pincode: order.shipPincode,
      },
      items: order.items.map((i) => ({
        // null once the product has been deleted; the snapshot name remains.
        slug: i.product?.slug ?? null,
        name: i.productName,
        shade: i.shadeName,
        quantity: i.quantity,
        lineTotalPaise: i.lineTotalPaise,
      })),
      events: order.events.map((e) => ({ status: e.status, note: e.note, at: e.createdAt })),
    },
  });
});
