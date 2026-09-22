import { Router } from "express";
import { z } from "zod";
import type { OrderStatus, Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, notFound, param, parse } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";
import { afterResponse } from "../../lib/mail.js";
import { customerHearsAbout, mailContext, orderStatusUpdate } from "../../lib/emails.js";
import { invoiceOnShipping, invoiceView, issueInvoice, taxSettings } from "../../lib/invoices.js";
import { renderInvoice, sendInvoiceHtml, invoiceProblemPage } from "../../lib/invoiceHtml.js";

export const adminOrdersRouter = Router();

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

/**
 * Which status an order may move to next. Anything not listed is rejected, so
 * a delivered order can't be flipped back to "processing" by a mis-click, and
 * a cancelled one can't be shipped.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const ListQuery = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

adminOrdersRouter.get("/", allow(...ROLES.ordersRead), async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.OrderWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.q
      ? {
          OR: [
            { number: { contains: q.q, mode: "insensitive" } },
            { email: { contains: q.q, mode: "insensitive" } },
            { shipName: { contains: q.q, mode: "insensitive" } },
            { shipCity: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      take: q.take,
      skip: q.skip,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data: orders.map((o) => ({
      id: o.id,
      number: o.number,
      customer: o.shipName,
      email: o.email,
      city: o.shipCity,
      itemCount: o._count.items,
      totalPaise: o.totalPaise,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      placedAt: o.placedAt,
    })),
    meta: { total, take: q.take, skip: q.skip },
  });
});

adminOrdersRouter.get("/:number", allow(...ROLES.ordersRead), async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { number: param(req, "number") },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) throw notFound("Order");
  // Whether invoices can be issued at all yet (a GSTIN is saved).
  const { gstin } = await taxSettings();
  res.json({ data: { ...order, invoicing: { configured: Boolean(gstin) } } });
});

/** The printable GST invoice. Opened in a new tab, so errors are pages too. */
adminOrdersRouter.get("/:number/invoice", allow(...ROLES.ordersRead), async (req, res) => {
  const order = await prisma.order.findUnique({ where: { number: param(req, "number") }, include: { items: true } });
  const view = order ? invoiceView(order) : null;
  if (!view) {
    sendInvoiceHtml(res, 404, invoiceProblemPage("No invoice yet", "Create the invoice from the order page first."));
    return;
  }
  sendInvoiceHtml(res, 200, renderInvoice(view));
});

/**
 * Issues the invoice now, rather than waiting for the order to ship — for
 * printing it to go in the parcel.
 */
adminOrdersRouter.post("/:number/invoice", allow(...ROLES.ordersWrite), async (req, res) => {
  const issued = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { number: param(req, "number") } });
    if (!order) throw notFound("Order");
    if (order.invoiceNumber) return { order, created: false };
    return { order: await issueInvoice(tx, order), created: true };
  });
  if (issued.created) {
    await logActivity(
      req,
      `Created invoice ${issued.order.invoiceNumber} for ${issued.order.number}`,
      "Order",
      issued.order.id,
    );
  }
  res.status(issued.created ? 201 : 200).json({
    data: { invoiceNumber: issued.order.invoiceNumber, invoicedAt: issued.order.invoicedAt },
  });
});

const StatusBody = z.object({
  status: z.enum(STATUSES),
  note: z.string().trim().max(300).optional(),
});

adminOrdersRouter.patch("/:number/status", allow(...ROLES.ordersWrite), async (req, res) => {
  const body = parse(StatusBody, req.body);

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { number: param(req, "number") },
      include: { items: true },
    });
    if (!order) throw notFound("Order");

    if (!TRANSITIONS[order.status].includes(body.status)) {
      throw badRequest(
        `Cannot move an order from ${order.status} to ${body.status}`,
        { allowed: TRANSITIONS[order.status] },
      );
    }

    // Cancelling returns the reserved stock to inventory.
    if (body.status === "CANCELLED") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    // Goods leave with their tax invoice: shipping issues it if it wasn't
    // created earlier (once a GSTIN is saved under Settings → Tax).
    if (await invoiceOnShipping(tx, order, body.status)) await issueInvoice(tx, order);

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: body.status,
        ...(body.status === "REFUNDED" ? { paymentStatus: "REFUNDED" } : {}),
        // COD is collected on delivery.
        ...(body.status === "DELIVERED" && order.paymentMethod === "COD"
          ? { paymentStatus: "PAID" }
          : {}),
        events: { create: { status: body.status, note: body.note } },
      },
      include: { items: true, events: { orderBy: { createdAt: "asc" } } },
    });
  });

  await logActivity(
    req,
    `Marked ${updated.number} as ${body.status}`,
    "Order",
    updated.id,
    body.note ? { note: body.note } : undefined,
  );

  // Tell the customer about the milestones they care about (shipped,
  // out for delivery, delivered, cancelled, refunded), with any note.
  if (customerHearsAbout(body.status)) {
    afterResponse(async () => {
      const { store, notifications } = await mailContext();
      if (!notifications.shippingUpdates) return [];
      const email = orderStatusUpdate(updated, body.status, body.note, store);
      return email ? [email] : [];
    });
  }

  res.json({ data: updated });
});
