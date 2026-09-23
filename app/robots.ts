import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { indexable } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!(await indexable())) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and transactional pages, and search results, have nothing to index.
      disallow: ["/account", "/cart", "/checkout", "/login", "/order-success", "/wishlist", "/search", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
