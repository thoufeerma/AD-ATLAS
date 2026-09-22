import { SignJWT, jwtVerify } from "jose";
import type { Order, OrderItem, OrderStatus, Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { conflict } from "./http.js";
import { readStore, readTax } from "./settings.js";
import { financialYear, findState, stateForGstin, taxLines, type GstState } from "./gst.js";

/**
 * GST tax invoices. An order gets one when it ships (or earlier, from the
 * admin, to pack it with the parcel), numbered PREFIX/2627/00001 in sequence
 * within each financial year. The invoice itself isn't stored: it's rendered
 * from the order's own snapshots plus the seller details saved on the day it
 * was issued, so it reads the same every time it's opened.
 */

type Db = Prisma.TransactionClient | typeof prisma;

export async function taxSettings(db: Db = prisma) {
  const row = await db.setting.findUnique({ where: { key: "tax" } });
  return readTax(row?.value);
}

/**
 * The next number in a series for the current financial year, e.g. 7 for the
 * seventh invoice of 2026-27. Runs inside the caller's transaction: if that
 * rolls back, so does the count, so no number is ever skipped or reused.
 */
export async function nextNumber(tx: Prisma.TransactionClient, series: "INV" | "CN", at: Date) {
  const fy = financialYear(at);
  const { lastNumber } = await tx.documentSequence.upsert({
    where: { series: `${series}-${fy}` },
    create: { series: `${series}-${fy}`, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return { fy, serial: String(lastNumber).padStart(5, "0") };
}

/** Placed and not called off. Unpaid online orders and cancelled ones don't get one. */
export const invoiceable = (status: OrderStatus) => status !== "PENDING" && status !== "CANCELLED";

/** The seller as printed on an invoice, frozen when it was issued. */
export type InvoiceSeller = {
  legalName: string;
  tradeName: string;
  gstin: string;
  address: string;
  stateName: string;
  stateCode: string;
  email: string;
  phone: string;
};

/**
 * Gives the order its invoice number, inside the caller's transaction. The
 * number comes from the financial year's counter, and the order is only
 * updated if it still has none — so two people clicking at once can't burn a
 * number (the loser's transaction rolls back, counter and all).
 */
export async function issueInvoice(tx: Prisma.TransactionClient, order: Order) {
  if (order.invoiceNumber) return order;
  if (!invoiceable(order.status)) {
    throw conflict("Invoices are for confirmed orders — not ones awaiting payment or cancelled");
  }
  const tax = await taxSettings(tx);
  if (!tax.gstin) throw conflict("Add your GSTIN under Settings → Tax before creating invoices");
  if (!findState(order.shipState)) {
    throw conflict(`"${order.shipState}" isn't a state we recognise, so the GST can't be split correctly`);
  }

  const storeRow = await tx.setting.findUnique({ where: { key: "store" } });
  const store = readStore(storeRow?.value);
  const sellerState = stateForGstin(tax.gstin)!;
  const seller: InvoiceSeller = {
    legalName: tax.legalName,
    tradeName: store.name ?? "Velastia",
    gstin: tax.gstin,
    address: tax.address,
    stateName: sellerState.name,
    stateCode: sellerState.code,
    email: store.supportEmail ?? "",
    phone: store.supportPhone ?? "",
  };

  const now = new Date();
  const { fy, serial } = await nextNumber(tx, "INV", now);
  const invoiceNumber = `${tax.invoicePrefix}/${fy}/${serial}`;

  const { count } = await tx.order.updateMany({
    where: { id: order.id, invoiceNumber: null },
    data: { invoiceNumber, invoicedAt: now, invoiceSeller: seller },
  });
  if (count === 0) throw conflict("This order's invoice was created a moment ago — reload the page");
  return tx.order.findUniqueOrThrow({ where: { id: order.id } });
}

/** Whether an order moving to `status` should be invoiced on the way. */
export async function invoiceOnShipping(tx: Prisma.TransactionClient, order: Order, status: OrderStatus) {
  if (status !== "SHIPPED" || order.invoiceNumber) return false;
  // An order from before states were checked may name one we can't place;
  // it still ships, and the invoice can be sorted out from the admin.
  if (!findState(order.shipState)) return false;
  return Boolean((await taxSettings(tx)).gstin);
}

/* ── Reading an invoice ── */

export type InvoiceView = ReturnType<typeof invoiceView>;

/** Everything the printed invoice shows, worked out from the order. Null if it has none. */
export function invoiceView(order: Order & { items: OrderItem[] }) {
  if (!order.invoiceNumber || !order.invoicedAt || !order.invoiceSeller) return null;
  const seller = order.invoiceSeller as InvoiceSeller;
  const placeOfSupply: GstState | null = findState(order.shipState);
  // Unrecognised states are only possible on orders from before they were
  // checked; IGST is the safe reading, as the seller's state would match.
  const interState = !placeOfSupply || placeOfSupply.code !== seller.stateCode;
  const { lines, totals } = taxLines(order, interState);
  return {
    number: order.invoiceNumber,
    issuedAt: order.invoicedAt,
    seller,
    order,
    placeOfSupply,
    interState,
    lines,
    totals,
  };
}

/* ── Links for customers ──
 * Guests prove an order is theirs with its number and email, which can't go
 * in a link that ends up in browser history. So the pages that have already
 * checked (Track Order, the account) hand out signed links to that order's
 * invoice and credit notes, good for a day.
 */

const secret = new TextEncoder().encode(env.JWT_SECRET);
const LINK_HOURS = 24;

type LinkedOrder = Pick<Order, "id" | "number" | "invoiceNumber" | "invoicedAt"> & {
  creditNotes?: { id: string; number: string; issuedAt: Date; totalPaise: number }[];
};

export async function invoiceLink(order: LinkedOrder) {
  if (!order.invoiceNumber || !order.invoicedAt) return null;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("invoice")
    .setSubject(order.id)
    .setIssuedAt()
    .setExpirationTime(`${LINK_HOURS}h`)
    .sign(secret);
  const base = `/api/v1/orders/${encodeURIComponent(order.number)}`;
  return {
    number: order.invoiceNumber,
    issuedAt: order.invoicedAt,
    url: `${base}/invoice?t=${token}`,
    // The same signed link opens any document of this order.
    creditNotes: (order.creditNotes ?? []).map((n) => ({
      number: n.number,
      issuedAt: n.issuedAt,
      totalPaise: n.totalPaise,
      url: `${base}/credit-notes/${n.id}?t=${token}`,
    })),
  };
}

/** The order id a link was made for, or null if it's forged or expired. */
export async function readInvoiceLink(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"], audience: "invoice" });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
