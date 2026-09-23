import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";

/**
 * The storefront's Journal. A post is public once its publish date has passed;
 * drafts and future dates stay hidden, so scheduling needs nothing to run.
 */
export const blogRouter = Router();

const published = (): Prisma.BlogPostWhereInput => ({
  status: { in: ["PUBLISHED", "SCHEDULED"] },
  publishedAt: { lte: new Date() },
});

/** Roughly how long it takes to read, at 200 words a minute. */
const minutes = (body: string) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));

const card = {
  slug: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  author: true,
  publishedAt: true,
} as const;

const ListQuery = z.object({ take: z.coerce.number().int().min(1).max(50).default(24) });

blogRouter.get("/blog", async (req, res) => {
  const { take } = parse(ListQuery, req.query);
  const posts = await prisma.blogPost.findMany({
    where: published(),
    orderBy: { publishedAt: "desc" },
    take,
    select: { ...card, body: true },
  });
  res.json({
    data: posts.map(({ body, ...p }) => ({ ...p, readingMinutes: minutes(body) })),
  });
});

blogRouter.get("/blog/:slug", async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug: param(req, "slug"), ...published() },
    select: { ...card, body: true },
  });
  if (!post) throw notFound("Post");
  res.json({ data: { ...post, readingMinutes: minutes(post.body) } });
});
