"use client";

import { create } from "zustand";
import { api, ApiError } from "./api/client";
import { forgetWishlist, syncWishlist } from "./wishlist";

/**
 * The signed-in shopper, shared by the header, checkout, Track Order and the
 * account pages. Read from the API (the session cookie is httpOnly, so the
 * browser can't see it directly) once when the site loads, and refreshed
 * after signing in or out.
 */
export type Me = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
};

type AccountState = {
  status: "loading" | "guest" | "signed-in";
  me: Me | null;
};

export const useAccount = create<AccountState>(() => ({ status: "loading", me: null }));

export function setSignedIn(me: Me) {
  useAccount.setState({ status: "signed-in", me });
  // Their wishlist follows the account, not this browser.
  void syncWishlist(me.id);
}

export async function refreshAccount() {
  try {
    setSignedIn(await api<Me>("GET", "/account/me"));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) useAccount.setState({ status: "guest", me: null });
    // Anything else (offline, API down): leave the state as it was.
  }
}

export async function signOut() {
  try {
    await api("POST", "/account/logout");
  } finally {
    useAccount.setState({ status: "guest", me: null });
    forgetWishlist();
  }
}

/** Where to go after signing in: a same-site path only, never another site. */
export function safeNext(next: string | null, fallback = "/account") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
