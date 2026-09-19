import type { Coupon, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { applyBps, formatInr, inclusiveTax } from "./money.js";
import { badRequest, conflict } from "./http.js";

/**
 * SERVER-AUTHORITATIVE PRICING.
 *
 * The storefront computes totals in the browser for display, but those numbers
 * are editable by anyone with devtools. Every price, discount, shipping charge
 * and total that ends up on an order is recomputed here from the database.
 * The client only ever sends *what* it wants and *how many*.
 */

export type CartLineInput = { slug: string; quantity: number; shade?: string | null };

export type QuotedLine = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  shadeName: string | null;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
};

export type Quote = {
  lines: QuotedLine[];
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  /** GST already inside the total — prices are tax-inclusive. */
  taxPaise: number;
  totalPaise: number;
  coupon: { code: string; type: Coupon["type"] } | null;
  couponError: string | null;
  /** The shipping method this quote is priced with; null if none is enabled. */
  shipping: { id: string; name: string; eta: string } | null;
  /** Every enabled method, priced for this cart, for the checkout to offer. */
  shippingOptions: ShippingOption[];
};

export type ShippingOption = {
  id: string;
  name: string;
  eta: string;
  /** What this cart would pay for it — 0 when it qualifies as free. */
  pricePaise: number;
  freeAbovePaise: number | null;
};

const GST_BPS = 1800;

type Db = Prisma.TransactionClient | typeof prisma;

export async function quoteCart(
  input: {
    items: CartLineInput[];
    couponCode?: string | null;
    email?: string | null;
    /** The method picked at checkout. Unknown or disabled → the default. */
    shippingMethodId?: string | null;
  },
  db: Db = prisma,
): Promise<Quote> {
  if (input.items.length === 0) throw badRequest("Cart is empty");

  // Merge duplicate lines (same product + shade) before touching the database.
  const merged = new Map<string, CartLineInput>();
  for (const item of input.items) {
    const key = `${item.slug}::${item.shade ?? ""}`;
    const prev = merged.get(key);
    merged.set(key, prev ? { ...prev, quantity: prev.quantity + item.quantity } : { ...item });
  }

  const slugs = [...new Set([...merged.values()].map((i) => i.slug))];
  const products = await db.product.findMany({
    where: { slug: { in: slugs } },
    include: { shades: true },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: QuotedLine[] = [];
  const demand = new Map<string, number>(); // productId → total qty across shades

  for (const item of merged.values()) {
    const product = bySlug.get(item.slug);
    if (!product) throw badRequest(`Unknown product: ${item.slug}`);
    if (product.status !== "ACTIVE") {
      throw conflict(`${product.name} is not available for purchase`);
    }

    let shadeName: string | null = null;
    if (product.shades.length > 0) {
      const shade = item.shade
        ? product.shades.find((s) => s.name === item.shade || s.code === item.shade)
        : undefined;
      if (!shade) throw badRequest(`Choose a valid shade for ${product.name}`);
      shadeName = shade.name;
    }

    demand.set(product.id, (demand.get(product.id) ?? 0) + item.quantity);

    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      shadeName,
      unitPricePaise: product.pricePaise,
      quantity: item.quantity,
      lineTotalPaise: product.pricePaise * item.quantity,
    });
  }

  for (const [productId, qty] of demand) {
    const product = products.find((p) => p.id === productId)!;
    if (product.stock < qty) {
      throw conflict(
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} of ${product.name} left in stock`,
      );
    }
  }

  const subtotalPaise = lines.reduce((n, l) => n + l.lineTotalPaise, 0);
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  // ── Coupon ──
  // An invalid code does not fail the quote; the cart still prices, and the
  // reason is returned so the storefront can show it next to the input.
  let discountPaise = 0;
  let freeShipping = false;
  let coupon: Quote["coupon"] = null;
  let couponError: string | null = null;

  if (input.couponCode) {
    const result = await evaluateCoupon(input.couponCode, subtotalPaise, input.email ?? null, db);
    if (result.ok) {
      coupon = { code: result.coupon.code, type: result.coupon.type };
      discountPaise = result.discountPaise;
      freeShipping = result.coupon.type === "FREE_SHIPPING";
    } else {
      couponError = result.reason;
    }
  }

  // ── Shipping ── every enabled method, in admin order; the first is the
  // default. A method is free once the post-discount subtotal reaches its own
  // threshold, and a free-shipping coupon waives whichever one is chosen.
  const methods = await db.shippingMethod.findMany({
    where: { isEnabled: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const afterDiscount = subtotalPaise - discountPaise;
  const shippingOptions: ShippingOption[] = methods.map((m) => ({
    id: m.id,
    name: m.name,
    eta: m.eta,
    pricePaise:
      freeShipping || (m.freeAbovePaise != null && afterDiscount >= m.freeAbovePaise) ? 0 : m.pricePaise,
    freeAbovePaise: m.freeAbovePaise,
  }));
  const chosen =
    shippingOptions.find((o) => o.id === input.shippingMethodId) ?? shippingOptions[0] ?? null;
  const shippingPaise = chosen?.pricePaise ?? 0;

  const totalPaise = afterDiscount + shippingPaise;

  return {
    lines,
    itemCount,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise: inclusiveTax(afterDiscount, GST_BPS),
    totalPaise,
    coupon,
    couponError,
    shipping: chosen && { id: chosen.id, name: chosen.name, eta: chosen.eta },
    shippingOptions,
  };
}

type CouponResult =
  | { ok: true; coupon: Coupon; discountPaise: number }
  | { ok: false; reason: string };

async function evaluateCoupon(
  rawCode: string,
  subtotalPaise: number,
  email: string | null,
  db: Db,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  const coupon = await db.coupon.findUnique({ where: { code } });
  const now = new Date();

  if (!coupon || !coupon.isActive) return { ok: false, reason: "That code is not valid" };
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, reason: "That code is not active yet" };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, reason: "That code has expired" };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, reason: "That code has reached its usage limit" };
  }
  if (subtotalPaise < coupon.minOrderPaise) {
    return {
      ok: false,
      reason: `Add ${formatInr(coupon.minOrderPaise - subtotalPaise)} more to use this code`,
    };
  }

  if (coupon.firstOrderOnly && email) {
    // A previous order counts once it's real: paid online, or cash on delivery
    // that wasn't cancelled (COD stays unpaid until the courier collects, so
    // checking payment alone would let the code be reused on every COD order).
    // Abandoned online checkouts that were never paid don't count.
    const previous = await db.order.count({
      where: {
        email: email.toLowerCase(),
        OR: [{ paymentStatus: "PAID" }, { paymentMethod: "COD", status: { not: "CANCELLED" } }],
      },
    });
    if (previous > 0) return { ok: false, reason: "That code is for first orders only" };
  }

  let discountPaise = 0;
  if (coupon.type === "PERCENTAGE") discountPaise = applyBps(subtotalPaise, coupon.value);
  if (coupon.type === "FIXED") discountPaise = Math.min(coupon.value, subtotalPaise);

  return { ok: true, coupon, discountPaise };
}
