/**
 * VELASTIA - CATALOG SOURCE OF TRUTH
 * ==================================
 * Every page reads from this file. Fix a value here and the whole site updates.
 *
 * The reference designs contradict each other in several places. Where they do,
 * the newer "Gen B" (2025) screens - Cart, Wishlist, Order Success - win, since
 * those are the most recent artwork. Each conflict is tagged CONFLICT below.
 * Replace these with the real catalog when it is available.
 */

export type CategoryId =
  | "lipstick"
  | "lip-care"
  | "face"
  | "skincare"
  | "accessories"
  | "perfume";

export type Shade = { name: string; code: string; hex: string };

export type Product = {
  slug: string;
  name: string;
  /** Short "Brightens - Hydrates - Repairs" line used on cart/wishlist rows */
  descriptor?: string;
  size?: string;
  price: number;
  compareAt?: number;
  category: CategoryId;
  image: string;
  status: "active" | "coming-soon";
  bestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  shades?: Shade[];
  benefits?: string[];
  blurb?: string;
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "lipstick", label: "Lipstick" },
  { id: "lip-care", label: "Lip Care" },
  { id: "face", label: "Face" },
  { id: "skincare", label: "Skincare" },
  { id: "accessories", label: "Accessories" },
  { id: "perfume", label: "Perfume" },
];

/**
 * CONFLICT - shade list.
 * The product page draws SEVEN swatches but names only SIX shades underneath.
 * Cart, Wishlist and Order Success all show a shade called "Royal Rose", which
 * appears nowhere in that list of six. Kept the six named shades (hexes sampled
 * from the swatch row of C-1-Product page-1.0v.png) and dropped the 7th unnamed
 * swatch. "Royal Rose" is treated as an alias of "Rose Desire" - please confirm.
 */
const LIPSTICK_SHADES: Shade[] = [
  { code: "01", name: "Rose Desire", hex: "#9a3c41" },
  { code: "02", name: "Velvet Nude", hex: "#9b3f4a" },
  { code: "03", name: "Royal Plum", hex: "#863540" },
  { code: "04", name: "Crimson Bloom", hex: "#91343e" },
  { code: "05", name: "Mocha Silk", hex: "#8e303b" },
  { code: "06", name: "Ruby Luxe", hex: "#822d39" },
];

const PLACEHOLDER = "/products/matte-lipstick.png";

export const PRODUCTS: Product[] = [
  {
    slug: "velvet-matte-lipstick",
    name: "Velastia Velvet Matte Lipstick",
    descriptor: "Long Stay - Smooth Matte Finish",
    price: 799,
    category: "lipstick",
    image: "/products/matte-lipstick.png",
    status: "active",
    bestseller: true,
    rating: 4.9,
    reviewCount: 2547,
    shades: LIPSTICK_SHADES,
    blurb:
      "Intense color payoff with a velvety matte finish that lasts all day. Enriched with Vitamin E and plant-based oils for comfortable wear.",
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
    slug: "velvet-matte-liquid-lipstick",
    name: "Velastia Velvet Matte Liquid Lipstick",
    descriptor: "One Swipe Color - Transfer Resistant",
    price: 899,
    category: "lipstick",
    image: "/products/hyper-gloss.png",
    status: "active",
    bestseller: true,
    rating: 4.8,
    reviewCount: 1284,
    shades: LIPSTICK_SHADES,
  },
  {
    // CONFLICT - price. Home says Rs 1,099 ("Velvet Radiance Foundation"),
    // Shop says Rs 1,299 ("Foundation"), Wishlist + Order Success say Rs 1,499
    // ("Velastia Foundation - Natural Beige"). Using the newest: Rs 1,499.
    slug: "radiance-foundation",
    name: "Velastia Foundation",
    descriptor: "Natural Beige",
    price: 1499,
    category: "face",
    image: "/products/foundation.png",
    status: "active",
    bestseller: true,
    rating: 4.7,
    reviewCount: 612,
  },
  {
    slug: "glow-boost-primer",
    name: "Velastia Glow Boost Primer",
    descriptor: "Blurs - Smooths - Preps",
    price: 699,
    category: "face",
    image: "/products/face-serum.png",
    status: "active",
    bestseller: true,
    rating: 4.6,
    reviewCount: 340,
  },
  {
    slug: "face-serum",
    name: "Velastia Face Serum",
    descriptor: "Brightens - Hydrates - Repairs",
    size: "30ml",
    price: 1245,
    category: "skincare",
    image: "/products/face-serum.png",
    status: "active",
    rating: 4.8,
    reviewCount: 421,
  },
  {
    // CONFLICT - Rs 1,987 is an odd retail price and appears for BOTH Day Cream
    // and Night Cream. Reads like placeholder copy. Confirm real pricing.
    slug: "day-cream",
    name: "Velastia Day Cream",
    descriptor: "Hydrates - Protects - Nourishes",
    size: "50g",
    price: 1987,
    category: "skincare",
    image: "/products/day-cream.png",
    status: "active",
    rating: 4.7,
    reviewCount: 288,
  },
  {
    slug: "night-cream",
    name: "Velastia Night Cream",
    descriptor: "Repairs - Renews - Restores",
    size: "50g",
    price: 1987,
    category: "skincare",
    image: "/products/night-cream.png",
    status: "active",
    rating: 4.7,
    reviewCount: 205,
  },
  {
    slug: "hyper-gloss",
    name: "Velastia Hyper Gloss",
    descriptor: "Luminizing Gloss",
    price: 1299,
    category: "lip-care",
    image: "/products/hyper-gloss.png",
    status: "active",
    rating: 4.6,
    reviewCount: 176,
  },
  {
    slug: "lip-liner",
    name: "Velastia Lip Liner",
    descriptor: "Perfect Nude",
    price: 599,
    category: "lip-care",
    image: "/products/lip-liner.png",
    status: "active",
    rating: 4.5,
    reviewCount: 132,
  },
  {
    slug: "makeup-fixer",
    name: "Velastia Makeup Fixer",
    descriptor: "Locks Makeup - Up to 16 Hours",
    price: 699,
    category: "face",
    image: "/products/face-serum.png",
    status: "active",
    rating: 4.6,
    reviewCount: 98,
  },

  /* Coming soon
     CONFLICT - the Shop page marks nearly everything COMING SOON, yet Cart,
     Wishlist and Order Success show Face Serum, Day Cream, Night Cream, Hyper
     Gloss, Lip Liner and Foundation as in-stock and purchasable. Resolved by
     making those six ACTIVE (above) and leaving the rest coming-soon. */
  { slug: "lip-polish", name: "Velastia Lip Polish", price: 699, category: "lip-care", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "lip-serum", name: "Velastia Lip Serum", price: 699, category: "lip-care", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "lip-balm", name: "Velastia Lip Balm", price: 499, category: "lip-care", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "lip-pigment", name: "Velastia Lip Pigment", price: 699, category: "lipstick", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "concealer", name: "Velastia Concealer", price: 699, category: "face", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "sunscreen", name: "Velastia Sunscreen", price: 699, category: "skincare", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "moisturizer", name: "Velastia Moisturizer", price: 899, category: "skincare", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "perfume", name: "Velastia Perfume", price: 1499, category: "perfume", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "face-masks", name: "Velastia Face Masks", price: 499, category: "skincare", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "pimple-cream", name: "Velastia Pimple Cream", price: 399, category: "skincare", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "cleansing-tissues", name: "Velastia Cleansing Tissues", price: 299, category: "accessories", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "brushes", name: "Velastia Makeup Brushes", price: 899, category: "accessories", image: PLACEHOLDER, status: "coming-soon" },
  { slug: "beauty-blender", name: "Velastia Beauty Blender", price: 299, category: "accessories", image: PLACEHOLDER, status: "coming-soon" },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const bestsellers = () => PRODUCTS.filter((p) => p.bestseller);
export const activeProducts = () => PRODUCTS.filter((p) => p.status === "active");

/** Store-wide values pulled off the announcement bar and cart panel. */
export const STORE = {
  freeShippingAbove: 999,
  giftAbove: 1999,
  welcomeCode: "VEL10",
  welcomeDiscountPct: 10,
  supportEmail: "hello@velastia.com",
  supportPhone: "+91 98765 43210",
  supportHours: "Mon - Sat | 10AM - 7PM",
  city: "Mumbai, India",
};
