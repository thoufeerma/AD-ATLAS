/**
 * The store's public address (no trailing slash). Used for absolute links that
 * leave the site: the sitemap, robots.txt, share previews and Google's product
 * data. Set SITE_URL to the real domain when the store goes live.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Whether search engines are welcome is an admin setting (SEO Settings), so it
 * can be switched on at launch without a deploy. This env var is the override
 * for copies of the site that must never be indexed whatever the admin says:
 * set ALLOW_INDEXING=false on a staging or preview deployment.
 */
export const INDEXING_BLOCKED = process.env.ALLOW_INDEXING === "false";

/** "/products/x.png" → "https://velastia.com/products/x.png"; absolute URLs pass through. */
export function absoluteUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Centralized Store Contact & Company Information (Single Source of Truth)
 */
export const SUPPORT_PHONE = "+91 86066 30088";
export const SUPPORT_PHONE_TEL = "+918606630088";
export const SUPPORT_WHATSAPP_NUMBER = "918606630088";
export const SUPPORT_HOURS = "Mon – Sat | 10AM – 7PM";

/** Default support email (pending user confirmation between .in and .com) */
export const SUPPORT_EMAIL = "hello@velastia.in";

/** Company address constant (placeholder pending user's official registered address) */
export const STORE_ADDRESS = {
  company: "Velastia Beauty Pvt. Ltd.",
  line1: "123, Beauty Street, Andheri West",
  city: "Mumbai",
  postalCode: "400058",
  country: "India",
  formatted: "Velastia Beauty Pvt. Ltd.\n123, Beauty Street, Andheri West,\nMumbai – 400058, India",
};

/**
 * Marketing claims and operational statistics shown across storefront pages.
 * NOTE: These numbers must be verified for truthfulness and legal accuracy prior to official launch.
 */
export const CLAIMS = {
  happyCustomers: "10K+",
  productsLoved: "50K+",
  pincodesCovered: "29,000+",
  deliveriesDaily: "1000+",
  panIndiaDelivery: "100%",
};

