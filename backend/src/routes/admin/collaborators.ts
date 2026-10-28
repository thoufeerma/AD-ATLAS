import { Router } from "express";
import { z } from "zod";
import type { Prisma, RedeemStatus, ReferralStatus } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { badRequest, conflict, forbidden, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";

export const adminCollaboratorsRouter = Router();

const userInclude = { user: { select: { id: true, name: true, email: true } } } as const;

export const HttpsAvatarUrl = z
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

const CollaboratorBody = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(100),
  avatarUrl: HttpsAvatarUrl,
  handle: z.union([z.literal("").transform(() => null), z.string().trim().max(100), z.null()]).optional(),
  bio: z.union([z.literal("").transform(() => null), z.string().trim().max(1000), z.null()]).optional(),
  referralCode: z.union([z.literal("").transform(() => null), z.string().trim().max(50), z.null()]).optional(),
  commissionRate: z.coerce.number().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100%").default(10),
  quote: z.union([z.literal("").transform(() => null), z.string().trim().max(1000), z.null()]).optional(),
  sortOrder: z.coerce.number().int().default(0),
  userId: z.union([z.literal("").transform(() => null), z.string().trim(), z.null()]).optional(),
});

/* ── 1. GET /admin/collaborators (List with full metrics) ─────────────────── */

adminCollaboratorsRouter.get("/", allow(...ROLES.content, ...ROLES.ordersRead), async (_req, res) => {
  const [collaborators, referralsGroup, redeemsGroup, clicksGroup] = await Promise.all([
    prisma.collaborator.findMany({
      orderBy: { sortOrder: "asc" },
      include: userInclude,
    }),
    prisma.referral.groupBy({
      by: ["collaboratorId", "status"],
      _count: { _all: true },
      _sum: { commissionPaise: true, orderAmountPaise: true },
    }),
    prisma.redeemRequest.groupBy({
      by: ["collaboratorId", "status"],
      _sum: { amountPaise: true },
      _count: { _all: true },
    }),
    prisma.referralClick.groupBy({
      by: ["collaboratorId"],
      _count: { _all: true },
    }),
  ]);

  // Index metrics by collaboratorId
  const clicksMap = new Map<string, number>();
  for (const c of clicksGroup) {
    clicksMap.set(c.collaboratorId, c._count._all);
  }

  const referralStatsMap = new Map<
    string,
    { orders: number; pendingPaise: number; approvedPaise: number; reversedPaise: number }
  >();
  for (const r of referralsGroup) {
    const cur = referralStatsMap.get(r.collaboratorId) ?? {
      orders: 0,
      pendingPaise: 0,
      approvedPaise: 0,
      reversedPaise: 0,
    };
    cur.orders += r._count._all;
    const sum = r._sum.commissionPaise ?? 0;
    if (r.status === "PENDING") cur.pendingPaise += sum;
    else if (r.status === "APPROVED") cur.approvedPaise += sum;
    else if (r.status === "REVERSED") cur.reversedPaise += sum;
    referralStatsMap.set(r.collaboratorId, cur);
  }

  const redeemStatsMap = new Map<
    string,
    { requestedPaise: number; approvedPaise: number; rejectedPaise: number }
  >();
  for (const red of redeemsGroup) {
    const cur = redeemStatsMap.get(red.collaboratorId) ?? {
      requestedPaise: 0,
      approvedPaise: 0,
      rejectedPaise: 0,
    };
    const sum = red._sum.amountPaise ?? 0;
    if (red.status === "REQUESTED") cur.requestedPaise += sum;
    else if (red.status === "APPROVED") cur.approvedPaise += sum;
    else if (red.status === "REJECTED") cur.rejectedPaise += sum;
    redeemStatsMap.set(red.collaboratorId, cur);
  }

  const result = collaborators.map((c) => {
    const rStats = referralStatsMap.get(c.id) ?? {
      orders: 0,
      pendingPaise: 0,
      approvedPaise: 0,
      reversedPaise: 0,
    };
    const redStats = redeemStatsMap.get(c.id) ?? {
      requestedPaise: 0,
      approvedPaise: 0,
      rejectedPaise: 0,
    };
    const clicks = clicksMap.get(c.id) ?? 0;
    // Net balance = approved commissions minus requested & approved payouts
    const netBalancePaise = rStats.approvedPaise - (redStats.requestedPaise + redStats.approvedPaise);

    return {
      ...c,
      clicks,
      orders: rStats.orders,
      pendingPaise: rStats.pendingPaise,
      approvedPaise: rStats.approvedPaise,
      reversedPaise: rStats.reversedPaise,
      redeemedPaise: redStats.approvedPaise,
      requestedRedeemPaise: redStats.requestedPaise,
      netBalancePaise,
    };
  });

  res.json({ data: result });
});

/* ── 2. POST /admin/collaborators (Create) ────────────────────────────────── */

adminCollaboratorsRouter.post("/", allow(...ROLES.content), async (req, res) => {
  const data = parse(CollaboratorBody, req.body);

  // Content managers cannot alter money settings: custom commission rates are SUPER_ADMIN only
  if (req.admin?.role !== "SUPER_ADMIN") {
    if (req.body?.commissionRate !== undefined && Number(req.body.commissionRate) !== 10) {
      throw forbidden("Only Super Administrators can set custom collaborator commission rates");
    }
    data.commissionRate = 10;
  }

  const row = await prisma.collaborator.create({ data, include: userInclude });
  await logActivity(req, `Created collaborator ${row.name}`, "Collaborator", row.id);
  res.status(201).json({
    data: {
      ...row,
      clicks: 0,
      orders: 0,
      pendingPaise: 0,
      approvedPaise: 0,
      reversedPaise: 0,
      redeemedPaise: 0,
      requestedRedeemPaise: 0,
      netBalancePaise: 0,
    },
  });
});

/* ── 3. PATCH /admin/collaborators/:id (Update, including commissionRate) ─── */

adminCollaboratorsRouter.patch("/:id", allow(...ROLES.content), async (req, res) => {
  const id = param(req, "id");
  const data = parsePatch(CollaboratorBody, req.body);

  const existing = await prisma.collaborator.findUnique({ where: { id } });
  if (!existing) throw notFound("Collaborator");

  // Restrict commission rate changes to SUPER_ADMIN only
  if (data.commissionRate !== undefined && data.commissionRate !== existing.commissionRate) {
    if (req.admin?.role !== "SUPER_ADMIN") {
      throw forbidden("Only Super Administrators can change collaborator commission rates");
    }
  }

  const updated = await prisma.collaborator.update({
    where: { id },
    data,
    include: userInclude,
  });

  await logActivity(
    req,
    `Updated collaborator ${updated.name} (commission: ${updated.commissionRate}%)`,
    "Collaborator",
    updated.id,
    { commissionRate: updated.commissionRate },
  );

  res.json({ data: updated });
});

/* ── 4. DELETE /admin/collaborators/:id ───────────────────────────────────── */

adminCollaboratorsRouter.delete("/:id", allow(...ROLES.content), async (req, res) => {
  const id = param(req, "id");
  const existing = await prisma.collaborator.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          referrals: true,
          redeemRequests: true,
        },
      },
    },
  });
  if (!existing) throw notFound("Collaborator");

  const referralCount = existing._count.referrals;
  const redeemCount = existing._count.redeemRequests;

  if (referralCount > 0 || redeemCount > 0) {
    const reasons: string[] = [];
    if (referralCount > 0) reasons.push(`${referralCount} referral order${referralCount === 1 ? "" : "s"}`);
    if (redeemCount > 0) reasons.push(`${redeemCount} payout request${redeemCount === 1 ? "" : "s"}`);
    throw conflict(
      `Cannot delete collaborator “${existing.name}”: they have ${reasons.join(" and ")}. Delete is blocked to protect transaction and commission history.`,
    );
  }

  await prisma.collaborator.delete({ where: { id } });
  await logActivity(req, `Deleted collaborator ${existing.name}`, "Collaborator", id);
  res.status(204).end();
});

/* ── 5. GET /admin/collaborators/redeems (Redeem Requests) ────────────────── */

const RedeemFilter = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
});

adminCollaboratorsRouter.get("/redeems", allow(...ROLES.content, ...ROLES.ordersRead), async (req, res) => {
  const { status } = parse(RedeemFilter, req.query);

  const redeems = await prisma.redeemRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      collaborator: {
        select: {
          id: true,
          name: true,
          referralCode: true,
          commissionRate: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  res.json({ data: redeems });
});

/* ── 6. POST /admin/collaborators/redeems/:id/approve ─────────────────────── */

const ProcessNote = z.object({
  note: z.string().trim().max(500).optional(),
});

adminCollaboratorsRouter.post("/redeems/:id/approve", allow(...ROLES.catalog), async (req, res) => {
  const id = param(req, "id");
  const { note } = parse(ProcessNote, req.body ?? {});

  // Single transaction: re-checks status is still REQUESTED so double clicks do nothing.
  const result = await prisma.$transaction(async (tx) => {
    // Acquire row lock to prevent race conditions
    await tx.$executeRaw`SELECT id FROM redeem_requests WHERE id = ${id} FOR UPDATE`;

    const request = await tx.redeemRequest.findUnique({
      where: { id },
      include: {
        collaborator: { select: { id: true, name: true } },
      },
    });

    if (!request) throw notFound("Redeem request");

    // Idempotent: If already processed, return existing state without changing
    if (request.status !== "REQUESTED") {
      return { alreadyProcessed: true, request };
    }

    const updated = await tx.redeemRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        note: note || request.note,
      },
      include: {
        collaborator: { select: { id: true, name: true } },
      },
    });

    return { alreadyProcessed: false, request: updated };
  });

  if (!result.alreadyProcessed) {
    await logActivity(
      req,
      `Approved payout request of ₹${(result.request.amountPaise / 100).toLocaleString("en-IN")} for ${result.request.collaborator.name}`,
      "RedeemRequest",
      result.request.id,
      { amountPaise: result.request.amountPaise, note },
    );
  }

  res.json({ data: result.request, alreadyProcessed: result.alreadyProcessed });
});

/* ── 7. POST /admin/collaborators/redeems/:id/reject ──────────────────────── */

adminCollaboratorsRouter.post("/redeems/:id/reject", allow(...ROLES.catalog), async (req, res) => {
  const id = param(req, "id");
  const { note } = parse(ProcessNote, req.body ?? {});

  // Single transaction: re-checks status is still REQUESTED so double clicks do nothing.
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM redeem_requests WHERE id = ${id} FOR UPDATE`;

    const request = await tx.redeemRequest.findUnique({
      where: { id },
      include: {
        collaborator: { select: { id: true, name: true } },
      },
    });

    if (!request) throw notFound("Redeem request");

    if (request.status !== "REQUESTED") {
      return { alreadyProcessed: true, request };
    }

    const updated = await tx.redeemRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        note: note || request.note,
      },
      include: {
        collaborator: { select: { id: true, name: true } },
      },
    });

    return { alreadyProcessed: false, request: updated };
  });

  if (!result.alreadyProcessed) {
    await logActivity(
      req,
      `Rejected payout request of ₹${(result.request.amountPaise / 100).toLocaleString("en-IN")} for ${result.request.collaborator.name}`,
      "RedeemRequest",
      result.request.id,
      { amountPaise: result.request.amountPaise, note },
    );
  }

  res.json({ data: result.request, alreadyProcessed: result.alreadyProcessed });
});

/* ── 8. GET /admin/collaborators/referrals (Referrals View) ────────────────── */

const ReferralsFilter = z.object({
  status: z.enum(["PENDING", "APPROVED", "REVERSED"]).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().optional(),
});

adminCollaboratorsRouter.get("/referrals", allow(...ROLES.ordersRead, ...ROLES.content), async (req, res) => {
  const { status, take, skip, q } = parse(ReferralsFilter, req.query);

  const where: Prisma.ReferralWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { order: { number: { contains: q, mode: "insensitive" } } },
            { collaborator: { name: { contains: q, mode: "insensitive" } } },
            { collaborator: { referralCode: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [referrals, total] = await Promise.all([
    prisma.referral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        collaborator: {
          select: {
            id: true,
            name: true,
            referralCode: true,
            commissionRate: true,
            user: { select: { email: true } },
          },
        },
        order: {
          select: {
            id: true,
            number: true,
            placedAt: true,
            status: true,
            paymentStatus: true,
            totalPaise: true,
            email: true,
            shipName: true,
          },
        },
      },
    }),
    prisma.referral.count({ where }),
  ]);

  res.json({
    data: referrals,
    pagination: {
      total,
      take,
      skip,
    },
  });
});
