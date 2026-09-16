"use client";

import Link from "next/link";
import { Plus, Download, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { PRODUCTS, type Product } from "@/lib/mock";
import { inr, num, cn } from "@/lib/utils";

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
    key: "price",
    header: "Price",
    align: "right",
    cell: (p) => inr(p.price),
  },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    cell: (p) => (
      <span
        className={cn(
          "tnum font-medium",
          p.stock === 0 ? "text-muted" : p.stock <= 15 ? "text-critical" : "text-ink",
        )}
      >
        {p.stock === 0 ? "—" : p.stock}
      </span>
    ),
  },
  { key: "sold", header: "Sold", align: "right", cell: (p) => num(p.sold) },
  {
    key: "rating",
    header: "Rating",
    align: "right",
    cell: (p) => (p.rating ? `★ ${p.rating}` : "—"),
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => <Badge tone={toneFor(p.status)}>{p.status}</Badge>,
  },
  {
    key: "edit",
    header: "",
    sortable: false,
    align: "right",
    cell: (p) => (
      <Link
        href={`/products/new?id=${p.id}`}
        className="inline-flex items-center gap-1 text-[0.72rem] text-series-1 hover:underline"
      >
        <Pencil className="size-3" /> Edit
      </Link>
    ),
  },
];

const filters = [
  { label: "Active", test: (p: Product) => p.status === "Active" },
  { label: "Low Stock", test: (p: Product) => p.status === "Active" && p.stock <= 15 },
  { label: "Coming Soon", test: (p: Product) => p.status === "Coming Soon" },
  { label: "Draft", test: (p: Product) => p.status === "Draft" },
];

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} products across 6 categories`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" /> Export
            </Button>
            <Button href="/products/new" size="sm">
              <Plus className="size-3.5" /> Add New Product
            </Button>
          </>
        }
      />
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
