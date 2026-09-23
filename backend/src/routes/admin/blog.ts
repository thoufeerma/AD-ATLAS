import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { badRequest, conflict, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";

/**
 * Blog posts, written in the admin and read on the storefront's Journal.
 *
 * A post is public once its publish date has passed — so "scheduled" needs no
 * job to run, the date simply arrives. Drafts never appear, whatever date
 * they carry.
 */
export const adminBlogRouter = Router();
adminBlogRouter.use(allow(...ROLES.content));

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const BlogInput = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
    .max(80)
    .optional(),
  /** The teaser on the blog index and in link previews. */
  excerpt: z.string().trim().max(300).nullish(),
  /** Plain paragraphs, "## " headings and "- " bullets. */
  body: z.string().trim().min(10).max(50_000),
  author: z.string().trim().min(2).max(80),
  coverUrl: z.string().trim().max(500).nullish(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.coerce.date().nullish(),
});

/**
 * Fills in the publish date the status implies: publishing now means now, and
 * scheduling means a date in the future that hasn't arrived yet.
 */
function timing(data: Partial<z.infer<typeof BlogInput>>, current?: { publishedAt: Date | null }) {
  const { status } = data;
  if (!status) return data.publishedAt === undefined ? {} : { publishedAt: data.publishedAt ?? null };
  const at = data.publishedAt ?? current?.publishedAt ?? null;
  if (status === "PUBLISHED") return { status, publishedAt: at && at <= new Date() ? at : new Date() };
  if (status === "SCHEDULED") {
    if (!at || at <= new Date()) {
      throw badRequest("Pick a date in the future to schedule a post, or publish it now", [
        { path: "publishedAt", message: "Choose a future date and time" },
      ]);
    }
    return { status, publishedAt: at };
  }
  return { status, publishedAt: at };
}

const ListQuery = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
  q: z.string().trim().max(100).optional(),
});

adminBlogRouter.get("/", async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.BlogPostWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.q
      ? {
          OR: [
            { title: { contains: q.q, mode: "insensitive" } },
            { author: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      excerpt: true,
      coverUrl: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  res.json({ data: posts });
});

adminBlogRouter.get("/:id", async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: param(req, "id") } });
  if (!post) throw notFound("Post");
  res.json({ data: post });
});

adminBlogRouter.post("/", async (req, res) => {
  const body = parse(BlogInput, req.body);
  const slug = body.slug ?? slugify(body.title);
  if (await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } })) {
    throw conflict(`There's already a post at /blog/${slug} — give this one a different web address`);
  }
  const post = await prisma.blogPost.create({
    data: { ...body, slug, ...timing(body) },
  });
  await logActivity(req, `Created post “${post.title}”`, "BlogPost", post.id);
  res.status(201).json({ data: post });
});

adminBlogRouter.patch("/:id", async (req, res) => {
  const id = param(req, "id");
  const data = parsePatch(BlogInput, req.body);
  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) throw notFound("Post");
  if (data.slug && data.slug !== current.slug) {
    const taken = await prisma.blogPost.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (taken) throw conflict(`There's already a post at /blog/${data.slug}`);
  }
  const post = await prisma.blogPost.update({ where: { id }, data: { ...data, ...timing(data, current) } });
  await logActivity(req, `Updated post “${post.title}”`, "BlogPost", post.id);
  res.json({ data: post });
});

adminBlogRouter.delete("/:id", async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: param(req, "id") }, select: { id: true, title: true } });
  if (!post) throw notFound("Post");
  await prisma.blogPost.delete({ where: { id: post.id } });
  await logActivity(req, `Deleted post “${post.title}”`, "BlogPost", post.id);
  res.status(204).end();
});
