/**
 * Promotional Campaign and Sale Festival configuration.
 *
 * Use this to run site-wide or product-specific sale events like:
 * - "Great Indian Festival"
 * - "Festive Deal"
 * - "Diwali Special"
 * - "Limited Time Deal"
 * - "Summer Beauty Sale"
 *
 * Setting `enabled: true` displays the festival banner/tag, discount percentage,
 * and Amazon-style deal formatting on discounted products.
 */

export type CampaignConfig = {
  /** Master switch to turn the festival sale event on or off */
  enabled: boolean;
  /** The promotional festival title (e.g. "Great Indian Festival") */
  tag: string;
  /** Badge theme color: defaults to Amazon-style festive crimson (#CC0C39) */
  badgeColor?: string;
  /**
   * Which products are part of the sale:
   * - "*": all products with a discount (compareAtPaise > pricePaise)
   * - array of slugs: only specific products (e.g. ["royal-velvet-matte-lipstick", "velvet-matte-lipstick"])
   */
  productSlugs?: string[] | "*";
  /** Custom per-product badges (overrides the general tag for specific items) */
  customBadges?: Record<string, string>;
};

export const ACTIVE_CAMPAIGN: CampaignConfig = {
  enabled: true,
  tag: "Great Indian Festival",
  badgeColor: "#cc0c39",
  productSlugs: "*",
  customBadges: {},
};

/**
 * Returns the active sale/festival badge for a product, if applicable.
 */
export function getProductSaleBadge(product: {
  slug: string;
  pricePaise: number;
  compareAtPaise?: number | null;
  saleBadge?: string | null;
}): string | null {
  if (product.saleBadge) return product.saleBadge;
  if (ACTIVE_CAMPAIGN.customBadges?.[product.slug]) {
    return ACTIVE_CAMPAIGN.customBadges[product.slug];
  }
  if (!ACTIVE_CAMPAIGN.enabled) return null;

  const hasDiscount = product.compareAtPaise != null && product.compareAtPaise > product.pricePaise;
  if (!hasDiscount) return null;

  if (ACTIVE_CAMPAIGN.productSlugs === "*" || ACTIVE_CAMPAIGN.productSlugs?.includes(product.slug)) {
    return ACTIVE_CAMPAIGN.tag;
  }

  return null;
}

/**
 * Calculates discount percentage (e.g. 25 for 25% off).
 */
export function getDiscountPercentage(pricePaise: number, compareAtPaise?: number | null): number {
  if (!compareAtPaise || compareAtPaise <= pricePaise) return 0;
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}
