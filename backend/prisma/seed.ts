/**
 * Seeds the database with the catalog, content and settings the two frontends
 * currently hardcode, so switching them to the API changes nothing visible.
 *
 * Idempotent: safe to run repeatedly. Uniquely-keyed rows are upserted;
 * keyless content (FAQs, testimonials…) is only inserted into an empty table.
 *
 * Data is copied here deliberately rather than imported from the storefront —
 * the backend must not depend on either frontend's source.
 *
 * Image URLs are storefront-relative paths for now (served from the store's
 * /public). They become absolute URLs once media moves to object storage.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient, type ProductStatus } from "../src/generated/prisma/client.js";
import { DEFAULT_COPY } from "../src/lib/settings.js";

// bcrypt used directly (same cost as the server) rather than importing the
// server's auth module, which would drag in its environment validation.
const hashPassword = (plain: string) => bcrypt.hash(plain, 12);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const rs = (rupees: number) => rupees * 100; // → paise

/* ── Reference data ───────────────────────────────────────────────────── */

const CATEGORIES = [
  { slug: "lipstick", name: "Lipstick", sortOrder: 1 },
  { slug: "lip-care", name: "Lip Care", sortOrder: 2 },
  { slug: "face", name: "Face", sortOrder: 3 },
  { slug: "skincare", name: "Skincare", sortOrder: 4 },
  { slug: "accessories", name: "Accessories", sortOrder: 5 },
  { slug: "perfume", name: "Perfume", sortOrder: 6 },
];

const LIPSTICK_SHADES = [
  { code: "01", name: "Rose Desire", hex: "#9a3c41" },
  { code: "02", name: "Velvet Nude", hex: "#9b3f4a" },
  { code: "03", name: "Royal Plum", hex: "#863540" },
  { code: "04", name: "Crimson Bloom", hex: "#91343e" },
  { code: "05", name: "Mocha Silk", hex: "#8e303b" },
  { code: "06", name: "Ruby Luxe", hex: "#822d39" },
];

type SeedProduct = {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  status: ProductStatus;
  stock: number;
  image: string;
  descriptor?: string;
  blurb?: string;
  size?: string;
  bestseller?: boolean;
  shades?: typeof LIPSTICK_SHADES;
  benefits?: string[];
};

const PLACEHOLDER = "/products/matte-lipstick.png";

// Prices, statuses and shades mirror the storefront's lib/products.ts, including
// its resolved design conflicts (foundation at ₹1,499, six products active).
const PRODUCTS: SeedProduct[] = [
  {
    slug: "velvet-matte-lipstick", sku: "VEL-LIP-001", name: "Velastia Velvet Matte Lipstick",
    category: "lipstick", price: 799, status: "ACTIVE", stock: 248, bestseller: true,
    image: "/products/matte-lipstick.png", descriptor: "Long Stay - Smooth Matte Finish",
    shades: LIPSTICK_SHADES,
    blurb: "Intense color payoff with a velvety matte finish that lasts all day. Enriched with Vitamin E and plant-based oils for comfortable wear.",
    benefits: [
      "Velvety matte finish with no dryness",
      "Enriched with Vitamin E and Jojoba Oil",
      "Lightweight and comfortable all day",
      "Does not settle into fine lines",
      "Designed for Indian skin tones",
      "Perfect for everyday and special occasions",
    ],
  },
  {
    slug: "velvet-matte-liquid-lipstick", sku: "VEL-LIP-002", name: "Velastia Velvet Matte Liquid Lipstick",
    category: "lipstick", price: 899, status: "ACTIVE", stock: 186, bestseller: true,
    image: "/products/hyper-gloss.png", descriptor: "One Swipe Color - Transfer Resistant",
    shades: LIPSTICK_SHADES,
  },
  {
    slug: "radiance-foundation", sku: "VEL-FAC-001", name: "Velastia Foundation",
    category: "face", price: 1499, status: "ACTIVE", stock: 132, bestseller: true,
    image: "/products/foundation.png", descriptor: "Natural Beige",
  },
  {
    slug: "glow-boost-primer", sku: "VEL-FAC-003", name: "Velastia Glow Boost Primer",
    category: "face", price: 699, status: "ACTIVE", stock: 90, bestseller: true,
    image: "/products/face-serum.png", descriptor: "Blurs - Smooths - Preps",
  },
  {
    slug: "face-serum", sku: "VEL-SKN-001", name: "Velastia Face Serum",
    category: "skincare", price: 1245, status: "ACTIVE", stock: 12, size: "30ml",
    image: "/products/face-serum.png", descriptor: "Brightens - Hydrates - Repairs",
  },
  {
    slug: "day-cream", sku: "VEL-SKN-002", name: "Velastia Day Cream",
    category: "skincare", price: 1987, status: "ACTIVE", stock: 94, size: "50g",
    image: "/products/day-cream.png", descriptor: "Hydrates - Protects - Nourishes",
  },
  {
    slug: "night-cream", sku: "VEL-SKN-003", name: "Velastia Night Cream",
    category: "skincare", price: 1987, status: "ACTIVE", stock: 10, size: "50g",
    image: "/products/night-cream.png", descriptor: "Repairs - Renews - Restores",
  },
  {
    slug: "hyper-gloss", sku: "VEL-LIP-004", name: "Velastia Hyper Gloss",
    category: "lip-care", price: 1299, status: "ACTIVE", stock: 76,
    image: "/products/hyper-gloss.png", descriptor: "Luminizing Gloss",
  },
  {
    slug: "lip-liner", sku: "VEL-LIP-005", name: "Velastia Lip Liner",
    category: "lip-care", price: 599, status: "ACTIVE", stock: 210,
    image: "/products/lip-liner.png", descriptor: "Perfect Nude",
  },
  {
    slug: "makeup-fixer", sku: "VEL-FAC-002", name: "Velastia Makeup Fixer",
    category: "face", price: 699, status: "ACTIVE", stock: 58,
    image: "/products/face-serum.png", descriptor: "Locks Makeup - Up to 16 Hours",
  },
  ...(
    [
      ["lip-polish", "VEL-LIP-006", "Velastia Lip Polish", "lip-care", 699],
      ["lip-serum", "VEL-LIP-007", "Velastia Lip Serum", "lip-care", 699],
      ["lip-balm", "VEL-LIP-003", "Velastia Lip Balm", "lip-care", 499],
      ["lip-pigment", "VEL-LIP-008", "Velastia Lip Pigment", "lipstick", 699],
      ["concealer", "VEL-FAC-004", "Velastia Concealer", "face", 699],
      ["sunscreen", "VEL-SKN-004", "Velastia Sunscreen", "skincare", 699],
      ["moisturizer", "VEL-SKN-005", "Velastia Moisturizer", "skincare", 899],
      ["perfume", "VEL-PRF-001", "Velastia Perfume", "perfume", 1499],
      ["face-masks", "VEL-SKN-006", "Velastia Face Masks", "skincare", 499],
      ["pimple-cream", "VEL-SKN-007", "Velastia Pimple Cream", "skincare", 399],
      ["cleansing-tissues", "VEL-ACC-003", "Velastia Cleansing Tissues", "accessories", 299],
      ["brushes", "VEL-ACC-002", "Velastia Makeup Brushes", "accessories", 899],
      ["beauty-blender", "VEL-ACC-001", "Velastia Beauty Blender", "accessories", 299],
    ] as const
  ).map(([slug, sku, name, category, price]) => ({
    slug, sku, name, category, price, status: "COMING_SOON" as const, stock: 0, image: PLACEHOLDER,
  })),
];

const FAQS = [
  ["Are Velastia products cruelty free?", "Yes. Every Velastia product is cruelty free and vegan. We never test on animals, and neither do our suppliers.", "Products"],
  ["Are the products suitable for Indian skin tones?", "They are designed for them. Every shade is developed and tested on Indian skin tones so the colour reads true rather than ashy or washed out.", "Products"],
  ["How long does delivery take?", "Standard shipping arrives in 3 to 5 business days, and is free on orders above ₹999. Metro cities are usually faster.", "Shipping"],
  ["What is your return policy?", "Unopened products can be returned within 7 days of delivery. Once we receive the item, refunds are processed to the original payment method within 5 to 7 business days.", "Returns"],
  ["Are the products dermatologically tested?", "Yes. Every formula is dermatologically tested and free from parabens and harmful chemicals.", "Products"],
  ["How do I track my order?", "You will receive an email and SMS with a tracking link once your order ships. You can also track it any time from the Track Order page.", "Shipping"],
] as const;

const TESTIMONIALS = [
  ["Ananya S.", "Verified Buyer", "Velastia lipsticks are my new obsession! The color payoff is insane.", "/people/malvika.png", true],
  ["Kavya M.", "Verified Buyer", "Beautiful packaging and such high quality. Totally worth it!", "/people/sakshi.png", true],
  ["Tanya P.", "Verified Buyer", "Perfect shades for Indian skin tones. Love the texture!", "/people/komal.png", true],
  ["Mehak S.", "Verified Buyer", "My everyday go-to brand now. Highly recommended!", "/people/sejal.png", true],
] as const;

const COLLABORATORS = [
  ["Malvika Sitlani", "Beauty Creator", "/people/malvika.png"],
  ["Sakshi Gupta", "Makeup Artist", "/people/sakshi.png"],
  ["Komal Pandey", "Fashion Influencer", "/people/komal.png"],
  ["Sejal Kumar", "Skincare Expert", "/people/sejal.png"],
  ["Rishabh Arora", "Makeup Artist", "/people/rishabh.png"],
] as const;

/* ── Seed ─────────────────────────────────────────────────────────────── */

async function main() {
  const log = (s: string) => console.log(`  ✓ ${s}`);
  console.log("Seeding Velastia database…");

  await prisma.setting.upsert({
    where: { key: "store" },
    update: {},
    create: {
      key: "store",
      value: {
        name: "Velastia",
        legalEntity: "AD Atlas Ventures Private Limited",
        tagline: "Luxury. Science. You.",
        supportEmail: "hello@velastia.com",
        supportPhone: "+91 98765 43210",
        supportHours: "Mon - Sat | 10AM - 7PM",
        city: "Mumbai, India",
      },
    },
  });
  await prisma.setting.upsert({
    where: { key: "welcomeOffer" },
    update: {},
    create: { key: "welcomeOffer", value: { code: "VEL10" } },
  });
  await prisma.setting.upsert({
    where: { key: "copy" },
    update: {},
    create: { key: "copy", value: DEFAULT_COPY },
  });
  log("settings");

  if ((await prisma.shippingMethod.count()) === 0) {
    await prisma.shippingMethod.createMany({
      data: [
        { name: "Standard Shipping", eta: "3 – 5 business days", pricePaise: rs(99), freeAbovePaise: rs(999), sortOrder: 1 },
        { name: "Express Shipping", eta: "1 – 2 business days", pricePaise: rs(199), sortOrder: 2 },
        { name: "Same-Day (Mumbai)", eta: "Same day, order before 12PM", pricePaise: rs(249), isEnabled: false, sortOrder: 3 },
      ],
    });
  }
  if ((await prisma.taxRate.count()) === 0) {
    await prisma.taxRate.createMany({
      data: [
        { name: "GST — Cosmetics", rateBps: 1800, region: "India (all states)" },
        { name: "GST — Accessories", rateBps: 1200, region: "India (all states)" },
      ],
    });
  }
  log("shipping methods and tax rates");

  const categoryIds = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
    categoryIds.set(c.slug, row.id);
  }
  log(`${CATEGORIES.length} categories`);

  for (const p of PRODUCTS) {
    const data = {
      sku: p.sku,
      name: p.name,
      descriptor: p.descriptor ?? null,
      blurb: p.blurb ?? null,
      size: p.size ?? null,
      pricePaise: rs(p.price),
      status: p.status,
      isBestseller: p.bestseller ?? false,
      stock: p.stock,
      benefits: p.benefits ?? [],
      categoryId: categoryIds.get(p.category)!,
    };
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      // Re-running never overwrites stock or prices an admin has since edited.
      continue;
    }
    await prisma.product.create({
      data: {
        slug: p.slug,
        ...data,
        images: { create: [{ url: p.image, alt: p.name, sortOrder: 0 }] },
        shades: { create: (p.shades ?? []).map((s, i) => ({ ...s, sortOrder: i })) },
      },
    });
  }
  log(`${PRODUCTS.length} products`);

  const coupons = [
    { code: "VEL10", type: "PERCENTAGE" as const, value: 1000, usageLimit: 5000, firstOrderOnly: true },
    { code: "WELCOME200", type: "FIXED" as const, value: rs(200), minOrderPaise: rs(999), usageLimit: 1000 },
    { code: "FREESHIP", type: "FREE_SHIPPING" as const, value: 0, usageLimit: 10000 },
    { code: "DIWALI25", type: "PERCENTAGE" as const, value: 2500, usageLimit: 2000, isActive: false },
  ];
  for (const c of coupons) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }
  log(`${coupons.length} coupons`);

  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({
      data: FAQS.map(([question, answer, category], i) => ({ question, answer, category, sortOrder: i })),
    });
  }
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: TESTIMONIALS.map(([author, role, quote, avatarUrl, isFeatured], i) => ({
        author, role, quote, avatarUrl, isFeatured, rating: 5, sortOrder: i,
      })),
    });
  }
  if ((await prisma.collaborator.count()) === 0) {
    await prisma.collaborator.createMany({
      data: COLLABORATORS.map(([name, role, avatarUrl], i) => ({ name, role, avatarUrl, sortOrder: i })),
    });
  }
  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        { name: "Homepage Hero — Luxury. Science. You.", placement: "home.hero", headline: "Luxury. Science. You.", imageUrl: "/brand/hero-products.png", href: "/shop", sortOrder: 1 },
        { name: "Announcement — Free Shipping ₹999", placement: "global.topbar", headline: "FREE SHIPPING ON ORDERS ABOVE ₹999", sortOrder: 2 },
        { name: "Announcement — VEL10", placement: "global.topbar", headline: "10% OFF ON FIRST ORDER – USE CODE: VEL10", sortOrder: 3 },
        { name: "Shop Sidebar — VEL10", placement: "shop.sidebar", headline: "Get 10% OFF on your first order", sortOrder: 4 },
        { name: "Cart — Complimentary Gift", placement: "cart.inline", headline: "Complimentary gift on orders above ₹1,999", sortOrder: 5 },
      ],
    });
  }
  if ((await prisma.offer.count()) === 0) {
    const year = new Date().getFullYear();
    // Offers are display-only; discounts are applied by coupons. The designs'
    // "Buy 2 Get 1 Free" is left out because nothing at checkout applies it.
    await prisma.offer.createMany({
      data: [
        { name: "10% Off First Order", scope: "New customers only", startsAt: new Date(`${year}-01-01`), endsAt: new Date(`${year}-12-31`) },
        { name: "Free Shipping Above ₹999", scope: "Storewide", startsAt: new Date(`${year}-01-01`), endsAt: new Date(`${year}-12-31`) },
      ],
    });
  }
  log("FAQs, testimonials, collaborators, banners, offers");

  // Policy pages. Text uses {{tokens}} (free shipping threshold, support email…)
  // that the storefront fills from settings; admins edit them on the Pages screen.
  const policies = JSON.parse(
    readFileSync(new URL("./content/policies.json", import.meta.url), "utf8"),
  ) as { slug: string; title: string; body: object; metaDescription: string }[];
  for (const p of policies) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, status: "PUBLISHED" },
    });
  }
  log(`${policies.length} policy pages`);

  if ((await prisma.review.count()) === 0) {
    const idFor = async (slug: string) =>
      (await prisma.product.findUniqueOrThrow({ where: { slug } })).id;
    await prisma.review.createMany({
      data: [
        { productId: await idFor("velvet-matte-lipstick"), authorName: "Ananya S.", rating: 5, body: "The colour payoff is insane. Lasts all day without drying my lips.", status: "PUBLISHED", isVerified: true },
        { productId: await idFor("face-serum"), authorName: "Kavya M.", rating: 5, body: "Beautiful packaging and such high quality. Totally worth it!", status: "PUBLISHED", isVerified: true },
        { productId: await idFor("day-cream"), authorName: "Tanya P.", rating: 4, body: "Lightweight and perfect for daily use. Wish the jar were bigger.", status: "PENDING" },
        { productId: await idFor("radiance-foundation"), authorName: "Mehak S.", rating: 5, body: "Finally a shade that matches Indian skin tones properly.", status: "PENDING" },
      ],
    });
  }
  log("reviews");

  // ── First administrator ──
  const adminCount = await prisma.adminUser.count();
  if (adminCount === 0) {
    const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;
    const isProd = process.env.NODE_ENV === "production";
    const weak = !password || password.length < 12 || password.startsWith("change-me");
    if (!email || !password) {
      console.warn("  ! No admin created — set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env");
    } else if (isProd && weak) {
      // The .env.example placeholder is fine on a laptop, never on a live store.
      throw new Error(
        "Refusing to create a production admin with a weak or placeholder password. " +
          "Set SEED_ADMIN_PASSWORD to a strong value (12+ characters).",
      );
    } else {
      await prisma.adminUser.create({
        data: {
          email,
          name: "Administrator",
          passwordHash: await hashPassword(password),
          role: "SUPER_ADMIN",
        },
      });
      log(`super administrator ${email} — change this password after first sign-in`);
    }
  } else {
    log(`admin users already exist (${adminCount}), none created`);
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
