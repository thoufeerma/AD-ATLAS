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
