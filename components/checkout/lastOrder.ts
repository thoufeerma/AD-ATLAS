import type { PlacedOrder } from "@/lib/api/types";

/**
 * Handed from checkout to the confirmation page through sessionStorage — this
 * tab only, gone when it closes. The API never returns the full street
 * address after the fact, so this is the one place the confirmation can show
 * it; the order itself is the API's response.
 */
export const LAST_ORDER_KEY = "velastia-last-order";

export type LastOrder = {
  order: PlacedOrder;
  email: string;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
};
