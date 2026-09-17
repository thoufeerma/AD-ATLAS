"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRODUCTS, STORE, type Product } from "./products";

export type CartLine = {
  slug: string;
  qty: number;
  shade?: string;
};

type CartState = {
  lines: CartLine[];
  wishlist: string[];
  coupon: string | null;
  add: (slug: string, qty?: number, shade?: string) => void;
  setQty: (slug: string, shade: string | undefined, qty: number) => void;
  remove: (slug: string, shade?: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  clearWishlist: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
};

const sameLine = (l: CartLine, slug: string, shade?: string) =>
  l.slug === slug && (l.shade ?? "") === (shade ?? "");

export const useStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      wishlist: [],
      coupon: null,

      add: (slug, qty = 1, shade) =>
        set((s) => {
          const existing = s.lines.find((l) => sameLine(l, slug, shade));
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                sameLine(l, slug, shade) ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return { lines: [...s.lines, { slug, qty, shade }] };
        }),

      setQty: (slug, shade, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameLine(l, slug, shade))
              : s.lines.map((l) => (sameLine(l, slug, shade) ? { ...l, qty } : l)),
        })),

      remove: (slug, shade) =>
        set((s) => ({ lines: s.lines.filter((l) => !sameLine(l, slug, shade)) })),

      clear: () => set({ lines: [], coupon: null }),

      toggleWish: (slug) =>
        set((s) => ({
          wishlist: s.wishlist.includes(slug)
            ? s.wishlist.filter((w) => w !== slug)
            : [...s.wishlist, slug],
        })),

      clearWishlist: () => set({ wishlist: [] }),

      applyCoupon: (code) => {
        const ok = code.trim().toUpperCase() === STORE.welcomeCode;
        if (ok) set({ coupon: STORE.welcomeCode });
        return ok;
      },

      removeCoupon: () => set({ coupon: null }),
    }),
    { name: "velastia-store" },
  ),
);

/**
 * True once the persisted cart has been read back out of localStorage.
 *
 * Server-rendered markup can't know what's in the visitor's storage, so any
 * component that renders cart or wishlist contents must hold off until this
 * flips. Subscribing to zustand's own hydration event (rather than flipping a
 * flag inside an effect) keeps this off the render path entirely.
 */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useStore.persist.onFinishHydration(onChange),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}

/* ── Derived helpers ──────────────────────────────────────────────────── */

export type ResolvedLine = CartLine & { product: Product; lineTotal: number };

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((l) => {
    const product = PRODUCTS.find((p) => p.slug === l.slug);
    if (!product) return [];
    return [{ ...l, product, lineTotal: product.price * l.qty }];
  });
}

/**
 * Cart totals. Mirrors the arithmetic on M-Cart-1.0v.png, which is the screen
 * that gets it right: subtotal is the sum of line totals, the VEL10 coupon
 * takes 10% off that, shipping is free above the threshold.
 *
 * Note: N-Order-Success-1.0v.png prints Subtotal Rs 4,031 / Discount Rs 403 for
 * the same three lines that sum to Rs 4,830 - its subtotal and discount lines
 * are wrong, though its Total Paid (Rs 4,347) matches this calculation.
 */
export function cartTotals(lines: ResolvedLine[], coupon: string | null) {
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  // Worked in integer paise, then returned as rupees. Discounts are NOT rounded
  // to whole rupees — 10% of ₹799 is ₹79.90 — matching the backend exactly.
  // Rupee floats would drift (799 - 79.9 = 719.0999…), so no float maths here.
  const toPaise = (rupees: number) => Math.round(rupees * 100);
  const subtotalP = lines.reduce((n, l) => n + toPaise(l.lineTotal), 0);
  const discountP = coupon ? Math.round((subtotalP * STORE.welcomeDiscountPct) / 100) : 0;
  const afterDiscountP = subtotalP - discountP;
  const shippingP =
    afterDiscountP >= toPaise(STORE.freeShippingAbove) || subtotalP === 0 ? 0 : toPaise(99);

  return {
    itemCount,
    subtotal: subtotalP / 100,
    discount: discountP / 100,
    shipping: shippingP / 100,
    total: (afterDiscountP + shippingP) / 100,
  };
}
