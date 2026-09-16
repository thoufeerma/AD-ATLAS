"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, X } from "lucide-react";
import { NAV, ALL_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * The active item is the longest nav href that prefixes the current path, so
 * `/settings/tax` lights up "Tax Settings" rather than the shorter "Settings".
 */
function activeHref(pathname: string) {
  return ALL_NAV_ITEMS.map((i) => i.href)
    .filter((href) =>
      href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"),
    )
    .sort((a, b) => b.length - a.length)[0];
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const current = activeHref(pathname);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-sidebar text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark className="size-8 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="text-[1.05rem] font-semibold tracking-[0.14em] text-white">
                VELASTIA
              </span>
              <span className="mt-0.5 text-[0.5rem] tracking-[0.18em] text-pill/80">
                Luxury. Science. You.
              </span>
            </span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="lg:hidden">
            <X className="size-5 text-white/70" />
          </button>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="px-3 pb-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/35">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const activeItem = item.href === current;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.78rem] transition-colors",
                          activeItem
                            ? "bg-pill font-medium text-sidebar-deep"
                            : "text-white/70 hover:bg-sidebar-hover hover:text-white",
                        )}
                      >
                        <item.Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "tnum rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold",
                              activeItem
                                ? "bg-sidebar-deep text-pill"
                                : "bg-white/12 text-white/80",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/activity"
            className="flex items-center gap-2.5 rounded-lg bg-sidebar-hover px-3 py-3 text-[0.78rem] text-white/80 hover:text-white"
          >
            <LifeBuoy className="size-4" />
            Support &amp; Help
          </Link>
        </div>
      </aside>
    </>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="#fdd19b" strokeWidth="1.6" />
      <path
        d="M24 11c7.2 3.1 10.8 8.2 10.8 14.2 0 5.6-4.6 10.3-10.8 10.3s-10.8-4.7-10.8-10.3C13.2 19.2 16.8 14.1 24 11Z"
        fill="none"
        stroke="#fdd19b"
        strokeWidth="1.4"
      />
      <path
        d="M18.6 20.2 24 31.6l5.4-11.4"
        fill="none"
        stroke="#fdd19b"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 31.6V37" stroke="#fdd19b" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
