import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { parse } from "../../lib/http.js";
import { rateLimit } from "../../middleware/rateLimit.js";

export const referralsRouter = Router();

// Rate limit: 60 click/validate events per 10 minutes per IP
const clickLimit = rateLimit({ name: "referral-click", max: 60, windowMs: 10 * 60_000 });

const ClickBody = z.object({
  code: z.string().trim().min(1).max(50),
});

/**
 * Public endpoint to log a referral click and validate the code.
 * Only referral codes of approved collaborators (with linked customer accounts) are valid.
 */
referralsRouter.post("/click", clickLimit, async (req, res) => {
  const { code } = parse(ClickBody, req.body);

  const collaborator = await prisma.collaborator.findFirst({
    where: {
      referralCode: { equals: code, mode: "insensitive" },
      userId: { not: null },
    },
    select: {
      id: true,
      referralCode: true,
      name: true,
      handle: true,
    },
  });

  if (!collaborator || !collaborator.referralCode) {
    return res.json({ data: { valid: false } });
  }

  await prisma.referralClick.create({
    data: {
      collaboratorId: collaborator.id,
    },
  });

  return res.json({
    data: {
      valid: true,
      code: collaborator.referralCode,
      collaborator: {
        name: collaborator.name,
        handle: collaborator.handle,
      },
    },
  });
});

const ValidateQuery = z.object({
  code: z.string().trim().min(1).max(50),
});

/**
 * Public validation endpoint to check if a code belongs to an approved collaborator.
 */
referralsRouter.get("/validate", clickLimit, async (req, res) => {
  const { code } = parse(ValidateQuery, req.query);

  const collaborator = await prisma.collaborator.findFirst({
    where: {
      referralCode: { equals: code, mode: "insensitive" },
      userId: { not: null },
    },
    select: {
      referralCode: true,
    },
  });

  if (!collaborator || !collaborator.referralCode) {
    return res.json({ data: { valid: false } });
  }

  return res.json({
    data: {
      valid: true,
      code: collaborator.referralCode,
    },
  });
});
