/**
 * The store's public address (no trailing slash). Used for absolute links that
 * leave the site: the sitemap, robots.txt, share previews and Google's product
 * data. Set SITE_URL to the real domain when the store goes live.
 */
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Search engines are told to stay away unless ALLOW_INDEXING=true, so a test
 * copy of the store online never shows up in Google. Turn it on at launch.
 */
export const INDEXABLE = process.env.ALLOW_INDEXING === "true";

/** "/products/x.png" → "https://velastia.com/products/x.png"; absolute URLs pass through. */
export function absoluteUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
