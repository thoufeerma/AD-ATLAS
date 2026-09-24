import { Router } from "express";
import { randomInt } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { gstInside, quoteCart } from "../../lib/pricing.js";
import { findState, stateForGstin } from "../../lib/gst.js";
import { invoiceLink, taxSettings } from "../../lib/invoices.js";
import {
  createGatewayOrder,
  gatewayStatus,
  paymentSignature,
  simulating,
  verifyPaymentSignature,
} from "../../lib/payments.js";
import { readPayments } from "../../lib/settings.js";
import { badRequest, conflict, notFound, param, parse } from "../../lib/http.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { AddressFields, IndianMobile } from "../../lib/validate.js";
import { currentCustomer } from "../../lib/customerAuth.js";
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

const OrderBody = z.object({
  items: z.array(CartItem).min(1).max(50),
  couponCode: z.string().trim().max(40).nullish(),
  email: z.email().transform((e) => e.toLowerCase()),
  name: z.string().trim().min(2).max(100),
  phone: IndianMobile,
  shipping: AddressFields,
  paymentMethod: z.enum(["UPI", "CARD", "NETBANKING", "WALLET", "COD"]),
  shippingMethodId: z.string().max(40).nullish(),
  /** Signed-in shoppers can keep this address for next time. */
  saveAddress: z.boolean().optional(),
});

/** The methods a shopper may choose right now: the admin's switches, and for
 * the online ones a connected gateway. */
async function payableMethods() {
  const row = await prisma.setting.findUnique({ where: { key: "payments" } });
  const chosen = readPayments(row?.value);
  const online = gatewayStatus().connected;
  const methods: OrderBodyMethod[] = [];
  if (chosen.cod) methods.push("COD");
  if (online) {
    if (chosen.upi) methods.push("UPI");
    if (chosen.card) methods.push("CARD");
    if (chosen.netbanking) methods.push("NETBANKING");
    if (chosen.wallet) methods.push("WALLET");
  }
  return methods;
}

type OrderBodyMethod = z.infer<typeof OrderBody>["paymentMethod"];

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
const orderLimit = rateLimit({ name: "order", max: 30, windowMs: 10 * 60_000 });

checkoutRouter.post("/orders", orderLimit, async (req, res) => {
  const body = parse(OrderBody, req.body);

  // A method the store doesn't offer (or can't take yet) must never quietly
  // become something else — the shopper picked how they want to pay.
  const offered = await payableMethods();
  if (!offered.includes(body.paymentMethod)) {
    const message =
      body.paymentMethod === "COD"
        ? "Cash on delivery isn't available at the moment"
        : "That payment method isn't available at the moment — please choose another";
    throw conflict(message, { offered });
  }

  // Signed in: the order belongs to the account, so it uses the account's email.
  const session = await currentCustomer(req);
  if (session && body.email !== session.customer.email) {
    const message = `You're signed in as ${session.customer.email}. Use that email, or sign out to check out with another.`;
    throw badRequest(message, [{ path: "email", message }]);
  }

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

    // "Save this address" — only for the signed-in account, never a guest
    // record, and not if it's already saved.
    if (session && body.saveAddress) {
      const s = body.shipping;
      const saved = await tx.address.findMany({ where: { customerId: customer.id } });
      const duplicate = saved.some(
        (a) => a.line1.toLowerCase() === s.line1.toLowerCase() && a.pincode === s.pincode,
      );
      if (!duplicate && saved.length < 10) {
        await tx.address.create({
          data: {
            customerId: customer.id,
            fullName: body.name,
            phone: body.phone,
            line1: s.line1,
            line2: s.line2 ?? null,
            city: s.city,
            state: s.state,
            pincode: s.pincode,
            isDefault: saved.length === 0,
          },
        });
      }
    }

    // COD needs no payment step, so it is confirmed immediately. Online
    // methods wait in PENDING until the payment gateway confirms.
    const isCod = body.paymentMethod === "COD";
    const status = isCod ? "CONFIRMED" : "PENDING";

    // Now the delivery state is known, the GST splits the way the invoice
    // will: within the seller's registered state or across states.
    const { gstin } = await taxSettings(tx);
    const sellerState = gstin ? stateForGstin(gstin) : null;
    const interState = !sellerState || sellerState.code !== findState(body.shipping.state)?.code;

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
        taxPaise: gstInside({ ...quote, interState }),
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
            hsnCode: l.hsnCode,
            gstRateBps: l.gstRateBps,
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

  // Online payment: the gateway needs an order of its own for the browser to
  // pay against. Done after the transaction, so a slow gateway can't hold
  // database locks; the order simply stays unpaid if this fails.
  let payment: PaymentHandoff | null = null;
  if (order.paymentMethod !== "COD") {
    const gateway = await createGatewayOrder({
      amountPaise: order.totalPaise,
      receipt: order.number,
      email: order.email,
    });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: gateway.id } });
    payment = {
      gateway: "razorpay",
      keyId: gatewayStatus().keyId!,
      gatewayOrderId: gateway.id,
      amountPaise: order.totalPaise,
      prefill: { name: order.shipName, email: order.email, contact: order.shipPhone },
      // Development without Razorpay keys: the storefront shows its own
      // stand-in instead of opening the gateway.
      simulated: simulating,
    };
  }

  // Confirmation to the shopper and an alert to the team, sent after this
  // response so a slow or failing email can never affect the order. An online
  // order isn't confirmed yet, so its emails wait for the payment.
  if (order.paymentMethod === "COD") afterResponse(() => orderEmails(order.id));

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
      // Present for online payments: what the browser needs to open Razorpay.
      payment,
    },
  });
});

/** What the storefront needs to open Razorpay Checkout. */
type PaymentHandoff = {
  gateway: "razorpay";
  keyId: string;
  gatewayOrderId: string;
  amountPaise: number;
  prefill: { name: string; email: string; contact: string };
  simulated: boolean;
};

/** The confirmation and team alert for an order, once it counts as placed. */
export async function orderEmails(orderId: string): Promise<Email[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return [];
  const { store, notifications: n } = await mailContext();
  const emails: Email[] = [];
  if (n.orderConfirmation) emails.push(orderConfirmation(order, store));
  if (n.alertNewOrder) emails.push(...n.alertRecipients.map((to) => alertNewOrder(order, store, to)));
  return emails;
}

const PaymentBody = z.object({
  paymentId: z.string().trim().min(3).max(120),
  signature: z.string().trim().min(16).max(256),
});

// A shopper pays once, and may retry a couple of times.
const payLimit = rateLimit({ name: "payment", max: 30, windowMs: 10 * 60_000 });

/**
 * The browser reports a completed payment. The signature is Razorpay's proof:
 * only the holder of the key secret could have produced it for this gateway
 * order and payment, so nobody can mark their own order paid. The webhook does
 * the same check independently, in case the tab is closed on the way back.
 */
checkoutRouter.post("/orders/:number/payment", payLimit, async (req, res) => {
  const body = parse(PaymentBody, req.body);
  const order = await prisma.order.findUnique({ where: { number: param(req, "number") } });
  if (!order) throw notFound("Order");
  if (order.paymentStatus === "PAID") {
    res.json({ data: { number: order.number, status: order.status, paymentStatus: order.paymentStatus } });
    return;
  }
  if (!order.razorpayOrderId) throw conflict("This order isn't waiting for an online payment");
  if (order.status === "CANCELLED") throw conflict("This order was cancelled — please place it again");
  if (!verifyPaymentSignature(order.razorpayOrderId, body.paymentId, body.signature)) {
    throw badRequest("We couldn't verify that payment. If money has left your account, contact us and we'll sort it out.");
  }

  const paid = await markPaid(order.id, body.paymentId);
  afterResponse(() => orderEmails(order.id));
  res.json({ data: { number: paid.number, status: paid.status, paymentStatus: paid.paymentStatus } });
});

/**
 * DEVELOPMENT ONLY. Hands back what the gateway would have handed back, so
 * the rest of the path — the signature check, the emails, the order becoming
 * confirmed — is the real one. Absent as soon as Razorpay keys exist, and
 * never present in production.
 */
checkoutRouter.post("/orders/:number/payment/simulate", async (req, res) => {
  if (!simulating) throw notFound("Route");
  const order = await prisma.order.findUnique({ where: { number: param(req, "number") } });
  if (!order?.razorpayOrderId) throw notFound("Order");
  const paymentId = `pay_sim${randomInt(1e9, 1e10 - 1)}`;
  res.json({
    data: { paymentId, signature: paymentSignature(order.razorpayOrderId, paymentId) },
  });
});

/**
 * Records a successful payment once. Safe to call twice — the second call
 * finds the order already paid and changes nothing.
 */
export async function markPaid(orderId: string, paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: paymentId },
    });
    if (count > 0) {
      await tx.orderEvent.create({
        data: { orderId, status: "CONFIRMED", note: "Payment received" },
      });
    }
    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}

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
      creditNotes: { orderBy: { issuedAt: "asc" }, select: { id: true, number: true, issuedAt: true, totalPaise: true } },
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
      // Filled in when the order ships; the courier's own tracking page.
      tracking: order.trackingNumber
        ? { courier: order.courierName, number: order.trackingNumber, url: order.trackingUrl }
        : null,
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
      // Signed links to the GST invoice and any credit notes, once it has one.
      invoice: await invoiceLink(order),
    },
  });
});
