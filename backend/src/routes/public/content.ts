import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";
import { rateLimit } from "../../middleware/rateLimit.js";
import { readCopy, readStore } from "../../lib/settings.js";
import { afterResponse, type Email } from "../../lib/mail.js";
import { alertCollabApplication, alertContactMessage, mailContext } from "../../lib/emails.js";

type Store = Awaited<ReturnType<typeof mailContext>>["store"];

/** Tells the team about a new message or application, if they want to hear. */
function alertTeam(build: (store: Store, to: string) => Email) {
  afterResponse(async () => {
    const { store, notifications } = await mailContext();
    if (!notifications.alertNewMessage) return [];
    return notifications.alertRecipients.map((to) => build(store, to));
  });
}

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

/**
 * Every active banner, in admin order. The storefront picks them by placement:
 * `global.topbar` feeds the announcement bar, `cart.inline` the cart promo.
 */
contentRouter.get("/banners", async (_req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, placement: true, headline: true, imageUrl: true, href: true },
  });
  res.json({ data: banners });
});

/** Offers switched on in the admin and inside their date window right now. */
contentRouter.get("/offers", async (_req, res) => {
  const now = new Date();
  const offers = await prisma.offer.findMany({
    where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { endsAt: "asc" },
    select: { id: true, name: true, scope: true, startsAt: true, endsAt: true },
  });
  res.json({ data: offers });
});

contentRouter.get("/faqs", async (_req, res) => {
  const faqs = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { id: true, question: true, answer: true, category: true },
  });
  res.json({ data: faqs });
});

/** Published pages, for the storefront's policy navigation. */
contentRouter.get("/pages", async (_req, res) => {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    select: { slug: true, title: true },
  });
  res.json({ data: pages });
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
const PUBLIC_SETTING_KEYS = ["store", "welcomeOffer", "copy"] as const;

contentRouter.get("/settings/public", async (_req, res) => {
  const [settings, shipping] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: [...PUBLIC_SETTING_KEYS] } } }),
    // The default method — the first enabled one, as at checkout.
    prisma.shippingMethod.findFirst({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, eta: true, pricePaise: true, freeAbovePaise: true },
    }),
  ]);
  const values = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  res.json({
    data: {
      store: values.store ? readStore(values.store) : null,
      welcomeOffer: await liveWelcomeOffer(values.welcomeOffer),
      copy: readCopy(values.copy),
      shipping,
    },
  });
});

/**
 * The welcome code the site advertises, read from the coupon itself. If an
 * admin switches the coupon off, lets it expire or it runs out, the storefront
 * stops promoting it instead of advertising a code checkout would refuse.
 */
async function liveWelcomeOffer(setting: unknown) {
  const code = (setting as { code?: unknown } | undefined)?.code;
  if (typeof code !== "string" || !code) return null;

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  const now = new Date();
  const live =
    coupon?.isActive &&
    coupon.type === "PERCENTAGE" &&
    (!coupon.startsAt || coupon.startsAt <= now) &&
    (!coupon.expiresAt || coupon.expiresAt >= now) &&
    (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit);
  if (!coupon || !live) return null;

  return {
    code: coupon.code,
    // Basis points → percent: 1000 → 10, 1250 → 12.5.
    percent: coupon.value / 100,
    firstOrderOnly: coupon.firstOrderOnly,
    minOrderPaise: coupon.minOrderPaise,
  };
}

/* ── Public forms ─────────────────────────────────────────────────────── */

/** Ten submissions per form per visitor every ten minutes — plenty for a person. */
const formLimit = (name: string) => rateLimit({ name, max: 10, windowMs: 10 * 60_000 });

const ContactBody = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().max(20).nullish(),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(5000),
});

contentRouter.post("/contact", formLimit("contact form"), async (req, res) => {
  const body = parse(ContactBody, req.body);
  await prisma.contactMessage.create({ data: body });
  alertTeam((store, to) => alertContactMessage(body, store, to));
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
contentRouter.post("/newsletter", formLimit("newsletter"), async (req, res) => {
  const body = parse(SubscribeBody, req.body);
  await prisma.subscriber.upsert({
    where: { email: body.email },
    update: { status: "SUBSCRIBED" },
    create: { email: body.email, source: body.source ?? "website" },
  });
  res.status(201).json({ data: { subscribed: true } });
});

/** "@velastia.beauty", "velastia.beauty" or a link to the profile. */
const HANDLE = /^@?[A-Za-z0-9._-]{2,30}$/;
const PROFILE_URL = /^(https?:\/\/)?(www\.)?(instagram\.com|youtube\.com|youtu\.be)\/[A-Za-z0-9@._\-/]+$/i;

const CollabBody = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  // Applications are reviewed on the creator's profile, so this is required.
  handle: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .refine((h) => HANDLE.test(h) || PROFILE_URL.test(h), {
      error: "Use your handle (e.g. @velastia.beauty) or a link to your profile.",
    }),
  audienceSize: z.string().trim().max(40).nullish(),
  about: z.string().trim().min(10).max(5000),
});

contentRouter.post("/collab-applications", formLimit("application"), async (req, res) => {
  const body = parse(CollabBody, req.body);
  await prisma.collabApplication.create({ data: body });
  alertTeam((store, to) => alertCollabApplication(body, store, to));
  res.status(201).json({ data: { received: true } });
});
