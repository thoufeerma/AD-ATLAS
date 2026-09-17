import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import {
  ADMIN_COOKIE,
  clearLoginAttempts,
  getDummyHash,
  isLoginLocked,
  registerFailedLogin,
  sessionCookieOptions,
  signSession,
  verifyPassword,
} from "../../lib/auth.js";
import { parse, tooMany, unauthorized } from "../../lib/http.js";
import { requireAdmin } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";

export const adminAuthRouter = Router();

const LoginBody = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(200),
});

adminAuthRouter.post("/login", async (req, res) => {
  const body = parse(LoginBody, req.body);
  const throttleKey = `${req.ip}:${body.email}`;

  if (isLoginLocked(throttleKey)) {
    throw tooMany("Too many failed attempts. Try again in 15 minutes.");
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: body.email } });

  // Always run exactly one bcrypt comparison, whether or not the account
  // exists, so response time doesn't reveal which emails are admins.
  const hash = admin?.passwordHash ?? (await getDummyHash());
  const passwordOk = await verifyPassword(body.password, hash);

  if (!admin || !passwordOk || !admin.isActive) {
    registerFailedLogin(throttleKey);
    // One message for every failure mode — never "no such user".
    throw unauthorized("Incorrect email or password");
  }

  clearLoginAttempts(throttleKey);

  const [token] = await Promise.all([
    signSession({ sub: admin.id, role: admin.role }),
    prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }),
  ]);

  res.cookie(ADMIN_COOKIE, token, sessionCookieOptions);
  req.admin = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  await logActivity(req, "Signed in", "Session");

  res.json({
    data: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
});

adminAuthRouter.post("/logout", (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions;
  res.clearCookie(ADMIN_COOKIE, clearOptions);
  res.status(204).end();
});

adminAuthRouter.get("/me", requireAdmin, (req, res) => {
  res.json({ data: req.admin });
});
