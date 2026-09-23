import type { MetadataRoute } from "next";
import { getBlogPosts, getProducts } from "@/lib/api/server";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/** Pages worth finding in a search engine. Cart, checkout and account pages are left out. */
const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/shop", priority: 0.9 },
  { path: "/offers", priority: 0.7 },
  { path: "/about", priority: 0.6 },
  { path: "/ingredients", priority: 0.6 },
  { path: "/reviews", priority: 0.6 },
  { path: "/collabs", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/faqs", priority: 0.5 },
  { path: "/shipping", priority: 0.3 },
  { path: "/returns", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

// Products come from the API (cached for a minute), so a product added in the
// admin joins the sitemap without a rebuild.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts(), getBlogPosts(50)]);
  return [
    ...PAGES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.images.map((i) => absoluteUrl(i.url)),
    })),
    // The Journal, and each post. Only live posts come back from the API.
    ...(posts.length
      ? [{ url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      ...(p.coverUrl ? { images: [absoluteUrl(p.coverUrl)] } : {}),
    })),
  ];
}
