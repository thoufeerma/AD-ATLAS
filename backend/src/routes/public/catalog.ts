import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";

export const catalogRouter = Router();

const productInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: "asc" } },
  shades: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Published review stats per product, in one grouped query. */
async function ratingsFor(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, { average: number; count: number }>();
  const rows = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    rows.map((r) => [
      r.productId,
      { average: Math.round((r._avg.rating ?? 0) * 10) / 10, count: r._count._all },
    ]),
  );
}

/**
 * Public product shape. Exact stock is not exposed — only whether it can be
 * bought and whether it is running low — so competitors can't read inventory.
 */
function toPublicProduct(p: ProductRow, rating?: { average: number; count: number }) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    descriptor: p.descriptor,
    blurb: p.blurb,
    size: p.size,
    pricePaise: p.pricePaise,
    compareAtPaise: p.compareAtPaise,
    status: p.status,
    isBestseller: p.isBestseller,
    inStock: p.status === "ACTIVE" && p.stock > 0,
    lowStock: p.status === "ACTIVE" && p.stock > 0 && p.stock <= p.lowStockThreshold,
    category: p.category,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    shades: p.shades.map((s) => ({ code: s.code, name: s.name, hex: s.hex })),
    benefits: p.benefits,
    rating: rating ?? { average: 0, count: 0 },
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
  };
}

catalogRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      _count: { select: { products: { where: { status: { in: ["ACTIVE", "COMING_SOON"] } } } } },
    },
  });
  res.json({
    data: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      productCount: c._count.products,
    })),
  });
});

const ListQuery = z.object({
  category: z.string().optional(),
  bestseller: z.enum(["true", "false"]).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "name"]).default("featured"),
});

catalogRouter.get("/products", async (req, res) => {
  const q = parse(ListQuery, req.query);

  const where: Prisma.ProductWhereInput = {
    // Drafts and archived products never reach the storefront.
    status: { in: ["ACTIVE", "COMING_SOON"] },
    category: { isVisible: true, ...(q.category ? { slug: q.category } : {}) },
    ...(q.bestseller === "true" ? { isBestseller: true } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    q.sort === "price-asc"
      ? [{ pricePaise: "asc" }]
      : q.sort === "price-desc"
        ? [{ pricePaise: "desc" }]
        : q.sort === "name"
          ? [{ name: "asc" }]
          : // featured: purchasable first, then bestsellers, then newest
            [{ status: "asc" }, { isBestseller: "desc" }, { createdAt: "desc" }];

  const products = await prisma.product.findMany({ where, orderBy, include: productInclude });
  const ratings = await ratingsFor(products.map((p) => p.id));

  res.json({ data: products.map((p) => toPublicProduct(p, ratings.get(p.id))) });
});

catalogRouter.get("/products/:slug", async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: param(req, "slug"), status: { in: ["ACTIVE", "COMING_SOON"] } },
    include: productInclude,
  });
  if (!product) throw notFound("Product");

  const [ratings, reviews] = await Promise.all([
    ratingsFor([product.id]),
    prisma.review.findMany({
      where: { productId: product.id, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, authorName: true, rating: true, body: true, isVerified: true, createdAt: true },
    }),
  ]);

  res.json({ data: { ...toPublicProduct(product, ratings.get(product.id)), reviews } });
});
