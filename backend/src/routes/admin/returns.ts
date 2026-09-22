import { Router } from "express";
import { z } from "zod";
import type { Prisma, ReturnStatus } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";
import { afterResponse } from "../../lib/mail.js";
import { customerHearsAboutReturn, mailContext, returnUpdate } from "../../lib/emails.js";
import { OPEN_STATUSES } from "../../lib/returns.js";

/**
 * Returns, from the team's side. Money is never moved here — Velastia refunds
 * by hand (COD orders are cash), so "Refunded" records what was paid back.
 */
export const adminReturnsRouter = Router();

/** What may follow what. Rejected and refunded close the request for good. */
const NEXT: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED", "REJECTED"],
  RECEIVED: ["REFUNDED", "REJECTED"],
  REJECTED: [],
  REFUNDED: [],
};

const DETAIL = {
  items: {
    include: {
      orderItem: {
        select: { id: true, productName: true, sku: true, shadeName: true, quantity: true, unitPricePaise: true },
      },
    },
  },
  order: {
    select: {
      number: true,
      email: true,
      shipName: true,
      shipPhone: true,
      totalPaise: true,
      status: true,
      paymentMethod: true,
      placedAt: true,
    },
  },
} as const;

type WithDetail = Prisma.ReturnRequestGetPayload<{ include: typeof DETAIL }>;

/** What the customer would get back if every listed item is accepted. */
const itemsValue = (r: WithDetail) =>
  r.items.reduce((n, i) => n + i.orderItem.unitPricePaise * i.quantity, 0);

const shape = (r: WithDetail) => ({
  number: r.number,
  status: r.status,
  reason: r.reason,
  note: r.note,
  staffNote: r.staffNote,
  refundPaise: r.refundPaise,
  suggestedRefundPaise: itemsValue(r),
  requestedAt: r.createdAt,
  resolvedAt: r.resolvedAt,
  order: r.order,
  items: r.items.map((i) => ({
    id: i.orderItem.id,
    name: i.orderItem.productName,
    sku: i.orderItem.sku,
    shade: i.orderItem.shadeName,
    quantity: i.quantity,
    orderedQuantity: i.orderItem.quantity,
    unitPricePaise: i.orderItem.unitPricePaise,
  })),
});

const ListQuery = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"]).optional(),
  open: z.enum(["true", "false"]).optional(),
  q: z.string().trim().max(100).optional(),
  take: z.coerce.number().int().min(1).max(200).default(100),
});

adminReturnsRouter.get("/", allow(...ROLES.ordersRead), async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.ReturnRequestWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.open === "true" ? { status: { in: OPEN_STATUSES } } : {}),
    ...(q.q
      ? {
          OR: [
            { number: { contains: q.q, mode: "insensitive" } },
            { order: { number: { contains: q.q, mode: "insensitive" } } },
            { order: { email: { contains: q.q, mode: "insensitive" } } },
            { order: { shipName: { contains: q.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [rows, open] = await Promise.all([
    prisma.returnRequest.findMany({ where, include: DETAIL, orderBy: { createdAt: "desc" }, take: q.take }),
    prisma.returnRequest.count({ where: { status: { in: OPEN_STATUSES } } }),
  ]);

  res.json({ data: rows.map(shape), meta: { open } });
});

/** Just the badge count, for the sidebar. */
adminReturnsRouter.get("/counts", allow(...ROLES.ordersRead), async (_req, res) => {
  const [open, requested] = await Promise.all([
    prisma.returnRequest.count({ where: { status: { in: OPEN_STATUSES } } }),
    prisma.returnRequest.count({ where: { status: "REQUESTED" } }),
  ]);
  res.json({ data: { open, requested } });
});

adminReturnsRouter.get("/:number", allow(...ROLES.ordersRead), async (req, res) => {
  const found = await prisma.returnRequest.findUnique({ where: { number: param(req, "number") }, include: DETAIL });
  if (!found) throw notFound("Return request");
  res.json({ data: shape(found) });
});

const UpdateBody = z.object({
  status: z.enum(["APPROVED", "REJECTED", "RECEIVED", "REFUNDED"]),
  /** Goes into the email the customer receives. */
  staffNote: z.string().trim().max(1000).optional(),
  /** Only when settling: what was actually paid back, in paise. */
  refundPaise: z.number().int().min(0).max(100_000_000).optional(),
});

adminReturnsRouter.patch("/:number", allow(...ROLES.ordersWrite), async (req, res) => {
  const body = parse(UpdateBody, req.body);
  const number = param(req, "number");
  const found = await prisma.returnRequest.findUnique({ where: { number }, include: DETAIL });
  if (!found) throw notFound("Return request");

  if (!NEXT[found.status].includes(body.status)) {
    throw conflict(
      NEXT[found.status].length === 0
        ? `This return is already ${found.status.toLowerCase()} and can't be changed.`
        : `A ${found.status.toLowerCase()} return can only move to ${NEXT[found.status].join(" or ").toLowerCase()}.`,
    );
  }
  if (body.refundPaise != null && body.status !== "REFUNDED") {
    throw badRequest("A refund amount only belongs on a refunded return.");
  }

  const settled = body.status === "REFUNDED" || body.status === "REJECTED";
  const updated = await prisma.returnRequest.update({
    where: { number },
    data: {
      status: body.status,
      staffNote: body.staffNote ?? found.staffNote,
      // Default to what the items came to, which is what the team usually pays.
      ...(body.status === "REFUNDED" ? { refundPaise: body.refundPaise ?? itemsValue(found) } : {}),
      resolvedAt: settled ? new Date() : null,
    },
    include: DETAIL,
  });

  // When everything in the order has come back and been refunded, the order
  // itself is refunded — so the dashboard and reports stop counting it as
  // revenue. A partial return leaves the order as it is.
  if (body.status === "REFUNDED") {
    const order = await prisma.order.findUnique({
      where: { number: found.order.number },
      include: { items: { select: { id: true, quantity: true } }, returns: { where: { status: "REFUNDED" }, include: { items: true } } },
    });
    if (order && order.status !== "REFUNDED") {
      const refunded = new Map<string, number>();
      for (const r of order.returns) {
        for (const i of r.items) refunded.set(i.orderItemId, (refunded.get(i.orderItemId) ?? 0) + i.quantity);
      }
      const whole = order.items.every((i) => (refunded.get(i.id) ?? 0) >= i.quantity);
      if (whole) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: "REFUNDED", paymentStatus: "REFUNDED" },
          }),
          prisma.orderEvent.create({
            data: { orderId: order.id, status: "REFUNDED", note: `Return ${updated.number} refunded` },
          }),
        ]);
      }
    }
  }

  await logActivity(
    req,
    `Marked return ${updated.number} (order #${updated.order.number}) as ${body.status}`,
    "Return",
    updated.id,
    body.staffNote ? { note: body.staffNote } : undefined,
  );

  if (customerHearsAboutReturn(body.status)) {
    afterResponse(async () => {
      const { store, notifications } = await mailContext();
      if (!notifications.returnUpdates) return [];
      const order = await prisma.order.findUnique({ where: { number: updated.order.number } });
      if (!order) return [];
      const mail = returnUpdate(
        {
          number: updated.number,
          status: updated.status,
          reason: updated.reason,
          note: updated.note,
          staffNote: updated.staffNote,
          refundPaise: updated.refundPaise,
          items: updated.items.map((i) => ({
            productName: i.orderItem.productName,
            shadeName: i.orderItem.shadeName,
            quantity: i.quantity,
          })),
        },
        order,
        store,
      );
      return mail ? [mail] : [];
    });
  }

  res.json({ data: shape(updated) });
});
