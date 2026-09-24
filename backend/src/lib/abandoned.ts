import { prisma } from "../db.js";

/**
 * Online orders reserve stock the moment they're placed, before the payment
 * goes through — otherwise two people could pay for the last jar at once. A
 * shopper who closes the payment window would hold that stock for good, so
 * anything still unpaid after the window below is cancelled and the units go
 * back on the shelf.
 *
 * Cash on delivery is never touched: it's confirmed at once and owes nothing.
 */

const MINUTES = 30;

export async function releaseAbandonedOrders(now = new Date()) {
  const stale = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: { not: "COD" },
      placedAt: { lt: new Date(now.getTime() - MINUTES * 60_000) },
    },
    include: { items: true },
  });

  let released = 0;
  for (const order of stale) {
    // Conditional update: if the payment lands in this very moment, the order
    // is no longer PENDING and nothing is cancelled or returned to stock.
    const done = await prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING", paymentStatus: "PENDING" },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      if (count === 0) return false;
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          note: `Payment wasn't completed within ${MINUTES} minutes`,
        },
      });
      return true;
    });
    if (done) released += 1;
  }
  return released;
}

/**
 * How long a copy of each email is kept for the admin's Email Log. Long
 * enough to answer "did they get it?" about an old order, short enough that
 * the store isn't holding customers' names and addresses for ever.
 */
const EMAIL_LOG_DAYS = 180;

export async function purgeOldEmails(now = new Date()) {
  const { count } = await prisma.emailLog.deleteMany({
    where: { createdAt: { lt: new Date(now.getTime() - EMAIL_LOG_DAYS * 24 * 60 * 60_000) } },
  });
  return count;
}

/** Runs the housekeeping every few minutes for as long as the server is up. */
export function startAbandonedSweep() {
  const run = () => {
    releaseAbandonedOrders().catch((err) => console.error("Abandoned-order sweep failed:", err));
    purgeOldEmails().catch((err) => console.error("Email log purge failed:", err));
  };
  run();
  return setInterval(run, 5 * 60_000).unref();
}
