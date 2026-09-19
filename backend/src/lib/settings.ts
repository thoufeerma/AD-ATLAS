import { z } from "zod";

/**
 * Store-wide settings editable on the admin Settings screen. Each is one row
 * in the `settings` table, keyed by name, holding JSON of the shape below.
 *
 * Imports nothing server-side, so the seed script can use the defaults too.
 */

export const StoreSettings = z.object({
  name: z.string().trim().min(2).max(60),
  legalEntity: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(120),
  supportEmail: z.email(),
  supportPhone: z.string().trim().min(8).max(20),
  supportHours: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
});

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
] as const;
