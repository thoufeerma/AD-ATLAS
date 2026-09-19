import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";
import {
  CopySettings,
  NotificationSettings,
  PAGE_TOKENS,
  PageBody,
  StoreSettings,
  WelcomeOfferSettings,
  readCopy,
  readNotifications,
  readStore,
} from "../../lib/settings.js";
import { emailServiceConnected } from "../../lib/mail.js";
import { env } from "../../env.js";

/* ── Settings ─────────────────────────────────────────────────────────── */

export const adminSettingsRouter = Router();

const readSettings = async () => {
  const [rows, shipping] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: ["store", "welcomeOffer", "copy", "notifications"] } } }),
    prisma.shippingMethod.findFirst({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, pricePaise: true, freeAbovePaise: true },
    }),
  ]);
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const welcome = values.welcomeOffer as { code?: string | null } | undefined;
  return {
    store: values.store ? readStore(values.store) : null,
    welcomeOffer: { code: welcome?.code ?? null },
    copy: readCopy(values.copy),
    notifications: readNotifications(values.notifications),
    // Read-only: whether emails really go out, and from which address.
    email: { connected: emailServiceConnected(), from: env.EMAIL_FROM },
    // Read-only here; shown so page editors can see what shipping tokens become.
    shipping,
  };
};

const save = (key: string, value: Prisma.InputJsonValue) =>
  prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });

// Content managers can read settings (the page editor shows them) and edit the
// marketing copy. Store identity and the welcome offer are super admin only.
adminSettingsRouter.get("/", allow(...ROLES.content), async (_req, res) => {
  res.json({ data: await readSettings() });
});

adminSettingsRouter.put("/store", allow(...ROLES.catalog), async (req, res) => {
  const store = parse(StoreSettings, req.body);
  await save("store", store);
  await logActivity(req, "Updated store details", "Setting", "store");
  res.json({ data: await readSettings() });
});

adminSettingsRouter.put("/welcome-offer", allow(...ROLES.catalog), async (req, res) => {
  const { code } = parse(WelcomeOfferSettings, req.body);
  if (code) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw badRequest(`There is no coupon ${code} — create it on the Coupons screen first`);
    if (coupon.type !== "PERCENTAGE") {
      throw badRequest("The welcome offer must be a percentage coupon, e.g. 10% off");
    }
  }
  await save("welcomeOffer", { code: code || null });
  await logActivity(req, code ? `Set welcome offer to ${code}` : "Turned off the welcome offer", "Setting", "welcomeOffer");
  res.json({ data: await readSettings() });
});

adminSettingsRouter.put("/notifications", allow(...ROLES.catalog), async (req, res) => {
  const notifications = parse(NotificationSettings, req.body);
  await save("notifications", notifications);
  await logActivity(req, "Updated email notifications", "Setting", "notifications");
  res.json({ data: await readSettings() });
});

adminSettingsRouter.put("/copy", allow(...ROLES.content), async (req, res) => {
  const copy = parse(CopySettings, req.body);
  await save("copy", copy);
  await logActivity(req, "Updated site copy", "Setting", "copy");
  res.json({ data: await readSettings() });
});

/* ── Pages (shipping, returns, terms, privacy) ────────────────────────── */

export const adminPagesRouter = Router();
adminPagesRouter.use(allow(...ROLES.content));

const PagePatch = z.object({
  title: z.string().trim().min(2).max(120),
  body: PageBody,
  metaTitle: z.string().trim().max(70).nullable(),
  metaDescription: z.string().trim().max(170).nullable(),
});

adminPagesRouter.get("/", async (_req, res) => {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true, status: true, updatedAt: true },
  });
  res.json({ data: pages });
});

adminPagesRouter.get("/:slug", async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: param(req, "slug") } });
  if (!page) throw notFound("Page");
  res.json({ data: { ...page, tokens: PAGE_TOKENS } });
});

adminPagesRouter.patch("/:slug", async (req, res) => {
  const slug = param(req, "slug");
  const data = parsePatch(PagePatch, req.body);
  const exists = await prisma.page.findUnique({ where: { slug }, select: { id: true } });
  if (!exists) throw notFound("Page");
  const page = await prisma.page.update({ where: { slug }, data });
  await logActivity(req, `Updated page “${page.title}”`, "Page", page.id);
  res.json({ data: { ...page, tokens: PAGE_TOKENS } });
});
