"use client";

import { AlertTriangle, Download, PackagePlus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { PRODUCTS, type Product } from "@/lib/mock";
import { inr, num, cn } from "@/lib/utils";

const LOW = 15;

function level(p: Product) {
  if (p.stock === 0) return { label: "Out of Stock", tone: "critical" as const };
  if (p.stock <= LOW) return { label: "Low", tone: "warning" as const };
  if (p.stock <= 100) return { label: "Healthy", tone: "good" as const };
  return { label: "Overstocked", tone: "info" as const };
}

const columns: Column<Product>[] = [
  {
    key: "name",
    header: "Product",
    cell: (p) => (
      <span>
        <span className="block font-medium text-ink">{p.name}</span>
        <span className="block text-[0.68rem] text-muted">{p.sku}</span>
      </span>
    ),
  },
  { key: "category", header: "Category" },
  {
    key: "stock",
    header: "On Hand",
    align: "right",
    cell: (p) => (
      <span className={cn("tnum font-medium", p.stock <= LOW && "text-critical")}>
        {p.stock}
      </span>
    ),
  },
  {
    key: "value",
    header: "Stock Value",
    align: "right",
    value: (p) => p.stock * p.price,
    cell: (p) => inr(p.stock * p.price),
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
    key: "restock",
    header: "",
    sortable: false,
    align: "right",
    cell: (p) =>
      p.stock <= LOW ? (
        <button className="text-[0.72rem] font-medium text-series-1 hover:underline">
          Restock
        </button>
      ) : null,
  },
];

const filters = [
  { label: "Low Stock", test: (p: Product) => p.stock > 0 && p.stock <= LOW },
  { label: "Out of Stock", test: (p: Product) => p.stock === 0 },
  { label: "Healthy", test: (p: Product) => p.stock > LOW },
];

export default function InventoryPage() {
  const lowCount = PRODUCTS.filter((p) => p.stock > 0 && p.stock <= LOW).length;
  const totalValue = PRODUCTS.reduce((n, p) => n + p.stock * p.price, 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${inr(totalValue)} of stock on hand`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" /> Export
            </Button>
            <Button size="sm">
              <PackagePlus className="size-3.5" /> Record Stock In
            </Button>
          </>
        }
      />

      {lowCount > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#8a5d00]" />
          <p className="text-[0.8rem] text-[#8a5d00]">
            <strong className="font-semibold">{lowCount} products</strong> are at or
            below the low-stock threshold of {LOW} units. Restock them before they sell out.
          </p>
        </div>
      )}

      <DataTable
        rows={PRODUCTS}
        columns={columns}
        rowKey={(p) => p.id}
        filters={filters}
        searchPlaceholder="Search products or SKU…"
      />
    </>
  );
}
