import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import InventoryTable from "@/components/inventory/InventoryTable";
import { apiGet } from "@/lib/api/server";
import type { ProductListItem } from "@/lib/api/types";
import { inr } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = await apiGet<ProductListItem[]>("/admin/products");
  const active = products.filter((p) => p.status === "ACTIVE");
  const low = active.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const out = active.filter((p) => p.stock === 0);
  const value = active.reduce((n, p) => n + p.stock * p.pricePaise, 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${inr(value / 100)} of sellable stock at retail price`}
      />

      {(low.length > 0 || out.length > 0) && (
        <div className="mb-5 flex items-start gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#8a5d00]" />
          <p className="text-[0.8rem] text-[#8a5d00]">
            {out.length > 0 && (
              <>
                <strong className="font-semibold">{out.length} out of stock</strong>
                {low.length > 0 ? " and " : ". "}
              </>
            )}
            {low.length > 0 && (
              <>
                <strong className="font-semibold">{low.length} at or below</strong> their low-stock
                threshold.{" "}
              </>
            )}
            Restock before they stop selling.
          </p>
        </div>
      )}

      <InventoryTable products={products} />
    </>
  );
}
