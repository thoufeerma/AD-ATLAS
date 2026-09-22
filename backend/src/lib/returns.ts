import { randomInt } from "node:crypto";
import type { Prisma, ReturnStatus } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { readReturns, type ReturnSettings } from "./settings.js";

/**
 * The rules behind returns, in one place so the storefront, the API and the
 * admin all agree on what may be sent back and until when.
 */

/** Requests still being worked on — only one of these may be open per order. */
export const OPEN_STATUSES: ReturnStatus[] = ["REQUESTED", "APPROVED", "RECEIVED"];

/** Statuses that hold an item back from being asked for again. */
const COUNTS_AGAINST: ReturnStatus[] = [...OPEN_STATUSES, "REFUNDED"];

export async function returnSettings(): Promise<ReturnSettings> {
  const row = await prisma.setting.findUnique({ where: { key: "returns" } });
  return readReturns(row?.value);
}

/** RT + YYMMDD + 4 digits, e.g. RT2609201234 — like an order number. */
function makeNumber() {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  return `RT${ymd}${String(randomInt(0, 10_000)).padStart(4, "0")}`;
}

export async function uniqueReturnNumber(tx: Prisma.TransactionClient) {
  for (let i = 0; i < 8; i++) {
    const number = makeNumber();
    if (!(await tx.returnRequest.findUnique({ where: { number }, select: { id: true } }))) return number;
  }
  throw new Error("Couldn't allocate a return number");
}

/** The day the order was handed over, or null if it hasn't been. */
export function deliveredAt(events: { status: ReturnStatus | string; createdAt: Date }[]) {
  const delivered = events.filter((e) => e.status === "DELIVERED").map((e) => e.createdAt);
  return delivered.length ? new Date(Math.max(...delivered.map((d) => d.getTime()))) : null;
}

/** Last day the customer may ask, counted from delivery. */
export function windowClosesAt(delivered: Date, settings: ReturnSettings) {
  const end = new Date(delivered);
  end.setDate(end.getDate() + settings.windowDays);
  return end;
}

type OrderForReturns = {
  status: string;
  events: { status: string; createdAt: Date }[];
  returns: { status: ReturnStatus; items: { orderItemId: string; quantity: number }[] }[];
  items: { id: string; quantity: number }[];
};

/**
 * Whether this order can be returned right now, and how much of each item is
 * still returnable. The same answer drives the button on the storefront and
 * the check when a request is submitted.
 */
export function returnability(order: OrderForReturns, settings: ReturnSettings, now = new Date()) {
  const claimed = new Map<string, number>();
  for (const r of order.returns) {
    if (!COUNTS_AGAINST.includes(r.status)) continue;
    for (const i of r.items) claimed.set(i.orderItemId, (claimed.get(i.orderItemId) ?? 0) + i.quantity);
  }
  const remaining = new Map(order.items.map((i) => [i.id, i.quantity - (claimed.get(i.id) ?? 0)]));
  const delivered = deliveredAt(order.events);
  const closesAt = delivered ? windowClosesAt(delivered, settings) : null;
  const openRequest = order.returns.some((r) => OPEN_STATUSES.includes(r.status));

  const reason = !settings.accepted
    ? "Returns aren't being accepted at the moment."
    : order.status !== "DELIVERED"
      ? "You can ask for a return once the order has been delivered."
      : !delivered || !closesAt
        ? "We don't have a delivery date for this order yet — please contact us."
        : now > closesAt
          ? `The ${settings.windowDays}-day return window for this order has closed.`
          : openRequest
            ? "There's already a return being handled for this order."
            : [...remaining.values()].every((n) => n <= 0)
              ? "Everything in this order has already been returned."
              : null;

  return {
    canRequest: reason === null,
    reason,
    closesAt,
    /** Item id → how many of it may still be sent back. */
    remaining,
  };
}
