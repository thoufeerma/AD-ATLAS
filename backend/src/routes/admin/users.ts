import { Router } from "express";
import { z } from "zod";
import type { AdminRole, Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { hashPassword, temporaryPassword } from "../../lib/auth.js";
import { conflict, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";

/**
 * Users & Roles — super administrators only.
 *
 * Accounts are never deleted: their activity history points at them.
 * Deactivating is the way to remove someone's access, and it takes effect on
 * their very next request.
 */
export const adminUsersRouter = Router();
adminUsersRouter.use(allow(...ROLES.catalog)); // super admin only

const ROLE = z.enum(["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "SUPPORT_AGENT"]);

const publicFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.AdminUserSelect;

adminUsersRouter.get("/", async (_req, res) => {
  const users = await prisma.adminUser.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: publicFields,
  });
  res.json({ data: users });
});

const CreateBody = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((e) => e.toLowerCase()),
  role: ROLE,
});

/**
 * Creates the account with a one-time password, returned once in this
 * response for the super admin to pass on. It is never stored in plain text
 * or shown again; the new admin must replace it when they first sign in.
 */
adminUsersRouter.post("/", async (req, res) => {
  const body = parse(CreateBody, req.body);
  const password = temporaryPassword();
  const user = await prisma.adminUser.create({
    data: { ...body, passwordHash: await hashPassword(password), mustChangePassword: true },
    select: publicFields,
  });
  await logActivity(req, `Added ${user.name} (${user.email}) as ${roleLabel(user.role)}`, "AdminUser", user.id);
  res.status(201).json({ data: { user, temporaryPassword: password } });
});

const UpdateBody = z.object({
  name: z.string().trim().min(2).max(80),
  role: ROLE,
  isActive: z.boolean(),
});

adminUsersRouter.patch("/:id", async (req, res) => {
  const id = param(req, "id");
  const data = parsePatch(UpdateBody, req.body);
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) throw notFound("User");

  const demoting = data.role !== undefined && data.role !== user.role;
  const deactivating = data.isActive === false && user.isActive;

  if (id === req.admin!.id && (demoting || deactivating)) {
    throw conflict(
      "You can't change your own role or turn off your own account — ask another super administrator",
    );
  }
  if (user.role === "SUPER_ADMIN" && user.isActive && (demoting || deactivating)) {
    await ensureAnotherSuperAdmin(id);
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: {
      ...data,
      // Turning an account off also ends any session it still holds.
      ...(deactivating ? { sessionVersion: { increment: 1 } } : {}),
    },
    select: publicFields,
  });

  await logActivity(req, describeChange(user, updated), "AdminUser", id);
  res.json({ data: updated });
});

/**
 * Issues a new one-time password (returned once) and signs the user out
 * everywhere. For your own account, change your password instead.
 */
adminUsersRouter.post("/:id/reset-password", async (req, res) => {
  const id = param(req, "id");
  if (id === req.admin!.id) {
    throw conflict("To change your own password, use Account → Change Password");
  }
  const user = await prisma.adminUser.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!user) throw notFound("User");

  const password = temporaryPassword();
  await prisma.adminUser.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      sessionVersion: { increment: 1 },
    },
  });
  await logActivity(req, `Reset the password for ${user.name}`, "AdminUser", id);
  res.json({ data: { temporaryPassword: password } });
});

/** Refuses to leave the store with no active super administrator. */
async function ensureAnotherSuperAdmin(exceptId: string) {
  const others = await prisma.adminUser.count({
    where: { role: "SUPER_ADMIN", isActive: true, id: { not: exceptId } },
  });
  if (others === 0) {
    throw conflict("This is the only active super administrator — make someone else one first");
  }
}

function roleLabel(role: AdminRole) {
  return {
    SUPER_ADMIN: "Super Administrator",
    CONTENT_MANAGER: "Content Manager",
    ORDER_MANAGER: "Order Manager",
    SUPPORT_AGENT: "Support Agent",
  }[role];
}

function describeChange(
  before: { name: string; role: AdminRole; isActive: boolean },
  after: { name: string; role: AdminRole; isActive: boolean },
) {
  const changes: string[] = [];
  if (before.role !== after.role) changes.push(`role ${roleLabel(before.role)} → ${roleLabel(after.role)}`);
  if (before.isActive !== after.isActive) changes.push(after.isActive ? "re-enabled" : "turned off");
  if (before.name !== after.name) changes.push(`renamed from ${before.name}`);
  return `Updated ${after.name}: ${changes.join(", ") || "no changes"}`;
}
