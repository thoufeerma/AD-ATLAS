import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";
import { crudRouter } from "./crud.js";

/* ── Categories ───────────────────────────────────────────────────────── */

export const adminCategoriesRouter = Router();

const CategoryInput = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).nullish(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

adminCategoriesRouter.get("/", allow(...ROLES.catalog, ...ROLES.content), async (_req, res) => {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ data: rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })) });
});

adminCategoriesRouter.post("/", allow(...ROLES.catalog), async (req, res) => {
  const row = await prisma.category.create({ data: parse(CategoryInput, req.body) });
  await logActivity(req, `Created category ${row.name}`, "Category", row.id);
  res.status(201).json({ data: row });
});

adminCategoriesRouter.patch("/:id", allow(...ROLES.catalog), async (req, res) => {
  const row = await prisma.category.update({
    where: { id: param(req, "id") },
    data: parsePatch(CategoryInput, req.body),
  });
  await logActivity(req, `Updated category ${row.name}`, "Category", row.id);
  res.json({ data: row });
});

adminCategoriesRouter.delete("/:id", allow(...ROLES.catalog), async (req, res) => {
  const count = await prisma.product.count({ where: { categoryId: param(req, "id") } });
  if (count > 0) {
    throw conflict(`Move or archive the ${count} products in this category before deleting it`);
  }
  await prisma.category.delete({ where: { id: param(req, "id") } });
  await logActivity(req, "Deleted category", "Category", param(req, "id"));
  res.status(204).end();
});

/* ── Reviews ──────────────────────────────────────────────────────────── */

export const adminReviewsRouter = Router();

adminReviewsRouter.get("/", allow(...ROLES.reviews), async (req, res) => {
  const { status } = parse(
    z.object({ status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]).optional() }),
    req.query,
  );
  const rows = await prisma.review.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { product: { select: { id: true, name: true } } },
  });
  res.json({ data: rows });
});

adminReviewsRouter.patch("/:id", allow(...ROLES.reviews), async (req, res) => {
  const { status } = parse(
    z.object({ status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]) }),
    req.body,
  );
  const row = await prisma.review.update({
    where: { id: param(req, "id") },
    data: { status },
    include: { product: { select: { name: true } } },
  });
  await logActivity(req, `Set review on ${row.product.name} to ${status}`, "Review", row.id);
  res.json({ data: row });
});

adminReviewsRouter.delete("/:id", allow(...ROLES.reviews), async (req, res) => {
  await prisma.review.delete({ where: { id: param(req, "id") } });
  await logActivity(req, "Deleted review", "Review", param(req, "id"));
  res.status(204).end();
});

/* ── Coupons ──────────────────────────────────────────────────────────── */

export const adminCouponsRouter = Router();

const CouponInput = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,40}$/, "3–40 letters, numbers, dashes or underscores"),
    type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
    /** PERCENTAGE: basis points (1000 = 10%). FIXED: paise. */
    value: z.number().int().min(0).default(0),
    minOrderPaise: z.number().int().min(0).default(0),
    usageLimit: z.number().int().min(1).nullish(),
    perCustomerLimit: z.number().int().min(1).nullish(),
    firstOrderOnly: z.boolean().default(false),
    isActive: z.boolean().default(true),
    startsAt: z.coerce.date().nullish(),
    expiresAt: z.coerce.date().nullish(),
  })
  .refine((c) => c.type !== "PERCENTAGE" || c.value <= 10_000, {
    message: "A percentage discount cannot exceed 100% (10000 basis points)",
    path: ["value"],
  })
  .refine((c) => !c.startsAt || !c.expiresAt || c.startsAt < c.expiresAt, {
    message: "Expiry must be after the start date",
    path: ["expiresAt"],
  });

adminCouponsRouter.get("/", allow(...ROLES.catalog), async (_req, res) => {
  res.json({ data: await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }) });
});

adminCouponsRouter.post("/", allow(...ROLES.catalog), async (req, res) => {
  const row = await prisma.coupon.create({ data: parse(CouponInput, req.body) });
  await logActivity(req, `Created coupon ${row.code}`, "Coupon", row.id);
  res.status(201).json({ data: row });
});

adminCouponsRouter.patch("/:id", allow(...ROLES.catalog), async (req, res) => {
  // .partial() isn't available on a refined schema, so validate the merged
  // result against the full rules instead of skipping them.
  const existing = await prisma.coupon.findUnique({ where: { id: param(req, "id") } });
  if (!existing) throw notFound("Coupon");
  if (typeof req.body !== "object" || req.body === null) throw badRequest("Expected a JSON object");

  const { id: _id, usedCount: _used, createdAt: _c, updatedAt: _u, ...current } = existing;
  const merged = parse(CouponInput, { ...current, ...req.body });

  const row = await prisma.coupon.update({ where: { id: existing.id }, data: merged });
  await logActivity(req, `Updated coupon ${row.code}`, "Coupon", row.id);
  res.json({ data: row });
});

adminCouponsRouter.delete("/:id", allow(...ROLES.catalog), async (req, res) => {
  // A used coupon is deactivated rather than deleted, so order history keeps
  // a meaningful code to point at.
  const row = await prisma.coupon.findUnique({ where: { id: param(req, "id") } });
  if (!row) throw notFound("Coupon");
  if (row.usedCount > 0) {
    await prisma.coupon.update({ where: { id: row.id }, data: { isActive: false } });
    await logActivity(req, `Deactivated used coupon ${row.code}`, "Coupon", row.id);
  } else {
    await prisma.coupon.delete({ where: { id: row.id } });
    await logActivity(req, `Deleted coupon ${row.code}`, "Coupon", row.id);
  }
  res.status(204).end();
});

/* ── Simple content resources ─────────────────────────────────────────── */

export const adminFaqsRouter = crudRouter({
  entity: "FAQ",
  roles: ROLES.content,
  schema: z.object({
    question: z.string().trim().min(5).max(300),
    answer: z.string().trim().min(2).max(5000),
    category: z.string().trim().min(2).max(60),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(true),
  }),
  label: (r) => `“${r.question}”`,
  list: () => prisma.faq.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
  create: (data) => prisma.faq.create({ data }),
  update: (id, data) => prisma.faq.update({ where: { id }, data }),
  remove: (id) => prisma.faq.delete({ where: { id } }),
});

export const adminTestimonialsRouter = crudRouter({
  entity: "Testimonial",
  roles: ROLES.content,
  schema: z.object({
    author: z.string().trim().min(2).max(100),
    role: z.string().trim().min(2).max(100),
    rating: z.number().int().min(1).max(5).default(5),
    quote: z.string().trim().min(5).max(1000),
    avatarUrl: z.string().max(500).nullish(),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  }),
  label: (r) => `from ${r.author}`,
  list: () => prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
  create: (data) => prisma.testimonial.create({ data }),
  update: (id, data) => prisma.testimonial.update({ where: { id }, data }),
  remove: (id) => prisma.testimonial.delete({ where: { id } }),
});

export const adminBannersRouter = crudRouter({
  entity: "Banner",
  roles: ROLES.content,
  schema: z.object({
    name: z.string().trim().min(2).max(120),
    placement: z.string().trim().min(2).max(80),
    headline: z.string().trim().max(200).nullish(),
    imageUrl: z.string().max(500).nullish(),
    href: z.string().max(500).nullish(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
  }),
  label: (r) => r.name,
  list: () => prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
  create: (data) => prisma.banner.create({ data }),
  update: (id, data) => prisma.banner.update({ where: { id }, data }),
  remove: (id) => prisma.banner.delete({ where: { id } }),
});

export const adminCollaboratorsRouter = crudRouter({
  entity: "Collaborator",
  roles: ROLES.content,
  schema: z.object({
    name: z.string().trim().min(2).max(100),
    role: z.string().trim().min(2).max(100),
    avatarUrl: z.string().max(500).nullish(),
    sortOrder: z.number().int().default(0),
  }),
  label: (r) => r.name,
  list: () => prisma.collaborator.findMany({ orderBy: { sortOrder: "asc" } }),
  create: (data) => prisma.collaborator.create({ data }),
  update: (id, data) => prisma.collaborator.update({ where: { id }, data }),
  remove: (id) => prisma.collaborator.delete({ where: { id } }),
});

export const adminOffersRouter = crudRouter({
  entity: "Offer",
  roles: ROLES.catalog,
  schema: z.object({
    name: z.string().trim().min(2).max(120),
    scope: z.string().trim().min(2).max(200),
    isActive: z.boolean().default(true),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  }),
  label: (r) => r.name,
  list: () => prisma.offer.findMany({ orderBy: { startsAt: "desc" } }),
  create: (data) => prisma.offer.create({ data }),
  update: (id, data) => prisma.offer.update({ where: { id }, data }),
  remove: (id) => prisma.offer.delete({ where: { id } }),
});
