"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { Instagram, Youtube, Facebook } from "@/components/ui/SocialIcons";
import { useStore, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

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
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact" },
];

/** `announcements` are the admin's active "global.topbar" banners, in order. */
export default function Header({ announcements }: { announcements: string[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Counts come out of persisted localStorage, so they stay at zero until the
  // store has rehydrated — otherwise server and client markup disagree.
  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const wishlist = useStore((s) => s.wishlist);
  const cartCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-plum-900 text-cream-100">
        <div className="container-vel flex h-9 items-center justify-between gap-4">
          <ul className="flex flex-1 items-center justify-center gap-6 overflow-hidden lg:justify-start">
            {announcements.map((t, i) => (
              <li
                key={`${i}:${t}`}
                className={cn(
                  "label-caps whitespace-nowrap text-[0.62rem] text-cream-200/90",
                  i === 0 ? "block" : "hidden md:block",
                )}
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 text-gold-300 lg:flex">
            <a href="https://instagram.com" aria-label="Instagram" className="hover:text-gold-400">
              <Instagram className="size-3.5" />
            </a>
            <a href="https://youtube.com" aria-label="YouTube" className="hover:text-gold-400">
              <Youtube className="size-3.5" />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="hover:text-gold-400">
              <Facebook className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-gold-200/50 bg-cream-50/95 backdrop-blur">
        <div className="container-vel flex h-[72px] items-center justify-between gap-3 sm:gap-6">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-6 text-plum-800" />
          </button>

          <Logo priority />

          <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-7">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "label-caps relative whitespace-nowrap py-1 transition-colors",
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

          <div className="flex items-center gap-3.5 text-plum-800 sm:gap-5">
            <Link href="/shop" aria-label="Search" className="hover:text-gold-600">
              <Search className="size-[19px]" />
            </Link>
            <Link href="/login" aria-label="Account" className="hover:text-gold-600">
              <User className="size-[19px]" />
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

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-plum-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-plum-800 p-6 text-cream-100">
            <div className="mb-8 flex items-center justify-between">
              <Logo tone="light" className="[&_img]:h-9" />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="label-caps border-b border-white/10 py-3.5 text-cream-200"
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
    <Link href={href} aria-label={label} className="relative hover:text-gold-600">
      {children}
      {count > 0 && (
        <span className="absolute -right-2 -top-1.5 grid size-[15px] place-items-center rounded-full bg-gold-600 text-[9px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
