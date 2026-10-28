import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest, HttpError, parse, parsePatch, unauthorized } from "../../lib/http.js";
import { currentCustomer } from "../../lib/customerAuth.js";
import { rateLimit } from "../../middleware/rateLimit.js";

export const collaboratorRouter = Router();

const tenMinutes = 10 * 60_000;
const readLimit = rateLimit({ name: "collaborator-read", max: 120, windowMs: tenMinutes });
const updateLimit = rateLimit({ name: "collaborator-update", max: 30, windowMs: tenMinutes });
const redeemLimit = rateLimit({ name: "collaborator-redeem", max: 15, windowMs: tenMinutes });

/** Minimum amount that can be requested for redemption: ₹500 (50,000 paise). */
export const MIN_REDEEM_PAISE = 50_000;

/**
 * Access Control Middleware / Helper:
 * Ensures the user is logged in as a Customer AND has an approved, linked Collaborator profile.
 * Returns 403 Forbidden if not a collaborator.
 */
async function requireCollaborator(req: Request) {
  const session = await currentCustomer(req);
  if (!session) throw unauthorized("Please sign in");

  const collaborator = await prisma.collaborator.findUnique({
    where: { userId: session.customer.id },
  });

  if (!collaborator) {
    throw new HttpError(
      403,
      "NOT_A_COLLABORATOR",
      "You do not have an approved collaborator account linked to this profile.",
    );
  }

  return { customer: session.customer, collaborator };
}

/* ── 1. GET /me/collaborator (Profile) ─────────────────────────────────── */

collaboratorRouter.get("/", readLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);
  res.json({
    data: {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.role,
      handle: collaborator.handle,
      bio: collaborator.bio,
      avatarUrl: collaborator.avatarUrl,
      referralCode: collaborator.referralCode,
      commissionRate: collaborator.commissionRate,
      quote: collaborator.quote,
      createdAt: collaborator.createdAt,
    },
  });
});

const HttpsAvatarUrl = z
  .union([
    z.literal("").transform(() => null),
    z.null(),
    z
      .string()
      .trim()
      .url("Avatar must be a valid URL")
      .refine((u) => u.startsWith("https://"), {
        message: "Avatar URL must use https://",
      })
      .max(500),
  ])
  .optional();

// Only bio, handle, and avatarUrl are permitted to be changed by the collaborator.
// Never userId, referralCode, commissionRate, quote, sortOrder, or id.
const UpdateCollaboratorBody = z.object({
  bio: z.string().trim().max(1000).nullish(),
  handle: z.string().trim().min(1).max(100).nullish(),
  avatarUrl: HttpsAvatarUrl,
});

collaboratorRouter.patch("/", updateLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);
  const data = parsePatch(UpdateCollaboratorBody, req.body);

  const updated = await prisma.collaborator.update({
    where: { id: collaborator.id },
    data: {
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.handle !== undefined ? { handle: data.handle } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    },
  });

  res.json({
    data: {
      id: updated.id,
      name: updated.name,
      role: updated.role,
      handle: updated.handle,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      referralCode: updated.referralCode,
      commissionRate: updated.commissionRate,
      quote: updated.quote,
      createdAt: updated.createdAt,
    },
  });
});

/* ── 3. GET /me/collaborator/stats ─────────────────────────────────────── */

collaboratorRouter.get("/stats", readLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);

  const [referralsGroup, redeemsGroup, clicks] = await Promise.all([
    prisma.referral.groupBy({
      by: ["status"],
      where: { collaboratorId: collaborator.id },
      _count: { _all: true },
      _sum: { commissionPaise: true, orderAmountPaise: true },
    }),
    prisma.redeemRequest.groupBy({
      by: ["status"],
      where: { collaboratorId: collaborator.id },
      _sum: { amountPaise: true },
      _count: { _all: true },
    }),
    prisma.referralClick.count({
      where: { collaboratorId: collaborator.id },
    }),
  ]);

  let orderCount = 0;
  let pendingEarningsPaise = 0;
  let approvedEarningsPaise = 0;
  let reversedEarningsPaise = 0;

  for (const group of referralsGroup) {
    orderCount += group._count._all;
    const sumCommission = group._sum.commissionPaise ?? 0;
    if (group.status === "PENDING") pendingEarningsPaise = sumCommission;
    else if (group.status === "APPROVED") approvedEarningsPaise = sumCommission;
    else if (group.status === "REVERSED") reversedEarningsPaise = sumCommission;
  }

  let requestedRedeemPaise = 0;
  let approvedRedeemPaise = 0;

  for (const group of redeemsGroup) {
    const sumAmount = group._sum.amountPaise ?? 0;
    if (group.status === "REQUESTED") requestedRedeemPaise = sumAmount;
    else if (group.status === "APPROVED") approvedRedeemPaise = sumAmount;
  }

  // Net balance = approved referrals minus requested/approved redeems.
  // Never hide negative balances: if an approved referral was reversed after redemption,
  // the creator carries a deficit that subsequent commissions will offset.
  const netBalancePaise = approvedEarningsPaise - (requestedRedeemPaise + approvedRedeemPaise);
  const availableBalancePaise = Math.max(0, netBalancePaise);

  res.json({
    data: {
      orderCount,
      clicks,
      pendingEarningsPaise,
      approvedEarningsPaise,
      reversedEarningsPaise,
      requestedRedeemPaise,
      approvedRedeemPaise,
      netBalancePaise,
      availableBalancePaise,
      commissionRate: collaborator.commissionRate,
      minRedeemPaise: MIN_REDEEM_PAISE,
    },
  });
});

/* ── 4. GET /me/collaborator/referrals (Paginated) ─────────────────────── */

const ReferralsQuery = z.object({
  take: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

collaboratorRouter.get("/referrals", readLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);
  const { take, skip } = parse(ReferralsQuery, req.query);

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where: { collaboratorId: collaborator.id },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        orderAmountPaise: true,
        commissionPaise: true,
        status: true,
        createdAt: true,
        order: {
          select: {
            number: true,
            placedAt: true,
            status: true,
          },
        },
      },
    }),
    prisma.referral.count({ where: { collaboratorId: collaborator.id } }),
  ]);

  res.json({
    data: referrals.map((r) => ({
      id: r.id,
      orderNumber: r.order.number,
      orderStatus: r.order.status,
      orderAmountPaise: r.orderAmountPaise,
      commissionPaise: r.commissionPaise,
      status: r.status,
      createdAt: r.createdAt,
    })),
    pagination: {
      total,
      take,
      skip,
    },
  });
});

/* ── 5. POST /me/collaborator/redeem & GET /me/collaborator/redeem ───────── */

const RedeemBody = z.object({
  amountPaise: z.number().int().positive("Redeem amount must be a positive integer in paise"),
});

collaboratorRouter.post("/redeem", redeemLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);
  const { amountPaise } = parse(RedeemBody, req.body);

  if (amountPaise < MIN_REDEEM_PAISE) {
    const minRupees = MIN_REDEEM_PAISE / 100;
    throw badRequest(
      "AMOUNT_TOO_LOW",
      `Minimum redeem amount is ₹${minRupees.toLocaleString("en-IN")}.`,
    );
  }

  // Check balance and create the redeem request inside ONE database transaction
  // with an exclusive row lock on the collaborator record to prevent any race conditions.
  const redeemRequest = await prisma.$transaction(async (tx) => {
    // Acquire exclusive row lock on collaborator record to serialize concurrent redemptions
    await tx.$executeRaw`SELECT id FROM collaborators WHERE id = ${collaborator.id} FOR UPDATE`;

    const [approvedReferrals, activeRedeems] = await Promise.all([
      tx.referral.aggregate({
        where: { collaboratorId: collaborator.id, status: "APPROVED" },
        _sum: { commissionPaise: true },
      }),
      tx.redeemRequest.aggregate({
        where: {
          collaboratorId: collaborator.id,
          status: { in: ["REQUESTED", "APPROVED"] },
        },
        _sum: { amountPaise: true },
      }),
    ]);

    const totalApproved = approvedReferrals._sum.commissionPaise ?? 0;
    const totalCommitted = activeRedeems._sum.amountPaise ?? 0;
    const available = totalApproved - totalCommitted;

    if (amountPaise > available) {
      const availRupees = Math.max(0, available) / 100;
      throw badRequest(
        "INSUFFICIENT_BALANCE",
        `Requested ₹${(amountPaise / 100).toLocaleString("en-IN")} exceeds your available balance of ₹${availRupees.toLocaleString("en-IN")}.`,
      );
    }

    return tx.redeemRequest.create({
      data: {
        collaboratorId: collaborator.id,
        amountPaise,
        status: "REQUESTED",
      },
    });
  });

  res.status(201).json({ data: redeemRequest });
});

collaboratorRouter.get("/redeem", readLimit, async (req, res) => {
  const { collaborator } = await requireCollaborator(req);

  const history = await prisma.redeemRequest.findMany({
    where: { collaboratorId: collaborator.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({ data: history });
});
