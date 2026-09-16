"use client";

import { Menu, Search, Bell, Mail, ExternalLink, ChevronDown } from "lucide-react";

/** Storefront URL. Points at the local store in dev; set NEXT_PUBLIC_STORE_URL
 *  in the environment to aim it at production. The apps share nothing but this
 *  link. */
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
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
            className="w-full rounded-lg border border-hairline bg-plane py-2.5 pl-10 pr-16 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:bg-card focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-hairline bg-card px-1.5 py-0.5 text-[0.62rem] text-muted">
            Ctrl + /
          </kbd>
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

          <IconButton label="Notifications" count={6}>
            <Bell className="size-[18px]" />
          </IconButton>
          <IconButton label="Messages" count={5}>
            <Mail className="size-[18px]" />
          </IconButton>

          <button className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-sidebar text-[0.7rem] font-semibold text-pill">
              AD
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[0.78rem] font-medium text-ink">Admin</span>
              <span className="block text-[0.65rem] text-muted">Super Administrator</span>
            </span>
            <ChevronDown className="hidden size-3.5 text-muted sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button aria-label={label} className="relative text-ink-2 hover:text-ink">
      {children}
      {count ? (
        <span className="tnum absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-critical text-[0.55rem] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
