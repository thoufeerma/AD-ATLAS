"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { socialProfiles } from "@/components/ui/SocialIcons";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useStore, useHydrated } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import AnnouncementBar from "./AnnouncementBar";

/**
 * Gen B (2025) header, per M-Cart / Q-Wishlist / N-Order-Success / P-Login:
 * four icons including the wishlist heart, and OFFERS in the nav.
 * CONTACT is kept alongside OFFERS so the G-Contact page stays reachable.
 */
const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/reviews", label: "Reviews" },
  { href: "/collabs", label: "Collabs" },
  { href: "/contact", label: "Contact" },
];

/** `announcements` are the admin's active "global.topbar" banners, in order. */
export default function Header({ announcements }: { announcements: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const account = useAccount();
  const { store } = useSettings();
  const socials = socialProfiles(store.social, ["instagram", "youtube", "facebook"]);

  // Counts come out of persisted localStorage, so they stay at zero until the
  // store has rehydrated — otherwise server and client markup disagree.
  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const wishlist = useStore((s) => s.wishlist);
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar with continuous infinite sliding offers */}
      <AnnouncementBar
        announcements={announcements}
        socials={
          socials.length > 0 ? (
            <>
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Velastia on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors"
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </>
          ) : null
        }
      />

      {/* Main bar */}
      <div className="border-b border-gold-200/50 bg-cream-50/95 backdrop-blur">
        <div className="container-vel flex h-[72px] items-center justify-between gap-2 sm:gap-6">
          <button
            className="grid size-11 shrink-0 place-items-center text-plum-800 hover:text-gold-600 transition-colors lg:hidden -ml-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-6" />
          </button>

          <Logo priority />

          <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex xl:gap-7 font-heading font-[family-name:var(--font-jost)]">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "label-caps relative whitespace-nowrap py-1.5 transition-colors font-heading",
                    active ? "text-plum-800" : "text-ink-soft hover:text-plum-800",
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-px bg-gold-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5 text-plum-800">
            <button
              type="button"
              onClick={() => setSearching((s) => !s)}
              aria-label="Search"
              aria-expanded={searching}
              aria-controls="site-search"
              className="grid size-11 shrink-0 place-items-center hover:text-gold-600 transition-colors"
            >
              <Search className="size-[19px]" />
            </button>
            <Link
              href={account.status === "signed-in" ? "/account" : "/login"}
              aria-label={account.status === "signed-in" ? "Your account" : "Sign in"}
              title={account.me ? `Signed in as ${account.me.name}` : undefined}
              className="relative grid size-11 shrink-0 place-items-center hover:text-gold-600 transition-colors"
            >
              <User className="size-[19px]" />
              {account.status === "signed-in" && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-success ring-2 ring-cream-50" />
              )}
            </Link>
            <IconWithCount href="/wishlist" label="Wishlist" count={hydrated ? wishlist.length : 0}>
              <Heart className="size-[19px]" />
            </IconWithCount>
            <IconWithCount href="/cart" label="Cart" count={hydrated ? cartCount : 0}>
              <ShoppingBag className="size-[19px]" />
            </IconWithCount>
          </div>
        </div>
      </div>

      {/* Search bar, opened from the magnifier */}
      {searching && (
        <div id="site-search" className="border-b border-gold-200/50 bg-cream-50">
          <Form
            action="/search"
            role="search"
            onSubmit={() => setSearching(false)}
            className="container-vel flex items-center gap-3 py-3"
          >
            <Search className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
            <input
              name="q"
              type="search"
              required
              maxLength={100}
              autoFocus
              placeholder="Search lipsticks, serums, shades…"
              aria-label="Search products"
              onKeyDown={(e) => e.key === "Escape" && setSearching(false)}
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-plum-800 placeholder:text-ink-soft/70 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
            />
            <button type="submit" className="label-caps px-2 py-1.5 text-[0.66rem] text-gold-600 hover:text-gold-500">
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearching(false)}
              aria-label="Close search"
              className="grid size-9 place-items-center text-ink-soft hover:text-plum-800"
            >
              <X className="size-4" />
            </button>
          </Form>
        </div>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu">
          <div
            className="absolute inset-0 bg-plum-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[84%] max-w-xs bg-plum-800 p-6 text-cream-100 flex flex-col shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo tone="light" className="[&_img]:h-9" />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full text-cream-100 hover:text-gold-300 transition-colors -mr-2"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto font-heading font-[family-name:var(--font-jost)]">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="label-caps flex min-h-[44px] items-center border-b border-white/10 py-3 text-[0.82rem] text-cream-200 transition-colors hover:text-gold-300 font-heading"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function IconWithCount({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative grid size-11 shrink-0 place-items-center hover:text-gold-600 transition-colors"
    >
      {children}
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 grid size-[15px] place-items-center rounded-full bg-gold-600 text-[9px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
