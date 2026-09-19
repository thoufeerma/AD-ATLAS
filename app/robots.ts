import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
