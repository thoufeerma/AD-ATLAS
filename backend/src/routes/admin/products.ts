import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";

export const adminProductsRouter = Router();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ShadeInput = z.object({
  code: z.string().trim().min(1).max(10),
  name: z.string().trim().min(1).max(60),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #9a3c41"),
});

const ImageInput = z.object({
  url: z.string().min(1).max(500),
  alt: z.string().max(200).default(""),
});

const ProductInput = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
    .optional(),
  sku: z.string().trim().min(2).max(40).toUpperCase(),
  categoryId: z.string().min(1),
  descriptor: z.string().trim().max(160).nullish(),
  blurb: z.string().trim().max(2000).nullish(),
  size: z.string().trim().max(40).nullish(),
  pricePaise: z.number().int().min(0),
  compareAtPaise: z.number().int().min(0).nullish(),
  hsnCode: z
    .string()
    .trim()
    .regex(/^\d{4}(\d{2}){0,2}$/, "4, 6 or 8 digits, e.g. 3304")
    .default("3304"),
  /** Basis points: 1800 = 18%. */
  gstRateBps: z.number().int().min(0).max(4000).default(1800),
  status: z.enum(["ACTIVE", "DRAFT", "COMING_SOON", "ARCHIVED"]).default("DRAFT"),
  isBestseller: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(15),
  benefits: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  /** Packed weight in grams, for courier bookings. */
  weightGrams: z.number().int().min(0).max(50_000).nullish(),
  metaTitle: z.string().trim().max(70).nullish(),
  metaDescription: z.string().trim().max(170).nullish(),
  shades: z.array(ShadeInput).max(40).default([]),
  images: z.array(ImageInput).max(20).default([]),
});

const include = {
  category: { select: { id: true, name: true, slug: true } },
  shades: { orderBy: { sortOrder: "asc" } },
  images: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

const ListQuery = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "DRAFT", "COMING_SOON", "ARCHIVED"]).optional(),
  categoryId: z.string().optional(),
  lowStock: z.enum(["true"]).optional(),
});

adminProductsRouter.get("/", allow(...ROLES.catalog, ...ROLES.inventory, ...ROLES.ordersRead), async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.ProductWhereInput = {
    ...(q.status ? { status: q.status } : { status: { not: "ARCHIVED" } }),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.q
      ? {
          OR: [
            { name: { contains: q.q, mode: "insensitive" } },
            { sku: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  let products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true } } },
  });

  // Prisma can't compare two columns in `where`, so low-stock is filtered here.
  if (q.lowStock) {
    products = products.filter((p) => p.status === "ACTIVE" && p.stock <= p.lowStockThreshold);
  }

  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { in: products.map((p) => p.id) },
      order: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
    },
    _sum: { quantity: true },
  });
  const soldMap = new Map(sold.map((s) => [s.productId, s._sum.quantity ?? 0]));

  res.json({ data: products.map((p) => ({ ...p, sold: soldMap.get(p.id) ?? 0 })) });
});

adminProductsRouter.get("/:id", allow(...ROLES.catalog, ...ROLES.inventory, ...ROLES.ordersRead), async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: param(req, "id") }, include });
  if (!product) throw notFound("Product");
  res.json({ data: product });
});

adminProductsRouter.post("/", allow(...ROLES.catalog), async (req, res) => {
  const body = parse(ProductInput, req.body);
  const { shades, images, ...fields } = body;

  const product = await prisma.product.create({
    data: {
      ...fields,
      slug: body.slug ?? slugify(body.name),
      shades: { create: shades.map((s, i) => ({ ...s, sortOrder: i })) },
      images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
    },
    include,
  });

  await logActivity(req, `Created product ${product.name}`, "Product", product.id);
  res.status(201).json({ data: product });
});

adminProductsRouter.patch("/:id", allow(...ROLES.catalog), async (req, res) => {
  const body = parsePatch(ProductInput, req.body);
  const { shades, images, ...fields } = body;

  const before = await prisma.product.findUnique({ where: { id: param(req, "id") } });
  if (!before) throw notFound("Product");

  // Shades and images are replaced wholesale when provided — the edit form
  // always submits the full list, so a diff would add complexity for nothing.
  const product = await prisma.$transaction(async (tx) => {
    if (shades) {
      await tx.shade.deleteMany({ where: { productId: before.id } });
    }
    if (images) {
      await tx.productImage.deleteMany({ where: { productId: before.id } });
    }
    return tx.product.update({
      where: { id: before.id },
      data: {
        ...fields,
        ...(shades ? { shades: { create: shades.map((s, i) => ({ ...s, sortOrder: i })) } } : {}),
        ...(images ? { images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) } } : {}),
      },
      include,
    });
  });

  // Every tracked field is a string or number, so the diff is valid JSON.
  const changes: Record<string, { from: string | number; to: string | number }> = {};
  for (const key of ["pricePaise", "status", "stock", "name"] as const) {
    if (key in fields && before[key] !== product[key]) {
      changes[key] = { from: before[key], to: product[key] };
    }
  }
  await logActivity(req, `Updated product ${product.name}`, "Product", product.id, changes);

  res.json({ data: product });
});

/**
 * Products are archived, never hard-deleted: past orders reference them, and
 * an accidental delete would otherwise be unrecoverable.
 */
adminProductsRouter.delete("/:id", allow(...ROLES.catalog), async (req, res) => {
  const product = await prisma.product.update({
    where: { id: param(req, "id") },
    data: { status: "ARCHIVED" },
  });
  await logActivity(req, `Archived product ${product.name}`, "Product", product.id);
  res.status(204).end();
});

const StockBody = z
  .object({
    /** Set an absolute stock count (e.g. after a physical count)... */
    set: z.number().int().min(0).optional(),
    /** ...or adjust relative to the current count (e.g. +50 restock). */
    adjust: z.number().int().optional(),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((b) => (b.set === undefined) !== (b.adjust === undefined), {
    message: "Provide exactly one of `set` or `adjust`",
  });

adminProductsRouter.patch("/:id/stock", allow(...ROLES.inventory), async (req, res) => {
  const body = parse(StockBody, req.body);
  const current = await prisma.product.findUnique({ where: { id: param(req, "id") } });
  if (!current) throw notFound("Product");

  const next = body.set ?? current.stock + (body.adjust ?? 0);
  if (next < 0) throw badRequest(`Stock cannot go below zero (currently ${current.stock})`);

  const product = await prisma.product.update({
    where: { id: current.id },
    data: { stock: next },
  });

  await logActivity(
    req,
    `Stock for ${product.name}: ${current.stock} → ${next}`,
    "Inventory",
    product.id,
    { from: current.stock, to: next, reason: body.reason ?? null },
  );
  res.json({ data: product });
});
