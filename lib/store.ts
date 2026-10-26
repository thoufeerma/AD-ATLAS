"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearWishOnAccount, pushWish } from "./wishlist";

/** The API accepts up to 20 of one item per order. */
export const MAX_QTY = 20;

export type CartLine = {
  slug: string;
  qty: number;
  shade?: string;
};

export type CartToastItem = {
  id: string;
  slug: string;
  qty: number;
  shade?: string;
  name?: string;
  pricePaise?: number;
  image?: string;
};

type CartState = {
  lines: CartLine[];
  wishlist: string[];
  /** A code the API has accepted at least once. Re-checked on every quote. */
  coupon: string | null;
  /** In-memory notification for the most recently added item. */
  notification: CartToastItem | null;
  add: (
    slug: string,
    qty?: number,
    shade?: string,
    meta?: { name?: string; pricePaise?: number; image?: string },
  ) => void;
  showNotification: (item: Omit<CartToastItem, "id">) => void;
  dismissNotification: () => void;
  setQty: (slug: string, shade: string | undefined, qty: number) => void;
  remove: (slug: string, shade?: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  /** "Clear all" on the wishlist page — the account's copy goes too. */
  clearWishlist: () => void;
  /** Drops this browser's copy only, on sign-out. */
  resetWishlist: () => void;
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
      notification: null,

      add: (slug, qty = 1, shade, meta) =>
        set((s) => {
          const existing = s.lines.find((l) => sameLine(l, slug, shade));
          const newLines = existing
            ? s.lines.map((l) =>
                sameLine(l, slug, shade) ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              )
            : [...s.lines, { slug, qty: Math.min(MAX_QTY, qty), shade }];

          return {
            lines: newLines,
            notification: {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              slug,
              qty,
              shade,
              name: meta?.name,
              pricePaise: meta?.pricePaise,
              image: meta?.image,
            },
          };
        }),

      showNotification: (item) =>
        set({
          notification: {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          },
        }),

      dismissNotification: () => set({ notification: null }),

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
        set((s) => {
          const wished = !s.wishlist.includes(slug);
          // Signed in? The account keeps it too, so it follows them to their
          // other devices. Nothing here waits for that to finish.
          void pushWish(slug, wished);
          return { wishlist: wished ? [...s.wishlist, slug] : s.wishlist.filter((w) => w !== slug) };
        }),

      clearWishlist: () => {
        void clearWishOnAccount();
        set({ wishlist: [] });
      },

      resetWishlist: () => set({ wishlist: [] }),

      setCoupon: (code) => set({ coupon: code.trim().toUpperCase() }),

      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: "velastia-store",
      partialize: (s) => ({
        lines: s.lines,
        wishlist: s.wishlist,
        coupon: s.coupon,
      }),
    },
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
