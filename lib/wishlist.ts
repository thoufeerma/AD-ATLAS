"use client";

import { api } from "./api/client";
import { useAccount } from "./account";
import { useStore } from "./store";

/**
 * Keeping the wishlist in step between this browser and the account.
 *
 * Guests only have the browser's copy (localStorage). When someone signs in
 * on a device for the first time, whatever that browser had joins the
 * account's list; from then on the account is the one that counts, so an item
 * removed on their phone doesn't reappear from the laptop's old copy. Signing
 * out clears the browser's copy, so a shared computer doesn't show the last
 * person's wishlist.
 *
 * Every call here is best-effort: the browser's copy is updated first, and
 * the shopper never sees an error if the sync fails.
 */

const SYNCED_KEY = "velastia-wishlist-synced";

/** The account this browser has already merged its wishlist into, if any. */
function syncedWith(): string | null {
  try {
    return localStorage.getItem(SYNCED_KEY);
  } catch {
    return null;
  }
}

function rememberSync(customerId: string | null) {
  try {
    if (customerId) localStorage.setItem(SYNCED_KEY, customerId);
    else localStorage.removeItem(SYNCED_KEY);
  } catch {
    // Private windows and blocked storage just mean we merge again next time.
  }
}

const signedIn = () => useAccount.getState().status === "signed-in";

/** Adds or removes one product on the account, if there is one. */
export async function pushWish(slug: string, wished: boolean) {
  if (!signedIn()) return;
  try {
    if (wished) await api<string[]>("POST", "/account/wishlist", { slug });
    else await api<string[]>("DELETE", `/account/wishlist/${encodeURIComponent(slug)}`);
  } catch {
    // Offline or signed out in another tab: the browser's copy still holds it.
  }
}

/**
 * Called whenever we learn who is signed in. The first time on this device it
 * merges; after that it simply takes the account's list.
 */
export async function syncWishlist(customerId: string) {
  const local = useStore.getState().wishlist;
  const first = syncedWith() !== customerId;
  try {
    const list = first
      ? await api<string[]>("POST", "/account/wishlist/merge", { slugs: local })
      : await api<string[]>("GET", "/account/wishlist");
    useStore.setState({ wishlist: list });
    rememberSync(customerId);
  } catch {
    // Leave the browser's copy alone; we'll try again on the next load.
  }
}

/** Empties the account's wishlist as well, when there is one. */
export async function clearWishOnAccount() {
  if (!signedIn()) return;
  try {
    await api<string[]>("DELETE", "/account/wishlist");
  } catch {
    // Same as above: the browser's copy is what the shopper sees.
  }
}

/** Signing out leaves the wishlist with the account, not the browser. */
export function forgetWishlist() {
  useStore.getState().resetWishlist();
  rememberSync(null);
}
