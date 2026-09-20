import type { Prisma } from "../generated/prisma/client.js";

/**
 * Orders that represent real, kept revenue — shared by the dashboard and the
 * reports so every figure in the admin counts the same orders. Unpaid online
 * orders (PENDING), cancellations and refunds are left out.
 */
export const REVENUE: Prisma.OrderWhereInput = {
  status: { notIn: ["PENDING", "CANCELLED", "REFUNDED"] },
};

/** Percentage change, or null when there is no prior period to compare to. */
export const delta = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;

/** First day of the month, `months` months back, at local midnight. */
export function monthsAgo(months: number, from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth() - months, 1);
}
