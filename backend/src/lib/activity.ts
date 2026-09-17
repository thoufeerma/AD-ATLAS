import type { Prisma } from "../generated/prisma/client.js";
import type { Request } from "express";
import { prisma } from "../db.js";

/**
 * Records an admin action for the Activity Logs screen. Logging failures are
 * swallowed on purpose: a broken audit write must never undo or block the
 * change the admin actually made.
 */
export async function logActivity(
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Prisma.InputJsonValue,
) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        metadata,
        adminUserId: req.admin?.id,
      },
    });
  } catch (err) {
    console.error("activity log write failed:", err);
  }
}
