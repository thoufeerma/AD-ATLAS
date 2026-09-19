import "server-only";

import { cache } from "react";
import type {
  Banner,
  Category,
  Faq,
  HomeContent,
  Offer,
  Page,
  Product,
  ProductDetail,
  RatingSummary,
  Review,
  Settings,
} from "./types";

/**
 * Server-side reads from the Velastia API, for server components.
 *
 * Responses are cached for REVALIDATE seconds, so an edit in the admin shows
 * on the site within about a minute while visitors are served from cache.
 * If the API is down when a cached page goes stale, the last good page keeps
 * being served. This applies under `next dev` too, so allow a minute (or
 * restart the dev server) after changing data directly in the database.
 */
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const REVALIDATE = 60;

async function get<T>(path: string, init: RequestInit = { next: { revalidate: REVALIDATE } }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, init);
  } catch (cause) {
    throw new Error(
      `Velastia API unreachable at ${API_URL}. Start it with \`npm run dev\` in backend/.`,
      { cause },
    );
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status}): ${body?.error?.message ?? "no body"}`);
  }
  return body.data as T;
}

/** Like `get`, but a 404 is an answer (null) rather than an error. */
async function find<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}/api/v1${path}`, { next: { revalidate: REVALIDATE } });
  if (res.status === 404) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status}): ${body?.error?.message ?? "no body"}`);
  }
  return body.data as T;
}

// `cache` dedupes within one render: the layout, page and metadata can all ask
// for settings or a product and only one request goes out.

export const getSettings = cache(() => get<Settings>("/settings/public"));

export const getProducts = cache(() => get<Product[]>("/products"));

/** Not cached: every query is different, and results should match the live catalog. */
export const searchProducts = cache((q: string) =>
  get<Product[]>(`/products?q=${encodeURIComponent(q)}`, { cache: "no-store" }),
);

export const getBestsellers = cache(() => get<Product[]>("/products?bestseller=true"));

export const getProduct = cache((slug: string) =>
  find<ProductDetail>(`/products/${encodeURIComponent(slug)}`),
);

export const getCategories = cache(() => get<Category[]>("/categories"));

export const getHomeContent = cache(() => get<HomeContent>("/content/home"));

export const getBanners = cache(() => get<Banner[]>("/banners"));

export const getOffers = cache(() => get<Offer[]>("/offers"));

export const getFaqs = cache(() => get<Faq[]>("/faqs"));

export const getRatingSummary = cache(() => get<RatingSummary>("/reviews/summary"));

export const getReviews = cache(() => get<Review[]>("/reviews?limit=48"));

export const getPages = cache(() => get<Pick<Page, "slug" | "title">[]>("/pages"));

export const getPage = cache((slug: string) => find<Page>(`/pages/${encodeURIComponent(slug)}`));

/** Headlines of the active banners in one placement, in admin order. */
export async function bannerHeadlines(placement: string) {
  const banners = await getBanners();
  return banners
    .filter((b) => b.placement === placement && b.headline)
    .map((b) => b.headline as string);
}
