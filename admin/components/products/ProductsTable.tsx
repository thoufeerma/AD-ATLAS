"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { humanize, type ProductListItem } from "@/lib/api/types";
import { inr, num, cn } from "@/lib/utils";

const isLow = (p: ProductListItem) => p.status === "ACTIVE" && p.stock <= p.lowStockThreshold;

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
  { key: "pricePaise", header: "Price", align: "right", cell: (p) => inr(p.pricePaise / 100) },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    cell: (p) => (
      <span className={cn("tnum font-medium", p.status !== "ACTIVE" ? "text-muted" : p.stock === 0 ? "text-critical" : isLow(p) ? "text-[#8a5d00]" : "text-ink")}>
        {p.stock}
      </span>
    ),
  },
  { key: "sold", header: "Sold", align: "right", cell: (p) => num(p.sold) },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <Badge tone={toneFor(p.status)}>{humanize(p.status)}</Badge>
        {p.isBestseller && <Badge tone="info" dot={false}>Bestseller</Badge>}
      </span>
    ),
  },
  {
    key: "edit",
    header: "",
    sortable: false,
    align: "right",
    cell: (p) => (
      <Link
        href={`/products/${p.id}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 text-[0.72rem] text-series-1 hover:underline"
      >
        <Pencil className="size-3" /> Edit
      </Link>
    ),
  },
];

const filters = [
  { label: "Active", test: (p: ProductListItem) => p.status === "ACTIVE" },
  { label: "Low Stock", test: isLow },
  { label: "Coming Soon", test: (p: ProductListItem) => p.status === "COMING_SOON" },
  { label: "Draft", test: (p: ProductListItem) => p.status === "DRAFT" },
];

export default function ProductsTable({ products }: { products: ProductListItem[] }) {
  const router = useRouter();
  return (
    <DataTable
      rows={products}
      columns={columns}
      rowKey={(p) => p.id}
      filters={filters}
      searchPlaceholder="Search products or SKU…"
      emptyMessage="No products match."
      onRowClick={(p) => router.push(`/products/${p.id}`)}
    />
  );
}
