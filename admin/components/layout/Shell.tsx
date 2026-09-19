"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FlaskConical } from "lucide-react";
import type { Admin } from "@/lib/api/types";
import { findNavItem } from "@/lib/nav";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Shell({
  admin,
  badges,
  children,
}: {
  admin: Admin;
  /** Live counts shown beside sidebar items, keyed by href. */
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sample = findNavItem(pathname)?.sample;

  return (
    <div className="min-h-screen lg:pl-[248px]">
      <Sidebar open={open} onClose={() => setOpen(false)} badges={badges} />
      <Topbar admin={admin} onMenu={() => setOpen(true)} />
      <main className="px-4 py-6 lg:px-7">
        {sample && (
          <div
            role="note"
            className="mb-5 flex items-start gap-3 rounded-[var(--radius-card)] border border-series-1/25 bg-series-1/5 px-5 py-3.5"
          >
            <FlaskConical className="mt-0.5 size-4 shrink-0 text-series-1" />
            <p className="text-[0.78rem] leading-relaxed text-ink-2">
              <strong className="font-semibold text-ink">Sample data.</strong> This screen isn&apos;t
              connected to the store yet — the figures below are placeholders, and changes here
              aren&apos;t saved.
            </p>
          </div>
        )}
        {children}
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 pb-8 pt-4 text-[0.7rem] text-muted lg:px-7">
        <span>© {new Date().getFullYear()} Velastia. All Rights Reserved.</span>
        <span>Version 1.0.0</span>
      </footer>
    </div>
  );
}
