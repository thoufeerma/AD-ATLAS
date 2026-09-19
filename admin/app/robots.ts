import type { MetadataRoute } from "next";

/** The admin is never for search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
