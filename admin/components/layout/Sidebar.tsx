"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, X } from "lucide-react";
import { NAV, findNavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function Sidebar({
  open,
  onClose,
  badges,
}: {
  open: boolean;
  onClose: () => void;
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const current = findNavItem(pathname)?.href;

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
          <Link href="/" className="block">
            {/* The official logo, cream-wordmark version for the dark sidebar. */}
            <Image src="/brand/logo-light.png" alt="Velastia Admin" width={119} height={40} priority className="h-10 w-auto" />
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
                  const badge = badges?.[item.href] ?? item.badge;

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
                        {item.sample && (
                          <span
                            title="Shows sample data — not connected to the store yet"
                            className={cn(
                              "rounded px-1 py-px text-[0.52rem] font-semibold uppercase tracking-wider",
                              activeItem ? "bg-sidebar-deep/15 text-sidebar-deep" : "bg-white/10 text-white/45",
                            )}
                          >
                            Sample
                          </span>
                        )}
                        {!!badge && (
                          <span
                            className={cn(
                              "tnum rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold",
                              activeItem
                                ? "bg-sidebar-deep text-pill"
                                : "bg-white/12 text-white/80",
                            )}
                          >
                            {badge}
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
