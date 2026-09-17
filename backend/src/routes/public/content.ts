import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";

export const contentRouter = Router();

/** Everything the homepage needs beyond products, in one round trip. */
contentRouter.get("/content/home", async (_req, res) => {
  const [testimonials, collaborators, banners] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isFeatured: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, author: true, role: true, rating: true, quote: true, avatarUrl: true },
    }),
    prisma.collaborator.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, role: true, avatarUrl: true },
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, placement: true, headline: true, imageUrl: true, href: true },
    }),
  ]);
  res.json({ data: { testimonials, collaborators, banners } });
});

contentRouter.get("/faqs", async (_req, res) => {
  const faqs = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { id: true, question: true, answer: true, category: true },
  });
  res.json({ data: faqs });
});

contentRouter.get("/pages/:slug", async (req, res) => {
  const page = await prisma.page.findFirst({
    where: { slug: param(req, "slug"), status: "PUBLISHED" },
    select: { slug: true, title: true, body: true, metaTitle: true, metaDescription: true, updatedAt: true },
  });
  if (!page) throw notFound("Page");
  res.json({ data: page });
});

/**
 * Store-wide values the storefront shows in the announcement bar, footer and
 * cart — so changing the free-shipping threshold in the admin changes the site.
 * Only keys on this allow-list are public; other settings stay private.
 */
const PUBLIC_SETTING_KEYS = ["store", "welcomeOffer"] as const;

contentRouter.get("/settings/public", async (_req, res) => {
  const [settings, shipping] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: [...PUBLIC_SETTING_KEYS] } } }),
    prisma.shippingMethod.findFirst({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
      select: { pricePaise: true, freeAbovePaise: true },
    }),
  ]);
  res.json({
    data: {
      ...Object.fromEntries(settings.map((s) => [s.key, s.value])),
      shipping,
    },
  });
});

/* ── Public forms ─────────────────────────────────────────────────────── */

const ContactBody = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().max(20).nullish(),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(5000),
});

contentRouter.post("/contact", async (req, res) => {
  const body = parse(ContactBody, req.body);
  await prisma.contactMessage.create({ data: body });
  res.status(201).json({ data: { received: true } });
});

const SubscribeBody = z.object({
  email: z.email().transform((e) => e.toLowerCase()),
  source: z.string().trim().max(60).nullish(),
});

/**
 * Idempotent. Re-subscribing an existing address succeeds quietly, and the
 * response never reveals whether an email was already on the list.
 */
contentRouter.post("/newsletter", async (req, res) => {
  const body = parse(SubscribeBody, req.body);
  await prisma.subscriber.upsert({
    where: { email: body.email },
    update: { status: "SUBSCRIBED" },
    create: { email: body.email, source: body.source ?? "website" },
  });
  res.status(201).json({ data: { subscribed: true } });
});

const CollabBody = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  handle: z.string().trim().min(2).max(100),
  audienceSize: z.string().trim().max(40).nullish(),
  about: z.string().trim().min(10).max(5000),
});

contentRouter.post("/collab-applications", async (req, res) => {
  const body = parse(CollabBody, req.body);
  await prisma.collabApplication.create({ data: body });
  res.status(201).json({ data: { received: true } });
});
