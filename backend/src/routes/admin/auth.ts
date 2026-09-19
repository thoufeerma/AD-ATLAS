import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import {
  ADMIN_COOKIE,
  clearLoginAttempts,
  getDummyHash,
  hashPassword,
  isLoginLocked,
  passwordProblem,
  registerFailedLogin,
  sessionCookieOptions,
  signSession,
  verifyPassword,
} from "../../lib/auth.js";
import { badRequest, parse, tooMany, unauthorized } from "../../lib/http.js";
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

  // A password that wouldn't pass today's rules (the seeded placeholder, or
  // one set before the rules existed) has to be replaced before going further.
  const mustChangePassword =
    admin.mustChangePassword || passwordProblem(body.password, admin.email) !== null;

  const [token] = await Promise.all([
    signSession({ sub: admin.id, role: admin.role, ver: admin.sessionVersion }),
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), mustChangePassword },
    }),
  ]);

  res.cookie(ADMIN_COOKIE, token, sessionCookieOptions);
  const me = { id: admin.id, email: admin.email, name: admin.name, role: admin.role, mustChangePassword };
  req.admin = me;
  await logActivity(req, "Signed in", "Session");

  res.json({ data: me });
});

adminAuthRouter.post("/logout", (_req, res) => {
  const { maxAge: _maxAge, ...clearOptions } = sessionCookieOptions;
  res.clearCookie(ADMIN_COOKIE, clearOptions);
  res.status(204).end();
});

adminAuthRouter.get("/me", requireAdmin, (req, res) => {
  res.json({ data: req.admin });
});

const PasswordBody = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().max(200),
});

/**
 * Change your own password. Signs out every other session on the account
 * (the version bump) and hands this browser a fresh session, so the person
 * changing it stays signed in.
 */
adminAuthRouter.post("/password", requireAdmin, async (req, res) => {
  const body = parse(PasswordBody, req.body);
  const me = req.admin!;
  // Guessing the current password from a hijacked session is throttled like logins.
  const throttleKey = `password:${me.id}`;
  if (isLoginLocked(throttleKey)) {
    throw tooMany("Too many wrong attempts. Try again in 15 minutes.");
  }

  const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(body.currentPassword, admin.passwordHash))) {
    registerFailedLogin(throttleKey);
    throw badRequest("Your current password is incorrect", [
      { path: "currentPassword", message: "That isn't your current password." },
    ]);
  }
  clearLoginAttempts(throttleKey);

  const problem =
    body.newPassword === body.currentPassword
      ? "Choose a password different from your current one."
      : passwordProblem(body.newPassword, admin.email);
  if (problem) throw badRequest(problem, [{ path: "newPassword", message: problem }]);

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: await hashPassword(body.newPassword),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  });

  const token = await signSession({ sub: updated.id, role: updated.role, ver: updated.sessionVersion });
  res.cookie(ADMIN_COOKIE, token, sessionCookieOptions);
  await logActivity(req, "Changed their password", "AdminUser", updated.id);

  res.json({
    data: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      mustChangePassword: false,
    },
  });
});
