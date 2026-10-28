"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/collaborators", label: "Collaborators", icon: Handshake },
  { href: "/collaborators/redeems", label: "Redeem Requests", icon: Wallet },
  { href: "/collaborators/referrals", label: "Referrals Log", icon: TrendingUp },
];

export default function CollaboratorNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex border-b border-border">
      <div className="flex gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active =
            t.href === "/collaborators"
              ? pathname === "/collaborators"
              : pathname.startsWith(t.href);

          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:border-border hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
