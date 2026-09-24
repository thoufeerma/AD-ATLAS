import { z } from "zod";
import { gstinProblem } from "./gst.js";

/**
 * Store-wide settings editable on the admin Settings screen. Each is one row
 * in the `settings` table, keyed by name, holding JSON of the shape below.
 *
 * Imports nothing server-side, so the seed script can use the defaults too.
 */

/** A social profile link: https only, or empty to hide that icon. */
const SocialUrl = z.union([
  z.literal("").transform(() => null),
  z.null(),
  z.url({ protocol: /^https$/, error: "Use a full https:// link" }).max(300),
]);

const SocialLinks = z.object({
  instagram: SocialUrl,
  youtube: SocialUrl,
  facebook: SocialUrl,
  x: SocialUrl,
  pinterest: SocialUrl,
});

export const StoreSettings = z.object({
  name: z.string().trim().min(2).max(60),
  legalEntity: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(120),
  supportEmail: z.email(),
  supportPhone: z.string().trim().min(8).max(20),
  supportHours: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
  /** Profiles shown as icons in the header and footer; empty ones are hidden. */
  social: SocialLinks.default({ instagram: null, youtube: null, facebook: null, x: null, pinterest: null }),
  /** Shown above the Instagram strip on the homepage, e.g. "@velastia.beauty". */
  instagramHandle: z
    .string()
    .trim()
    .max(40)
    .nullish()
    .transform((h) => (h ? (h.startsWith("@") ? h : `@${h}`) : null)),
});

export type StoreSettings = z.infer<typeof StoreSettings>;

/**
 * Stored store details with the newer fields (social links) filled in, so
 * settings saved before they existed still have the full shape.
 */
export function readStore(stored: unknown) {
  const s = (stored ?? {}) as Partial<StoreSettings>;
  return {
    ...s,
    social: { instagram: null, youtube: null, facebook: null, x: null, pinterest: null, ...(s.social ?? {}) },
    instagramHandle: s.instagramHandle ?? null,
  };
}

/** Which coupon the site advertises as its welcome offer, or none. */
export const WelcomeOfferSettings = z.object({
  code: z
    .string()
    .trim()
    .max(40)
    .transform((c) => c.toUpperCase())
    .nullable(),
});

/**
 * Marketing lines from the designs that make claims about the business.
 * They're settings so they can be kept truthful as the store grows.
 */
export const CopySettings = z.object({
  /** Homepage rating panel heading; also the login page badge title. */
  ratingHeadline: z.string().trim().min(2).max(60),
  /** Heading of the cart page's testimonial panel. */
  socialProofHeadline: z.string().trim().min(2).max(80),
  /** The "Happy Customers" figure on the homepage, About and login pages. */
  happyCustomers: z.string().trim().min(1).max(20),
  /** The "Why Velastia?" list beside the cart summary. */
  whyVelastia: z.array(z.string().trim().min(2).max(60)).min(1).max(6),
});

export type CopySettings = z.infer<typeof CopySettings>;

export const DEFAULT_COPY: CopySettings = {
  ratingHeadline: "Loved by Thousands",
  socialProofHeadline: "Trusted by 10,000+ Beautiful Souls",
  happyCustomers: "10K+",
  whyVelastia: ["Dermatologically Tested", "No Harmful Chemicals", "Cruelty Free", "Loved by Thousands"],
};

/** Stored copy with any missing or invalid fields filled from the defaults. */
export function readCopy(stored: unknown): CopySettings {
  const parsed = CopySettings.partial().safeParse(stored ?? {});
  return { ...DEFAULT_COPY, ...(parsed.success ? parsed.data : {}) };
}

/**
 * Returns. The window is counted from the day the order was delivered, and the
 * policy page can print it with {{return_window_days}} so the two never drift
 * apart. Turning `accepted` off hides the request form and refuses new requests;
 * requests already in hand are unaffected.
 */
export const ReturnSettings = z.object({
  accepted: z.boolean(),
  windowDays: z.number().int().min(1).max(90),
  /** Shown above the request form, e.g. how to pack the parcel. */
  instructions: z.string().trim().max(600),
});

export type ReturnSettings = z.infer<typeof ReturnSettings>;

export const DEFAULT_RETURNS: ReturnSettings = {
  accepted: true,
  windowDays: 7,
  instructions:
    "Send items back unused, in their original packaging, with the invoice. We'll email you the pickup or courier details once your request is approved.",
};

export function readReturns(stored: unknown): ReturnSettings {
  const parsed = ReturnSettings.partial().safeParse(stored ?? {});
  return { ...DEFAULT_RETURNS, ...(parsed.success ? parsed.data : {}) };
}

/**
 * GST registration, for tax invoices. Invoicing is on once a GSTIN is saved:
 * orders then get an invoice as they ship, and the seller's state (the
 * GSTIN's first two digits) decides between CGST + SGST and IGST.
 */
const Gstin = z
  .string()
  .transform((s) => s.toUpperCase().replace(/\s+/g, ""))
  .superRefine((s, ctx) => {
    const problem = s ? gstinProblem(s) : null;
    if (problem) ctx.addIssue({ code: "custom", message: problem });
  })
  .transform((s) => s || null);

const TaxFields = z.object({
  gstin: Gstin.nullable(),
  /** As on the GST registration certificate. */
  legalName: z.string().trim().max(120),
  /** The registered place of business, printed on every invoice. */
  address: z.string().trim().max(300),
  /** Invoice numbers read PREFIX/2627/00001; 16 characters at most by law. */
  invoicePrefix: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{1,4}$/, "1 to 4 letters or digits, e.g. VL"),
});

export const TaxSettings = TaxFields.superRefine((t, ctx) => {
  if (!t.gstin) return;
  if (t.legalName.length < 2) {
    ctx.addIssue({ code: "custom", path: ["legalName"], message: "Enter the legal name on your GST registration" });
  }
  if (t.address.length < 10) {
    ctx.addIssue({ code: "custom", path: ["address"], message: "Enter your registered business address" });
  }
});

export type TaxSettings = z.infer<typeof TaxSettings>;

export const DEFAULT_TAX: TaxSettings = { gstin: null, legalName: "", address: "", invoicePrefix: "VL" };

export function readTax(stored: unknown): TaxSettings {
  const parsed = TaxFields.partial().safeParse(stored ?? {});
  return { ...DEFAULT_TAX, ...(parsed.success ? parsed.data : {}) };
}

/**
 * Search engines and link previews. The titles and descriptions below are the
 * ones the storefront shipped with; the admin edits them under SEO Settings,
 * and anything left empty falls back to these.
 *
 * Product pages and the policy pages carry their own (Products → SEO, Pages),
 * so they aren't listed here.
 */
export const SEO_PAGES = [
  "home",
  "shop",
  "about",
  "offers",
  "collabs",
  "reviews",
  "faqs",
  "ingredients",
  "contact",
  "track-order",
  "blog",
] as const;

export type SeoPage = (typeof SEO_PAGES)[number];

const PageMeta = z.object({
  /** Empty means "use the built-in wording". */
  title: z.string().trim().max(70),
  description: z.string().trim().max(200),
});

const PageMetaFields = Object.fromEntries(SEO_PAGES.map((p) => [p, PageMeta])) as Record<
  SeoPage,
  typeof PageMeta
>;

export const SeoSettings = z.object({
  /** The home page's title, and the fallback for anything without its own. */
  defaultTitle: z.string().trim().min(2).max(70),
  /** Added after every other page's title: "Shop Collection | Velastia". */
  titleSuffix: z.string().trim().max(40),
  description: z.string().trim().min(10).max(200),
  /** The picture shown when a link is shared. 1200×630 travels well. */
  shareImageUrl: z.union([z.literal("").transform(() => null), z.null(), z.string().trim().max(500)]),
  /**
   * Off keeps the whole site out of Google — the state a test copy should be
   * in. Turn it on at launch.
   */
  indexable: z.boolean(),
  pages: z.object(PageMetaFields),
});

export type SeoSettings = z.infer<typeof SeoSettings>;

const page = (title: string, description: string) => ({ title, description });

export const DEFAULT_SEO: SeoSettings = {
  defaultTitle: "Velastia — Luxury. Science. You.",
  titleSuffix: "Velastia",
  description:
    "Premium beauty, crafted with science and designed for the modern Indian woman. Clean, cruelty-free and dermatologically tested.",
  shareImageUrl: "/brand/og-image.png",
  indexable: false,
  pages: {
    home: page("", ""),
    shop: page(
      "Shop Collection",
      "Premium beauty essentials, crafted with science and luxury for the modern Indian woman.",
    ),
    about: page(
      "About Velastia",
      "Velastia is more than a beauty brand. It's a promise of luxury, backed by science, crafted for the modern Indian woman.",
    ),
    offers: page("Offers", "Current Velastia offers and coupon codes."),
    collabs: page(
      "Collaborations",
      "Partnering with creators, makeup artists and beauty experts who inspire beauty every day.",
    ),
    reviews: page("Reviews", "What Velastia customers say about the products they wear every day."),
    faqs: page("FAQs", "Answers to the questions we get asked most about Velastia."),
    ingredients: page(
      "Ingredients",
      "Every Velastia ingredient is chosen for performance and purity. Here's what goes in, and what never does.",
    ),
    contact: page("Contact Us", "Questions, feedback or collaboration ideas — we'd love to hear from you."),
    "track-order": page("Track Your Order", "Stay updated with every step. We're getting your Velastia beauty to you."),
    blog: page("The Journal", "Notes on ingredients, routines and the making of our products."),
  },
};

export function readSeo(stored: unknown): SeoSettings {
  const parsed = SeoSettings.partial().safeParse(stored ?? {});
  const seo = parsed.success ? parsed.data : {};
  return {
    ...DEFAULT_SEO,
    ...seo,
    // A page saved before a new one was added keeps the built-in wording.
    pages: { ...DEFAULT_SEO.pages, ...(seo.pages ?? {}) },
  };
}

/**
 * The address parcels are collected from. Couriers need it to book a pickup
 * and to print the "from" half of a label, and it's what a customer's return
 * comes back to.
 */
export const PickupSettings = z.object({
  contactName: z.string().trim().max(100),
  phone: z.string().trim().max(20),
  line1: z.string().trim().max(200),
  line2: z.string().trim().max(200),
  city: z.string().trim().max(80),
  state: z.string().trim().max(80),
  pincode: z.string().trim().max(10),
  /** What to put in each parcel's weight when nothing is known, in grams. */
  defaultParcelGrams: z.number().int().min(0).max(50_000),
});

export type PickupSettings = z.infer<typeof PickupSettings>;

export const DEFAULT_PICKUP: PickupSettings = {
  contactName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  defaultParcelGrams: 500,
};

export function readPickup(stored: unknown): PickupSettings {
  const parsed = PickupSettings.partial().safeParse(stored ?? {});
  return { ...DEFAULT_PICKUP, ...(parsed.success ? parsed.data : {}) };
}

/**
 * How customers may pay. Cash on delivery works on its own; the online
 * channels only appear once Razorpay is connected (its keys live in the
 * environment, never here).
 */
export const PaymentSettings = z
  .object({
    cod: z.boolean(),
    upi: z.boolean(),
    card: z.boolean(),
    netbanking: z.boolean(),
    wallet: z.boolean(),
  })
  .refine((p) => p.cod || p.upi || p.card || p.netbanking || p.wallet, {
    error: "Leave at least one way to pay switched on",
  });

export type PaymentSettings = z.infer<typeof PaymentSettings>;

export const DEFAULT_PAYMENTS: PaymentSettings = {
  cod: true,
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
};

export function readPayments(stored: unknown): PaymentSettings {
  const parsed = PaymentSettings.safeParse(stored ?? {});
  if (parsed.success) return parsed.data;
  const partial = (stored ?? {}) as Partial<PaymentSettings>;
  return { ...DEFAULT_PAYMENTS, ...partial };
}

/** Which emails the store sends, and who receives the store's own alerts. */
export const NotificationSettings = z.object({
  /** To the customer when an order is placed. */
  orderConfirmation: z.boolean(),
  /** To the customer when an order ships, is out for delivery, delivered, cancelled or refunded. */
  shippingUpdates: z.boolean(),
  /** To the team when an order is placed. */
  alertNewOrder: z.boolean(),
  /** To the team when a contact message or collab application arrives. */
  alertNewMessage: z.boolean(),
  /** To the customer when a return is approved, rejected or refunded. */
  returnUpdates: z.boolean(),
  /** To the team when a customer asks to return something. */
  alertReturnRequest: z.boolean(),
  alertRecipients: z
    .array(z.email().transform((e) => e.toLowerCase()))
    .max(10)
    .refine((list) => new Set(list).size === list.length, "Each address only once"),
});

export type NotificationSettings = z.infer<typeof NotificationSettings>;

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  orderConfirmation: true,
  shippingUpdates: true,
  alertNewOrder: true,
  alertNewMessage: true,
  returnUpdates: true,
  alertReturnRequest: true,
  alertRecipients: [],
};

export function readNotifications(stored: unknown): NotificationSettings {
  const parsed = NotificationSettings.partial().safeParse(stored ?? {});
  return { ...DEFAULT_NOTIFICATIONS, ...(parsed.success ? parsed.data : {}) };
}

/**
 * Body of a CMS page (the shipping, returns, terms and privacy policies):
 * a lead line and numbered sections of paragraphs. Text may contain tokens
 * such as {{free_shipping_above}} that the storefront fills from settings.
 */
export const PageBody = z.object({
  lead: z.string().trim().max(300),
  sections: z
    .array(
      z.object({
        heading: z.string().trim().min(2).max(120),
        body: z.array(z.string().trim().min(1).max(3000)).min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

/** Tokens the storefront replaces in page text, for the admin's help panel. */
export const PAGE_TOKENS = [
  "free_shipping_above",
  "shipping_fee",
  "support_email",
  "support_phone",
  "support_hours",
  "store_name",
  "legal_entity",
  "city",
  "return_window_days",
] as const;
