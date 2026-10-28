import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../db.js";

/** Return window in days after which referrals qualify to move from PENDING to APPROVED. */
export const RETURN_WINDOW_DAYS = 14;

/**
 * Generates a clean, human-readable referral code.
 * Format: First name in uppercase alphanumeric (3 to 8 chars) + 4 random uppercase chars.
 * Avoids ambiguous characters (0, O, 1, I).
 * Example: "PRIYA7M2K", "ALEX9H3R"
 */
export function generateReferralCode(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] || "CREATOR";
  const clean = firstWord.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
  const prefix = clean.length >= 3 ? clean : "VEL";

  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return `${prefix}${suffix}`;
}

/**
 * Retries on collision up to 10 times, falling back to a timestamp suffix if needed.
 */
export async function getUniqueReferralCode(
  name: string,
  tx: Prisma.TransactionClient,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode(name);
    const existing = await tx.collaborator.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return `${generateReferralCode(name)}${Date.now().toString(36).toUpperCase().slice(-3)}`;
}

/**
 * Moves referrals from PENDING to APPROVED after the return window has elapsed,
 * provided the order was not cancelled or refunded.
 */
export async function approveEligibleReferrals(now = new Date()) {
  const cutoff = new Date(now.getTime() - RETURN_WINDOW_DAYS * 24 * 60 * 60_000);

  // Return window is counted strictly from the delivered date.
  // Order must be DELIVERED, have a DELIVERED event before the cutoff,
  // and have no refunded returns.
  const pendingReferrals = await prisma.referral.findMany({
    where: {
      status: "PENDING",
      order: {
        status: "DELIVERED",
        returns: {
          none: {
            status: "REFUNDED",
          },
        },
      },
    },
    include: {
      order: {
        select: {
          id: true,
          events: {
            where: { status: "DELIVERED" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const eligibleIds = pendingReferrals
    .filter((r) => {
      const deliveredEvent = r.order.events[0];
      return deliveredEvent && deliveredEvent.createdAt < cutoff;
    })
    .map((r) => r.id);

  if (eligibleIds.length === 0) return 0;

  const { count } = await prisma.referral.updateMany({
    where: {
      id: { in: eligibleIds },
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
    },
  });

  return count;
}

/**
 * Starts a scheduled job running periodically (every 10 minutes)
 * to approve eligible referrals past the return window.
 */
export function startReferralApprovalSweep() {
  const run = () => {
    approveEligibleReferrals().catch((err) =>
      console.error("Referral approval sweep error:", err),
    );
  };
  run();
  return setInterval(run, 10 * 60_000).unref();
}

