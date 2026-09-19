"use client";

import { useEffect, useState } from "react";
import { api } from "./api/client";
import type { CartItemInput, Product, Quote } from "./api/types";
import type { CartLine } from "./store";

/**
 * A cart line matched against the live catalog.
 *
 * The cart lives in the shopper's browser, so it can outlast the products in
 * it: an item can be archived, sold out or lose a shade after it was added.
 * Those lines stay visible with the reason, but are left out of pricing and
 * checkout until the shopper removes or fixes them.
 */
export type CartRow = CartLine & {
  product: Product | null;
  problem: string | null;
};

export function resolveCart(lines: CartLine[], products: Product[]): CartRow[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return lines.map((line) => {
    const product = bySlug.get(line.slug) ?? null;
    return { ...line, product, problem: problemWith(line, product) };
  });
}

function problemWith(line: CartLine, product: Product | null): string | null {
  if (!product) return "No longer available";
  if (product.status === "COMING_SOON") return "Not on sale yet";
  if (!product.inStock) return "Out of stock";
  if (product.shades.length > 0 && !product.shades.some((s) => s.name === line.shade)) {
    return "This shade is no longer available — choose another";
  }
  return null;
}

/** The lines the API can price, in the shape it expects. */
export function quoteItems(rows: CartRow[]): CartItemInput[] {
  return rows
    .filter((r) => !r.problem)
    .map((r) => ({ slug: r.slug, quantity: r.qty, shade: r.shade ?? null }));
}

type QuoteRequest = {
  items: CartItemInput[];
  couponCode?: string | null;
  email?: string | null;
  shippingMethodId?: string | null;
};

/**
 * Server-priced totals for the cart. The browser never does the maths that
 * ends up on an order: the API prices every line, applies the coupon and
 * shipping, and the result is shown as-is.
 *
 * Re-quotes (debounced) whenever the request changes. While a new quote is in
 * flight the previous one stays on screen, flagged `stale`, so totals don't
 * flicker on every quantity click.
 */
export function useQuote(request: QuoteRequest | null) {
  const key = request && request.items.length > 0 ? JSON.stringify(request) : null;
  const [state, setState] = useState<{ key: string | null; quote?: Quote; error?: string }>({
    key: null,
  });

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<Quote>("POST", "/cart/quote", JSON.parse(key), { signal: controller.signal })
        .then((quote) => setState({ key, quote }))
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Keep the last good totals visible under the error.
          setState((s) => ({ key, quote: s.quote, error: (err as Error).message }));
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  if (!key) return { quote: undefined, error: undefined, stale: false };
  const current = state.key === key;
  return {
    quote: state.quote,
    error: current ? state.error : undefined,
    stale: !current,
  };
}
