import "server-only";

import type { Metadata } from "next";
import { getSettings } from "./api/server";
import { absoluteUrl, INDEXING_BLOCKED, SITE_URL } from "./site";
import type { SeoPage } from "./api/types";

/**
 * Every page's title, description and share card, built from SEO Settings in
 * the admin. A page left blank there keeps the wording the API's defaults
 * carry, so there is one place to look and one place to edit.
 *
 * Products and the policy pages are the exception: they carry their own
 * metadata, written on the product and page editors.
 */

/**
 * Whether search engines may index the site at all. During a deploy the API
 * may briefly be a version behind, so a missing setting means "stay hidden"
 * rather than an error page.
 */
export async function indexable() {
  if (INDEXING_BLOCKED) return false;
  const { seo } = await getSettings();
  return seo?.indexable ?? false;
}

const shareImage = (url: string | null) =>
  url ? [{ url: absoluteUrl(url), width: 1200, height: 630, alt: "Velastia" }] : undefined;

/** The site-wide defaults, applied in the root layout. */
export async function siteMetadata(): Promise<Metadata> {
  const { store, seo } = await getSettings();
  const name = store?.name ?? "Velastia";
  const home = seo?.pages?.home;
  const title = home?.title || seo?.defaultTitle || name;
  const description = home?.description || seo?.description || "";

  return {
    // Relative image and page URLs in metadata resolve against the live domain.
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: seo?.titleSuffix ? `%s | ${seo.titleSuffix}` : "%s" },
    description,
    // The card shown when a link is shared on WhatsApp, Instagram, X and so on.
    // Product pages replace it with the product's own photos.
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_IN",
      title,
      description,
      images: shareImage(seo?.shareImageUrl ?? null),
    },
    twitter: { card: "summary_large_image" },
    // A test copy of the store stays out of search results until the admin
    // switches indexing on (SEO Settings).
    ...((await indexable()) ? {} : { robots: { index: false, follow: false } }),
  };
}

/** One page's metadata, or the site defaults if the admin cleared it. */
export async function pageMetadata(page: SeoPage): Promise<Metadata> {
  const { seo } = await getSettings();
  const { title, description } = seo?.pages?.[page] ?? { title: "", description: "" };
  const suffix = seo?.titleSuffix ? ` | ${seo.titleSuffix}` : "";
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    openGraph: {
      ...(title ? { title: `${title}${suffix}` } : {}),
      ...(description ? { description } : {}),
    },
  };
}
