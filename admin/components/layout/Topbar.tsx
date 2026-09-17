"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, ExternalLink, ChevronDown, LogOut } from "lucide-react";
import { api } from "@/lib/api/client";
import { ROLE_LABEL, type Admin } from "@/lib/api/types";

/** Storefront URL for "Visit Website". The apps share nothing but this link. */
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

export default function Topbar({ admin, onMenu }: { admin: Admin; onMenu: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = admin.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Close the account menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function signOut() {
    setSigningOut(true);
    try {
      await api("POST", "/admin/auth/logout");
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-card/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-7">
        <button onClick={onMenu} aria-label="Open menu" className="lg:hidden">
          <Menu className="size-5 text-ink" />
        </button>

        <label className="relative hidden max-w-md flex-1 sm:block">
          <span className="sr-only">Search orders, customers, products</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search orders, customers, products…"
            className="w-full rounded-lg border border-hairline bg-plane py-2.5 pl-10 pr-4 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:bg-card focus:outline-none"
          />
        </label>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <a
            href={STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[0.75rem] font-medium text-ink hover:border-series-1 hover:text-series-1 sm:inline-flex"
          >
            Visit Website <ExternalLink className="size-3.5" />
          </a>

          <button aria-label="Notifications" className="text-ink-2 hover:text-ink">
            <Bell className="size-[18px]" />
          </button>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-plane"
            >
              <span className="grid size-9 place-items-center rounded-full bg-sidebar text-[0.7rem] font-semibold text-pill">
                {initials}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[0.78rem] font-medium text-ink">{admin.name}</span>
                <span className="block text-[0.65rem] text-muted">{ROLE_LABEL[admin.role]}</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-muted sm:block" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-hairline bg-card shadow-lg"
              >
                <div className="border-b border-hairline px-4 py-3">
                  <p className="truncate text-[0.8rem] font-medium text-ink">{admin.name}</p>
                  <p className="truncate text-[0.7rem] text-muted">{admin.email}</p>
                </div>
                <button
                  role="menuitem"
                  onClick={signOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[0.8rem] text-ink hover:bg-plane disabled:opacity-50"
                >
                  <LogOut className="size-4 text-muted" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
