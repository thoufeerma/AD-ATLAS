import type { NextFunction, Request, Response } from "express";
import type { AdminRole, AdminUser } from "../generated/prisma/client.js";
import { prisma } from "../db.js";
import { ADMIN_COOKIE, readSession } from "../lib/auth.js";
import { forbidden, HttpError, unauthorized } from "../lib/http.js";

export type AuthedAdmin = Pick<AdminUser, "id" | "email" | "name" | "role" | "mustChangePassword">;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthedAdmin;
    }
  }
}

/**
 * Verifies the session cookie AND re-reads the user on every request. The
 * database lookup is deliberate: deactivating an admin or changing their role
 * takes effect immediately, instead of lingering until their token expires.
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ADMIN_COOKIE];
  if (!token) throw unauthorized();

  const session = await readSession(token);
  if (!session) throw unauthorized("Session expired — please sign in again");

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      sessionVersion: true,
    },
  });
  if (!admin || !admin.isActive) throw unauthorized("Account is not active");
  // A password change, reset or deactivation bumps the version, which ends
  // every session issued before it.
  if (session.ver !== admin.sessionVersion) throw unauthorized("Session expired — please sign in again");

  req.admin = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    mustChangePassword: admin.mustChangePassword,
  };
  next();
}

/**
 * Until an admin replaces a temporary or placeholder password, the only
 * things they can do are read who they are, change the password and sign out
 * (all under /auth). Everything else is refused here, server-side — the
 * admin panel's lock screen is a convenience, not the control.
 */
export function requireCurrentPassword(req: Request, _res: Response, next: NextFunction) {
  if (req.admin?.mustChangePassword) {
    throw new HttpError(403, "PASSWORD_CHANGE_REQUIRED", "Set a new password to continue");
  }
  next();
}

/**
 * Role gates, following the permissions drawn on the Users & Roles screen:
 *   Content Manager — pages, blog, media, banners, testimonials, FAQs, SEO
 *   Order Manager   — orders, customers, inventory, refunds
 *   Support Agent   — read-only orders and customers, reply to reviews
 * Super Administrator passes every gate.
 */
export function allow(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.admin?.role;
    if (!role) throw unauthorized();
    if (role !== "SUPER_ADMIN" && !roles.includes(role)) throw forbidden();
    next();
  };
}

export const ROLES = {
  catalog: [] as AdminRole[], // super admin only
  content: ["CONTENT_MANAGER"] as AdminRole[],
  ordersWrite: ["ORDER_MANAGER"] as AdminRole[],
  ordersRead: ["ORDER_MANAGER", "SUPPORT_AGENT"] as AdminRole[],
  inventory: ["ORDER_MANAGER"] as AdminRole[],
  reviews: ["SUPPORT_AGENT"] as AdminRole[],
  dashboard: ["CONTENT_MANAGER", "ORDER_MANAGER", "SUPPORT_AGENT"] as AdminRole[],
};
