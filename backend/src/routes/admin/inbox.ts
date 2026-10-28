import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { getUniqueReferralCode } from "../../lib/referral.js";
import { afterResponse } from "../../lib/mail.js";
import { collabApprovedEmail, mailContext } from "../../lib/emails.js";

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

  const emails = applications.map((a) => a.email.toLowerCase());
  const collaborators = await prisma.collaborator.findMany({
    where: {
      user: { email: { in: emails, mode: "insensitive" } },
    },
    select: {
      id: true,
      name: true,
      referralCode: true,
      user: { select: { email: true } },
    },
  });
  const collabMap = new Map(
    collaborators.filter((c) => c.user?.email).map((c) => [c.user!.email.toLowerCase(), c]),
  );

  const data = applications.map((a) => ({
    ...a,
    collaborator: collabMap.get(a.email.toLowerCase()) ?? null,
  }));

  res.json({ data });
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

function extractRole(about: string): string {
  const match = about.match(/Applying as:\s*([^\n\r]+)/i);
  if (match && match[1]?.trim()) {
    return match[1].trim().slice(0, 100);
  }
  return "Creator";
}

/** Pre-flight check before approval: find matching customer & existing display-only collaborators. */
adminInboxRouter.get("/applications/:id/lookup", async (req, res) => {
  const id = param(req, "id");
  const application = await prisma.collabApplication.findUnique({ where: { id } });
  if (!application) throw notFound("Application");

  const matchedCustomer = await prisma.customer.findFirst({
    where: { email: { equals: application.email, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      collaborator: { select: { id: true, name: true, referralCode: true } },
    },
  });

  const availableCollaborators = await prisma.collaborator.findMany({
    where: { userId: null },
    select: { id: true, name: true, role: true, handle: true, referralCode: true },
    orderBy: { name: "asc" },
  });

  const suggestedCollaborator =
    availableCollaborators.find(
      (c) =>
        c.name.toLowerCase() === application.name.toLowerCase() ||
        (c.handle && c.handle.toLowerCase() === application.handle.toLowerCase()),
    ) ?? null;

  res.json({
    data: {
      application,
      matchedCustomer,
      suggestedCollaborator,
      availableCollaborators,
    },
  });
});

const ApproveBody = z.object({
  customerId: z.string().optional(),
  collaboratorId: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
});

/**
 * Approves a collab application in a single transaction:
 * 1. Links Customer (by email or manual pick).
 * 2. Links existing Collaborator or creates a new one.
 * 3. Generates unique referralCode.
 * 4. Marks application reviewed.
 * 5. Sends approval email.
 * Safe to call multiple times (idempotent).
 */
adminInboxRouter.post("/applications/:id/approve", async (req, res) => {
  const id = param(req, "id");
  const body = parse(ApproveBody, req.body);

  const application = await prisma.collabApplication.findUnique({ where: { id } });
  if (!application) throw notFound("Application");

  // Idempotency check: if already approved, return existing collaborator safely
  if (application.isReviewed) {
    const existingCollab = await prisma.collaborator.findFirst({
      where: {
        OR: [
          { user: { email: { equals: application.email, mode: "insensitive" } } },
          { handle: { equals: application.handle, mode: "insensitive" } },
        ],
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (existingCollab && existingCollab.userId) {
      return res.json({
        data: {
          collaborator: existingCollab,
          alreadyApproved: true,
        },
      });
    }
  }

  // 1. Locate Customer
  let customer;
  if (body.customerId) {
    customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
      include: { collaborator: true },
    });
    if (!customer) throw notFound("Customer");
  } else {
    customer = await prisma.customer.findFirst({
      where: { email: { equals: application.email, mode: "insensitive" } },
      include: { collaborator: true },
    });
    if (!customer) {
      throw badRequest(
        "NO_MATCHING_CUSTOMER",
        `No customer account found with email "${application.email}". Please select a customer account manually to approve.`,
      );
    }
  }

  // 2. Block approval if that customer is already linked to another collaborator
  if (customer.collaborator && customer.collaborator.id !== body.collaboratorId) {
    throw conflict(
      `Customer "${customer.email}" is already linked to collaborator "${customer.collaborator.name}".`,
    );
  }

  // 3. Determine if linking existing collaborator or creating new
  let targetCollaborator = null;
  if (body.collaboratorId) {
    targetCollaborator = await prisma.collaborator.findUnique({ where: { id: body.collaboratorId } });
    if (!targetCollaborator) throw notFound("Collaborator");
    if (targetCollaborator.userId && targetCollaborator.userId !== customer.id) {
      throw conflict("This collaborator profile is already linked to a different customer.");
    }
  }

  const role = extractRole(application.about);

  // 4. Execute all in one database transaction
  const result = await prisma.$transaction(async (tx) => {
    let code = targetCollaborator?.referralCode;
    if (!code) {
      code = await getUniqueReferralCode(application.name, tx);
    }

    let collab;
    if (targetCollaborator) {
      collab = await tx.collaborator.update({
        where: { id: targetCollaborator.id },
        data: {
          userId: customer.id,
          referralCode: code,
          handle: targetCollaborator.handle || application.handle,
          commissionRate: body.commissionRate,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    } else {
      collab = await tx.collaborator.create({
        data: {
          userId: customer.id,
          name: application.name,
          handle: application.handle,
          role,
          referralCode: code,
          commissionRate: body.commissionRate,
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
    }

    await tx.collabApplication.update({
      where: { id: application.id },
      data: { isReviewed: true },
    });

    return collab;
  });

  // 5. Activity log
  await logActivity(
    req,
    `Approved collab application from ${application.name} (Referral: ${result.referralCode})`,
    "Collaborator",
    result.id,
  );

  // 6. Send approval email (never blocks or throws)
  afterResponse(async () => {
    const { store } = await mailContext();
    return [
      collabApprovedEmail(
        {
          name: result.name,
          referralCode: result.referralCode!,
          email: customer.email,
        },
        store,
      ),
    ];
  });

  res.status(200).json({ data: { collaborator: result, newlyApproved: true } });
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
