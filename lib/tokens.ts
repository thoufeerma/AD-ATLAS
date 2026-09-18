import type { Settings } from "./api/types";
import { inrPaise } from "./utils";

/**
 * Fills {{tokens}} in admin-written page text from live settings, so a policy
 * that says "free on orders above {{free_shipping_above}}" follows the
 * shipping threshold set in the admin. Unknown tokens are left as written.
 */
export function fillTokens(text: string, { store, shipping }: Settings) {
  const values: Record<string, string | undefined> = {
    free_shipping_above:
      shipping?.freeAbovePaise != null ? inrPaise(shipping.freeAbovePaise) : undefined,
    shipping_fee: shipping ? inrPaise(shipping.pricePaise) : undefined,
    support_email: store.supportEmail,
    support_phone: store.supportPhone,
    support_hours: store.supportHours,
    store_name: store.name,
    legal_entity: store.legalEntity,
    city: store.city,
  };
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}
