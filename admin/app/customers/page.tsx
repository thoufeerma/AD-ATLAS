"use client";

import { Download, Mail } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { CUSTOMERS, type Customer } from "@/lib/mock";
import { inr } from "@/lib/utils";

const SEGMENT_TONE = {
  New: "info",
  Returning: "good",
  Inactive: "neutral",
} as const;

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    cell: (c) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar text-[0.62rem] font-semibold text-pill">
          {c.name.split(" ").map((n) => n[0]).join("")}
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{c.name}</span>
          <span className="block truncate text-[0.68rem] text-muted">{c.email}</span>
        </span>
      </span>
    ),
  },
  { key: "city", header: "City" },
  { key: "orders", header: "Orders", align: "right" },
  {
    key: "spent",
    header: "Lifetime Value",
    align: "right",
    cell: (c) => <span className="font-medium">{inr(c.spent)}</span>,
  },
  { key: "joined", header: "Joined" },
  {
    key: "segment",
    header: "Segment",
    cell: (c) => <Badge tone={SEGMENT_TONE[c.segment]}>{c.segment}</Badge>,
  },
];

const filters = [
  { label: "New", test: (c: Customer) => c.segment === "New" },
  { label: "Returning", test: (c: Customer) => c.segment === "Returning" },
  { label: "Inactive", test: (c: Customer) => c.segment === "Inactive" },
];

export default function CustomersPage() {
  const total = CUSTOMERS.reduce((n, c) => n + c.spent, 0);

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${CUSTOMERS.length} shown · ${inr(total)} lifetime value in view`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Mail className="size-3.5" /> Email Selected
            </Button>
            <Button size="sm">
              <Download className="size-3.5" /> Export CSV
            </Button>
          </>
        }
      />
      <DataTable
        rows={CUSTOMERS}
        columns={columns}
        rowKey={(c) => c.id}
        filters={filters}
        searchPlaceholder="Search by name, email or city…"
      />
    </>
  );
}
