import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { pgConnection } from "../src/lib/pgConnection.js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(pgConnection(url, process.env.DATABASE_CA_CERT)),
});

const LIPSTICK_SHADES = [
  { code: "01", name: "Rose Desire", hex: "#9a3c41" },
  { code: "02", name: "Velvet Nude", hex: "#9b3f4a" },
  { code: "03", name: "Royal Plum", hex: "#863540" },
  { code: "04", name: "Crimson Bloom", hex: "#91343e" },
  { code: "05", name: "Mocha Silk", hex: "#8e303b" },
  { code: "06", name: "Ruby Luxe", hex: "#822d39" },
];

const IMAGES = [
  { url: "/products/velvet-matte-hero.jpg", alt: "Velastia Velvet Matte Lipstick in luxury gold and plum casing with box", sortOrder: 0 },
  { url: "/products/velvet-matte-texture.jpg", alt: "Velastia Velvet Matte Lipstick rich velvet cream texture swatch", sortOrder: 1 },
  { url: "/products/velvet-matte-swatches.jpg", alt: "Velastia Velvet Matte Lipstick 6 shades swatched on warm Indian skin tone", sortOrder: 2 },
  { url: "/products/velvet-matte-application.jpg", alt: "Velastia Velvet Matte Lipstick beauty application portrait", sortOrder: 3 },
];

const BENEFITS = [
  "Intense one-swipe colour payoff with an ultra-velvety cashmere matte finish",
  "Infused with cold-pressed Moroccan Jojoba Oil & Vitamin E to seal in deep moisture",
  "12-hour transfer-resistant and smudge-proof all-day wear",
  "Weightless comfort formula that never flakes, cakes, or settles into fine lines",
  "Curated undertones expertly tailored to flatter warm, neutral, and deep Indian skin tones",
  "100% Vegan, Cruelty-Free, Paraben-Free, and Dermatologically Tested",
];

const BLURB =
  "A masterclass in luxury lip artistry. Formulated with pure micronized pigments and enriched with Moroccan Jojoba Oil and Vitamin E, Velastia Velvet Matte Lipstick delivers intense, saturated colour in a single effortless swipe. Its featherweight, non-drying texture glides like silk and dries down to a comfortable, transfer-resistant cashmere-matte finish specifically crafted to complement Indian skin tones.";

const DESCRIPTOR = "12H Long Stay • Velvety Cashmere Finish • One-Swipe Pigment";

const REVIEWS = [
  {
    authorName: "Ananya Sharma",
    rating: 5,
    title: "Best luxury lipstick for Indian skin!",
    body: "The pigmentation is unreal! Just one swipe gives complete opacity and it feels completely weightless. Lasted through lunch and coffee without any smudging. The Royal Plum shade is absolute perfection.",
    isVerified: true,
    status: "PUBLISHED" as const,
  },
  {
    authorName: "Priya Nair",
    rating: 5,
    title: "Zero dryness, all velvet",
    body: "Most matte lipsticks dry out my lips by afternoon, but this formula with Vitamin E keeps them feeling soft and conditioned. The packaging feels so heavy and luxurious.",
    isVerified: true,
    status: "PUBLISHED" as const,
  },
  {
    authorName: "Sneha Reddy",
    rating: 5,
    title: "Velvet Nude is my new everyday holy grail",
    body: "Found my signature nude shade after months of searching. It doesn't wash me out at all. Will definitely be ordering the Crimson Bloom next!",
    isVerified: true,
    status: "PUBLISHED" as const,
  },
  {
    authorName: "Kavya Malhotra",
    rating: 5,
    title: "Beautiful finish and long lasting",
    body: "Very smooth application, beautiful packaging. Lasts easily 10 hours. Looks so chic in my purse and doesn't bleed outside the lip line.",
    isVerified: true,
    status: "PUBLISHED" as const,
  },
];

async function main() {
  console.log("Adding / updating products in database...");

  const category = await prisma.category.findUniqueOrThrow({
    where: { slug: "lipstick" },
  });

  // 1. Update existing velvet-matte-lipstick with all 4 photos and rich infos
  const existing = await prisma.product.findUnique({
    where: { slug: "velvet-matte-lipstick" },
  });

  if (existing) {
    console.log("Updating existing velvet-matte-lipstick...");
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        descriptor: DESCRIPTOR,
        blurb: BLURB,
        size: "3.8g / 0.13 oz",
        pricePaise: 79900,
        compareAtPaise: 99900,
        status: "ACTIVE",
        isBestseller: true,
        stock: 248,
        benefits: BENEFITS,
        metaTitle: "Velastia Velvet Matte Lipstick | Luxury Long-Wear Lip Colour",
        metaDescription: "Discover Velastia Velvet Matte Lipstick. Enriched with Vitamin E and Jojoba Oil for a 12-hour weightless, transfer-resistant cashmere matte finish.",
        images: {
          create: IMAGES,
        },
      },
    });

    // Delete dummy smoke test reviews and insert genuine reviews
    await prisma.review.deleteMany({
      where: { productId: existing.id, authorName: { startsWith: "Smoke Reviewer" } },
    });
    const reviewCount = await prisma.review.count({ where: { productId: existing.id } });
    if (reviewCount < 4) {
      for (const rev of REVIEWS) {
        await prisma.review.create({
          data: {
            productId: existing.id,
            ...rev,
          },
        });
      }
    }
    console.log("Updated velvet-matte-lipstick successfully!");
  }

  // 2. Add new flagship product: royal-velvet-matte-lipstick
  const newProductSlug = "royal-velvet-matte-lipstick";
  const newExisting = await prisma.product.findUnique({
    where: { slug: newProductSlug },
  });

  if (newExisting) {
    console.log(`Product ${newProductSlug} already exists, updating...`);
    await prisma.productImage.deleteMany({ where: { productId: newExisting.id } });
    await prisma.shade.deleteMany({ where: { productId: newExisting.id } });
    await prisma.product.update({
      where: { id: newExisting.id },
      data: {
        name: "Velastia Royal Velvet Matte Lipstick",
        descriptor: DESCRIPTOR,
        blurb: BLURB,
        size: "3.8g / 0.13 oz",
        pricePaise: 89900,
        compareAtPaise: 119900,
        status: "ACTIVE",
        isBestseller: true,
        stock: 350,
        benefits: BENEFITS,
        metaTitle: "Velastia Royal Velvet Matte Lipstick | Luxury Long-Wear Lip Colour",
        metaDescription: "Experience the Royal Velvet Matte Lipstick by Velastia. 12-hour transfer-proof wear enriched with Jojoba and Vitamin E.",
        images: {
          create: IMAGES,
        },
        shades: {
          create: LIPSTICK_SHADES.map((s, i) => ({ ...s, sortOrder: i })),
        },
      },
    });
  } else {
    console.log(`Creating new product ${newProductSlug}...`);
    const created = await prisma.product.create({
      data: {
        slug: newProductSlug,
        sku: "VEL-LIP-ROYAL-001",
        name: "Velastia Royal Velvet Matte Lipstick",
        descriptor: DESCRIPTOR,
        blurb: BLURB,
        size: "3.8g / 0.13 oz",
        pricePaise: 89900,
        compareAtPaise: 119900,
        status: "ACTIVE",
        isBestseller: true,
        stock: 350,
        benefits: BENEFITS,
        categoryId: category.id,
        metaTitle: "Velastia Royal Velvet Matte Lipstick | Luxury Long-Wear Lip Colour",
        metaDescription: "Experience the Royal Velvet Matte Lipstick by Velastia. 12-hour transfer-proof wear enriched with Jojoba and Vitamin E.",
        images: {
          create: IMAGES,
        },
        shades: {
          create: LIPSTICK_SHADES.map((s, i) => ({ ...s, sortOrder: i })),
        },
      },
    });

    for (const rev of REVIEWS) {
      await prisma.review.create({
        data: {
          productId: created.id,
          ...rev,
        },
      });
    }
    console.log(`Created new product ${newProductSlug} with id ${created.id}`);
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
