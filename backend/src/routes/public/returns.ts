import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse } from "../../lib/http.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { currentCustomer } from "../../lib/customerAuth.js";
import { afterResponse } from "../../lib/mail.js";
import { alertReturnRequest, mailContext } from "../../lib/emails.js";
import { returnability, returnSettings, uniqueReturnNumber } from "../../lib/returns.js";

/**
 * Returns, from the shopper's side: what may be sent back, and asking to send
 * it. An order is identified the same way as order tracking — its number plus
 * the email it was placed with — so guests can ask too, and a signed-in
 * customer's own orders need no email.
 */
export const returnsRouter = Router();

const returnLimit = rateLimit({ name: "return", max: 10, windowMs: 10 * 60_000 });

const Lookup = z.object({ email: z.email().optional() });

const RequestBody = z.object({
  email: z.email().optional(),
  reason: z.enum(["DAMAGED", "WRONG_ITEM", "NOT_AS_DESCRIBED", "REACTION", "CHANGED_MIND", "OTHER"]),
  note: z.string().trim().max(1000).optional(),
  items: z
    .array(z.object({ orderItemId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(30),
});

const ORDER_INCLUDE = {
  items: { include: { product: { select: { slug: true } } } },
  events: { select: { status: true, createdAt: true } },
  returns: { include: { items: { select: { orderItemId: true, quantity: true } } }, orderBy: { createdAt: "desc" } },
} as const;

/** The order, but only for someone who can already see it. */
async function findOrder(req: Parameters<typeof currentCustomer>[0], number: string, email?: string) {
  const session = await currentCustomer(req);
  const order = await prisma.order.findUnique({ where: { number }, include: ORDER_INCLUDE });
  // One answer for "no such order" and "not yours", so this can't be used to
  // discover which order numbers exist.
  if (!order) throw notFound("Order");
  const mine = session?.customer && order.customerId === session.customer.id;
  const byEmail = email && order.email.toLowerCase() === email.toLowerCase();
  if (!mine && !byEmail) throw notFound("Order");
  return order;
}

const summarise = (r: { number: string; status: string; reason: string; createdAt: Date; resolvedAt: Date | null; staffNote: string | null; refundPaise: number | null; items: { orderItemId: string; quantity: number }[] }) => ({
  number: r.number,
  status: r.status,
  reason: r.reason,
  requestedAt: r.createdAt,
  resolvedAt: r.resolvedAt,
  staffNote: r.staffNote,
  refundPaise: r.refundPaise,
  items: r.items,
});

/** What this order can still do about returns, for the button and the form. */
returnsRouter.get("/orders/:number/returns", async (req, res) => {
  const { email } = parse(Lookup, req.query);
  const order = await findOrder(req, param(req, "number"), email);
  const settings = await returnSettings();
  const state = returnability(order, settings);

  res.json({
    data: {
      accepted: settings.accepted,
      windowDays: settings.windowDays,
      instructions: settings.instructions,
      canRequest: state.canRequest,
      reason: state.reason,
      closesAt: state.closesAt,
      items: order.items.map((i) => ({
        id: i.id,
        name: i.productName,
        shade: i.shadeName,
        quantity: i.quantity,
        returnable: Math.max(0, state.remaining.get(i.id) ?? 0),
        unitPricePaise: i.unitPricePaise,
      })),
      requests: order.returns.map(summarise),
    },
  });
});

returnsRouter.post("/orders/:number/returns", returnLimit, async (req, res) => {
  const body = parse(RequestBody, req.body);
  const order = await findOrder(req, param(req, "number"), body.email);
  const settings = await returnSettings();
  const state = returnability(order, settings);
  if (!state.canRequest) throw conflict(state.reason ?? "This order can't be returned.");

  // Every line must belong to the order, and no more than is left of it.
  const byId = new Map(order.items.map((i) => [i.id, i]));
  for (const line of body.items) {
    const item = byId.get(line.orderItemId);
    if (!item) throw badRequest("That item isn't part of this order.");
    const left = state.remaining.get(line.orderItemId) ?? 0;
    if (line.quantity > left) {
      throw badRequest(
        left === 0
          ? `${item.productName} has already been returned.`
          : `You can send back at most ${left} of ${item.productName}.`,
      );
    }
  }
  if (new Set(body.items.map((i) => i.orderItemId)).size !== body.items.length) {
    throw badRequest("Each item can only be listed once.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const number = await uniqueReturnNumber(tx);
    return tx.returnRequest.create({
      data: {
        number,
        orderId: order.id,
        reason: body.reason,
        note: body.note || null,
        items: { create: body.items.map((i) => ({ orderItemId: i.orderItemId, quantity: i.quantity })) },
      },
      include: { items: { select: { orderItemId: true, quantity: true } } },
    });
  });

  // The team hears about it after the shopper has their answer.
  afterResponse(async () => {
    const { store, notifications } = await mailContext();
    if (!notifications.alertReturnRequest || notifications.alertRecipients.length === 0) return [];
    const mail = {
      ...created,
      items: body.items.map((line) => {
        const item = byId.get(line.orderItemId)!;
        return { productName: item.productName, shadeName: item.shadeName, quantity: line.quantity };
      }),
    };
    return notifications.alertRecipients.map((to) => alertReturnRequest(mail, order, store, to));
  });

  res.status(201).json({ data: summarise(created) });
});
