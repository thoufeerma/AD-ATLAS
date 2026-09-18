"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The API accepts up to 20 of one item per order. */
export const MAX_QTY = 20;

export type CartLine = {
  slug: string;
  qty: number;
  shade?: string;
};

type CartState = {
  lines: CartLine[];
  wishlist: string[];
  /** A code the API has accepted at least once. Re-checked on every quote. */
  coupon: string | null;
  add: (slug: string, qty?: number, shade?: string) => void;
  setQty: (slug: string, shade: string | undefined, qty: number) => void;
  remove: (slug: string, shade?: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  clearWishlist: () => void;
  setCoupon: (code: string) => void;
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
                sameLine(l, slug, shade) ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { slug, qty: Math.min(MAX_QTY, qty), shade }] };
        }),

      setQty: (slug, shade, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => !sameLine(l, slug, shade))
              : s.lines.map((l) =>
                  sameLine(l, slug, shade) ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
                ),
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

      setCoupon: (code) => set({ coupon: code.trim().toUpperCase() }),

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
