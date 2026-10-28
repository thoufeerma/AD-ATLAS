"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search, ShoppingBag, Sparkles } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { AdminReferral } from "@/lib/api/types";
import { cn, inrPaise } from "@/lib/utils";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REVERSED";

export default function ReferralsView({ initial }: { initial: AdminReferral[] }) {
  const [referrals, setReferrals] = useState<AdminReferral[]>(initial);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return referrals.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        r.order.number.toLowerCase().includes(q) ||
        r.collaborator.name.toLowerCase().includes(q) ||
        (r.collaborator.referralCode && r.collaborator.referralCode.toLowerCase().includes(q)) ||
        r.order.email.toLowerCase().includes(q) ||
        r.order.shipName.toLowerCase().includes(q)
      );
    });
  }, [referrals, filter, search]);

  const totalCommission = useMemo(() => {
    return filtered
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + r.commissionPaise, 0);
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Filters Bar & Stats summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: `All (${referrals.length})` },
              { id: "PENDING", label: "Pending" },
              { id: "APPROVED", label: "Approved" },
              { id: "REVERSED", label: "Reversed" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === t.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/60 text-muted hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, creator, code..."
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[0.68rem] uppercase tracking-wider text-muted font-semibold">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Collaborator</th>
              <th className="py-3 px-4 text-right">Eligible Amount</th>
              <th className="py-3 px-4 text-right">Commission</th>
              <th className="py-3 px-4">Order Status</th>
              <th className="py-3 px-4">Referral Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  No referral orders found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    {/* Order link */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/orders/${r.order.number}`}
                        className="group inline-flex items-center gap-1 font-mono font-semibold text-primary hover:underline"
                      >
                        {r.order.number}
                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-[0.7rem] text-muted truncate max-w-[160px]">{r.order.shipName}</p>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Collaborator */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{r.collaborator.name}</p>
                      <span className="font-mono text-[0.7rem] text-primary">
                        {r.collaborator.referralCode} ({r.collaborator.commissionRate}%)
                      </span>
                    </td>

                    {/* Eligible Amount */}
                    <td className="py-3 px-4 text-right font-medium text-foreground">
                      {inrPaise(r.orderAmountPaise)}
                    </td>

                    {/* Commission */}
                    <td className="py-3 px-4 text-right font-bold text-foreground">
                      {inrPaise(r.commissionPaise)}
                    </td>

                    {/* Order Status */}
                    <td className="py-3 px-4">
                      <span className="text-[0.72rem] text-muted font-medium capitalize">
                        {r.order.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Referral Status */}
                    <td className="py-3 px-4">
                      {r.status === "APPROVED" && <Badge tone="good">Approved</Badge>}
                      {r.status === "PENDING" && <Badge tone="warning">Pending</Badge>}
                      {r.status === "REVERSED" && <Badge tone="critical">Reversed</Badge>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
