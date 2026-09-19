import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";

/**
 * What shoppers send through the storefront's forms: contact messages and
 * collab applications (the Inbox screen), and newsletter subscribers.
 *
 * Lists return the most recent rows up to a cap; paging comes when volumes
 * need it. Subscribers get a higher cap because the list is exported as CSV.
 */
const LIST_LIMIT = 500;
const SUBSCRIBER_LIMIT = 10_000;

const StatusQuery = z.object({ status: z.enum(["open", "done", "all"]).default("open") });

/* ── Inbox: contact messages + collab applications ─────────────────────── */

export const adminInboxRouter = Router();
// Every staff role answers customers in some way, so all of them can read it.
adminInboxRouter.use(allow(...ROLES.dashboard));

/** Open items, for the sidebar badge. */
adminInboxRouter.get("/counts", async (_req, res) => {
  const [messages, applications] = await Promise.all([
    prisma.contactMessage.count({ where: { isHandled: false } }),
    prisma.collabApplication.count({ where: { isReviewed: false } }),
  ]);
  res.json({ data: { messages, applications, total: messages + applications } });
});

adminInboxRouter.get("/messages", async (req, res) => {
  const { status } = parse(StatusQuery, req.query);
  const messages = await prisma.contactMessage.findMany({
    where: status === "all" ? {} : { isHandled: status === "done" },
    orderBy: { createdAt: "desc" },
    take: LIST_LIMIT,
  });
  res.json({ data: messages });
});

adminInboxRouter.patch("/messages/:id", async (req, res) => {
  const { isHandled } = parse(z.object({ isHandled: z.boolean() }), req.body);
  const id = param(req, "id");
  const found = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Message");
  const message = await prisma.contactMessage.update({ where: { id }, data: { isHandled } });
  await logActivity(
    req,
    `${isHandled ? "Marked done" : "Reopened"} message from ${message.name}: “${message.subject}”`,
    "ContactMessage",
    id,
  );
  res.json({ data: message });
});

adminInboxRouter.delete("/messages/:id", async (req, res) => {
  const id = param(req, "id");
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw notFound("Message");
  await prisma.contactMessage.delete({ where: { id } });
  await logActivity(req, `Deleted message from ${message.name}: “${message.subject}”`, "ContactMessage", id);
  res.status(204).end();
});

adminInboxRouter.get("/applications", async (req, res) => {
  const { status } = parse(StatusQuery, req.query);
  const applications = await prisma.collabApplication.findMany({
    where: status === "all" ? {} : { isReviewed: status === "done" },
    orderBy: { createdAt: "desc" },
    take: LIST_LIMIT,
  });
  res.json({ data: applications });
});

adminInboxRouter.patch("/applications/:id", async (req, res) => {
  const { isReviewed } = parse(z.object({ isReviewed: z.boolean() }), req.body);
  const id = param(req, "id");
  const found = await prisma.collabApplication.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Application");
  const application = await prisma.collabApplication.update({ where: { id }, data: { isReviewed } });
  await logActivity(
    req,
    `${isReviewed ? "Marked reviewed" : "Reopened"} collab application from ${application.name} (${application.handle})`,
    "CollabApplication",
    id,
  );
  res.json({ data: application });
});

adminInboxRouter.delete("/applications/:id", async (req, res) => {
  const id = param(req, "id");
  const application = await prisma.collabApplication.findUnique({ where: { id } });
  if (!application) throw notFound("Application");
  await prisma.collabApplication.delete({ where: { id } });
  await logActivity(req, `Deleted collab application from ${application.name}`, "CollabApplication", id);
  res.status(204).end();
});

/* ── Newsletter subscribers ───────────────────────────────────────────── */

export const adminSubscribersRouter = Router();
adminSubscribersRouter.use(allow(...ROLES.content));

adminSubscribersRouter.get("/", async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: SUBSCRIBER_LIMIT,
  });
  res.json({ data: subscribers });
});

/** Unsubscribe (e.g. on request) or re-subscribe. Rows are kept, never deleted. */
adminSubscribersRouter.patch("/:id", async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]) }), req.body);
  const id = param(req, "id");
  const found = await prisma.subscriber.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Subscriber");
  const subscriber = await prisma.subscriber.update({ where: { id }, data: { status } });
  await logActivity(
    req,
    `${status === "SUBSCRIBED" ? "Re-subscribed" : "Unsubscribed"} ${subscriber.email}`,
    "Subscriber",
    id,
  );
  res.json({ data: subscriber });
});
