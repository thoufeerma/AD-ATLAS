"use client";

import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import type { CustomerListItem } from "@/lib/api/types";
import { inr } from "@/lib/utils";

/** Same three groups as the dashboard's Customer Statistics chart. */
function segment(c: CustomerListItem) {
  if (c.orderCount >= 2) return { label: "Repeat", tone: "good" as const };
  if (c.orderCount === 1) return { label: "One-time", tone: "info" as const };
  return { label: "No purchase", tone: "neutral" as const };
}

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const columns: Column<CustomerListItem>[] = [
  {
    key: "name",
    header: "Customer",
    value: (c) => `${c.name} ${c.email} ${c.phone ?? ""}`,
    cell: (c) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar text-[0.62rem] font-semibold text-pill">
          {c.name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{c.name}</span>
          <span className="block truncate text-[0.68rem] text-muted">{c.email}</span>
        </span>
      </span>
    ),
  },
  { key: "phone", header: "Phone", cell: (c) => (c.phone ? `+91 ${c.phone}` : "—") },
  { key: "orderCount", header: "Orders", align: "right" },
  {
    key: "lifetimeValuePaise",
    header: "Lifetime Value",
    align: "right",
    cell: (c) => <span className="font-medium">{inr(c.lifetimeValuePaise / 100)}</span>,
  },
  { key: "lastOrderAt", header: "Last Order", value: (c) => c.lastOrderAt ?? "", cell: (c) => date(c.lastOrderAt) },
  { key: "createdAt", header: "Joined", value: (c) => c.createdAt, cell: (c) => date(c.createdAt) },
  {
    key: "segment",
    header: "Segment",
    value: (c) => segment(c).label,
    cell: (c) => {
      const s = segment(c);
      return <Badge tone={s.tone}>{s.label}</Badge>;
    },
  },
];

const filters = [
  { label: "Repeat", test: (c: CustomerListItem) => c.orderCount >= 2 },
  { label: "One-time", test: (c: CustomerListItem) => c.orderCount === 1 },
  { label: "No purchase", test: (c: CustomerListItem) => c.orderCount === 0 },
];

export default function CustomersTable({ customers }: { customers: CustomerListItem[] }) {
  return (
    <DataTable
      rows={customers}
      columns={columns}
      rowKey={(c) => c.id}
      filters={filters}
      searchPlaceholder="Search by name, email or phone…"
      emptyMessage="No customers yet. They're created automatically when someone places an order."
    />
  );
}
