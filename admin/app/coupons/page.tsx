"use client";

import { Plus, Copy } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { COUPONS, type Coupon } from "@/lib/mock";
import { num } from "@/lib/utils";

const columns: Column<Coupon>[] = [
  {
    key: "code",
    header: "Code",
    cell: (c) => (
      <span className="inline-flex items-center gap-2">
        <span className="rounded-md border border-dashed border-series-1/40 bg-series-1/5 px-2 py-1 font-medium tracking-wide text-series-1">
          {c.code}
        </span>
        <Copy className="size-3 text-muted" />
      </span>
    ),
  },
  { key: "type", header: "Type" },
  { key: "value", header: "Value", align: "right" },
  {
    key: "used",
    header: "Redemptions",
    align: "right",
    cell: (c) => (
      <span className="tnum">
        {num(c.used)} <span className="text-muted">/ {num(c.limit)}</span>
      </span>
    ),
  },
  {
    key: "usage",
    header: "Usage",
    sortable: false,
    value: (c) => c.used / c.limit,
    cell: (c) => (
      <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-plane">
        <span
          className="h-full rounded-r-[4px] rounded-l-full bg-series-1"
          style={{ width: `${Math.min((c.used / c.limit) * 100, 100)}%` }}
        />
      </span>
    ),
  },
  { key: "expires", header: "Expires" },
  {
    key: "active",
    header: "Status",
    value: (c) => (c.active ? "Active" : "Inactive"),
    cell: (c) => (
      <Badge tone={c.active ? "good" : "neutral"}>{c.active ? "Active" : "Inactive"}</Badge>
    ),
  },
];

const filters = [
  { label: "Active", test: (c: Coupon) => c.active },
  { label: "Inactive", test: (c: Coupon) => !c.active },
];

export default function CouponsPage() {
  return (
    <>
      <PageHeader
        title="Coupons"
        subtitle={`${COUPONS.filter((c) => c.active).length} active codes`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DataTable
          rows={COUPONS}
          columns={columns}
          rowKey={(c) => c.code}
          filters={filters}
          searchPlaceholder="Search codes…"
        />

        <Card title="Create Coupon">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Code *" placeholder="MONSOON15" />
            <div>
              <Label>Discount Type</Label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>Percentage</option>
                <option>Fixed amount</option>
                <option>Free shipping</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Value" placeholder="15" inputMode="numeric" />
              <Field label="Min. Order (₹)" placeholder="999" inputMode="numeric" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Usage Limit" placeholder="2000" inputMode="numeric" />
              <Field label="Per Customer" placeholder="1" inputMode="numeric" />
            </div>
            <Field label="Expires On" placeholder="2025-12-31" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-[0.78rem] text-ink-2">First order only</span>
              <Toggle label="First order only" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[0.78rem] text-ink-2">Active immediately</span>
              <Toggle defaultOn label="Active immediately" />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="size-3.5" /> Create Coupon
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{children}</label>
  );
}

function Field({
  label,
  placeholder,
  inputMode,
}: {
  label: string;
  placeholder?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
      />
    </div>
  );
}
