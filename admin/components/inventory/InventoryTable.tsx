"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { api, ApiError } from "@/lib/api/client";
import type { ProductListItem } from "@/lib/api/types";
import { inr, num, cn } from "@/lib/utils";

function level(p: ProductListItem) {
  if (p.status !== "ACTIVE") return { label: "Not for sale", tone: "neutral" as const };
  if (p.stock === 0) return { label: "Out of Stock", tone: "critical" as const };
  if (p.stock <= p.lowStockThreshold) return { label: "Low", tone: "warning" as const };
  return { label: "Healthy", tone: "good" as const };
}

/**
 * Relative adjustment ("+20" after a delivery, "-2" for damaged units), sent
 * as `adjust` so it composes with orders placed at the same moment. An
 * absolute "set to N" from a stale screen would silently erase those sales.
 */
function StockAdjust({ product }: { product: ProductListItem }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = /^[+-]?\d+$/.test(value.trim()) ? Number(value.trim()) : NaN;
  const valid = Number.isInteger(n) && n !== 0;

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await api("PATCH", `/admin/products/${product.id}/stock`, {
        adjust: n,
        reason: n > 0 ? "Restock" : "Manual reduction",
      });
      setValue("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update stock");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={apply} onClick={(e) => e.stopPropagation()} className="flex flex-col items-end gap-1">
      <span className="flex items-center gap-1.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="+20"
          inputMode="numeric"
          aria-label={`Adjust stock for ${product.name}`}
          className={cn(
            "tnum w-16 rounded-md border px-2 py-1.5 text-right text-[0.76rem] focus:outline-none",
            value && !valid ? "border-critical" : "border-hairline focus:border-series-1",
          )}
        />
        <button
          type="submit"
          disabled={!valid || busy}
          className="rounded-md bg-series-1 px-2.5 py-1.5 text-[0.7rem] font-medium text-white disabled:opacity-40"
        >
          {busy ? "…" : "Apply"}
        </button>
      </span>
      {error && <span role="alert" className="max-w-[14rem] text-right text-[0.65rem] text-critical">{error}</span>}
    </form>
  );
}

const columns: Column<ProductListItem>[] = [
  {
    key: "name",
    header: "Product",
    value: (p) => `${p.name} ${p.sku}`,
    cell: (p) => (
      <span>
        <span className="block font-medium text-ink">{p.name}</span>
        <span className="block text-[0.68rem] text-muted">{p.sku}</span>
      </span>
    ),
  },
  { key: "category", header: "Category", value: (p) => p.category.name, cell: (p) => p.category.name },
  {
    key: "stock",
    header: "On Hand",
    align: "right",
    cell: (p) => {
      const l = level(p);
      return (
        <span className={cn("tnum font-medium", l.tone === "critical" ? "text-critical" : l.tone === "warning" ? "text-[#8a5d00]" : "text-ink")}>
          {p.stock}
        </span>
      );
    },
  },
  {
    key: "value",
    header: "Retail Value",
    align: "right",
    value: (p) => p.stock * p.pricePaise,
    cell: (p) => inr((p.stock * p.pricePaise) / 100),
  },
  { key: "sold", header: "Sold", align: "right", cell: (p) => num(p.sold) },
  {
    key: "level",
    header: "Level",
    value: (p) => level(p).label,
    cell: (p) => {
      const l = level(p);
      return <Badge tone={l.tone}>{l.label}</Badge>;
    },
  },
  {
    key: "adjust",
    header: "Adjust",
    sortable: false,
    align: "right",
    cell: (p) => <StockAdjust product={p} />,
  },
];

const filters = [
  { label: "Low Stock", test: (p: ProductListItem) => level(p).label === "Low" },
  { label: "Out of Stock", test: (p: ProductListItem) => level(p).label === "Out of Stock" },
  { label: "Healthy", test: (p: ProductListItem) => level(p).label === "Healthy" },
  { label: "Not for sale", test: (p: ProductListItem) => p.status !== "ACTIVE" },
];

export default function InventoryTable({ products }: { products: ProductListItem[] }) {
  return (
    <DataTable
      rows={products}
      columns={columns}
      rowKey={(p) => p.id}
      filters={filters}
      searchPlaceholder="Search products or SKU…"
      emptyMessage="No products match."
    />
  );
}
