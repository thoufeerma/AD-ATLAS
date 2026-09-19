import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { sendEmail } from "../../lib/mail.js";
import { mailContext, testEmail } from "../../lib/emails.js";

/**
 * The Email Log: every email the store sent, failed to send, or kept without
 * sending (no email service yet, or a test address). Emails carry customer
 * names and addresses, so it's for the people who handle orders.
 */
export const adminEmailsRouter = Router();

const ListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["SENT", "FAILED", "CAPTURED"]).optional(),
  orderId: z.string().max(40).optional(),
  take: z.coerce.number().int().min(1).max(500).default(200),
});

adminEmailsRouter.get("/", allow(...ROLES.ordersRead), async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.EmailLogWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.orderId ? { orderId: q.orderId } : {}),
    ...(q.q
      ? {
          OR: [
            { to: { contains: q.q, mode: "insensitive" } },
            { subject: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const emails = await prisma.emailLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: q.take,
    // The body is fetched one at a time, when opened.
    select: { id: true, to: true, subject: true, kind: true, status: true, detail: true, orderId: true, createdAt: true },
  });
  res.json({ data: emails });
});

adminEmailsRouter.get("/:id", allow(...ROLES.ordersRead), async (req, res) => {
  const email = await prisma.emailLog.findUnique({ where: { id: param(req, "id") } });
  if (!email) throw notFound("Email");
  res.json({ data: email });
});

/** Sends a sample email, to check the email service is set up. */
adminEmailsRouter.post("/test", allow(...ROLES.catalog), async (req, res) => {
  const { to } = parse(z.object({ to: z.email() }), req.body);
  const { store } = await mailContext();
  const status = await sendEmail(testEmail(store, to));
  await logActivity(req, `Sent a test email to ${to} (${status.toLowerCase()})`, "EmailLog");
  res.status(201).json({ data: { status } });
});
