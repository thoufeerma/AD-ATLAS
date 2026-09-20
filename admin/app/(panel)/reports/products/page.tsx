import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import BarList from "@/components/charts/BarList";
import ExportCsv from "@/components/reports/ExportCsv";
import NoData from "@/components/reports/NoData";
import { apiGet } from "@/lib/api/server";
import type { ProductReport, ProductStatus } from "@/lib/api/types";
import { inr, num } from "@/lib/utils";

export const metadata: Metadata = { title: "Product Reports" };

const STATUS: Record<ProductStatus, string> = {
  ACTIVE: "On sale",
  COMING_SOON: "Coming soon",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

export default async function ProductReportPage() {
  const { top, byCategory, neverSold, totals } = await apiGet<ProductReport>("/admin/reports/products");
  const sellingCategories = byCategory.filter((c) => c.revenuePaise > 0);
  const anySales = totals.unitsSold > 0;

  return (
    <>
      <PageHeader
        title="Product Reports"
        subtitle="What is selling, and what is sitting — last 12 months"
        actions={
          <ExportCsv
            filename="velastia-products"
            disabled={totals.products === 0}
            sections={[
              {
                title: "Top sellers",
                columns: ["Product", "SKU", "Category", "Revenue (₹)", "Units"],
                rows: top.map((p) => [p.name, p.sku, p.category.name, (p.revenuePaise / 100).toFixed(2), p.unitsSold]),
              },
              {
                title: "Revenue by category",
                columns: ["Category", "Revenue (₹)", "Units"],
                rows: byCategory.map((c) => [c.name, (c.revenuePaise / 100).toFixed(2), c.unitsSold]),
              },
              {
                title: "Not sold in this period",
                columns: ["Product", "SKU", "Price (₹)", "Status", "Stock"],
                rows: neverSold.map((p) => [
                  p.name,
                  p.sku,
                  (p.pricePaise / 100).toFixed(2),
                  STATUS[p.status],
                  p.stock,
                ]),
              },
            ]}
          />
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Items Sold" value={num(totals.unitsSold)} slot={1} note="last 12 months" />
        <StatCard label="Product Revenue" value={inr(totals.revenuePaise / 100)} slot={2} note="item lines only" />
        <StatCard label="Products Selling" value={`${num(totals.sellingProducts)} of ${num(totals.products)}`} slot={3} note="have sold at least one" />
        <StatCard label="Not Selling" value={num(neverSold.length)} note="no sales in this period" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {anySales ? (
          <>
            <ChartFrame
              title="Top Sellers by Revenue"
              subtitle="Item lines only — shipping, discounts and tax are not counted here"
              table={{
                columns: ["Product", "Revenue", "Units"],
                rows: top.map((p) => [p.name, inr(p.revenuePaise / 100), num(p.unitsSold)]),
              }}
            >
              <BarList
                rows={top.map((p) => ({
                  label: p.name.replace("Velastia ", ""),
                  pct: Math.round((p.revenuePaise / top[0].revenuePaise) * 100),
                }))}
                format={(n) => `${n}%`}
              />
              <p className="mt-4 text-[0.68rem] text-muted">
                Bars are relative to the top seller ({inr(top[0].revenuePaise / 100)}). Exact figures are in the
                table view.
              </p>
            </ChartFrame>

            <ChartFrame
              title="Revenue by Category"
              table={{
                columns: ["Category", "Revenue", "Units"],
                rows: byCategory.map((c) => [c.name, inr(c.revenuePaise / 100), num(c.unitsSold)]),
              }}
            >
              <BarList
                rows={sellingCategories.map((c) => ({
                  label: c.name,
                  pct: Math.round((c.revenuePaise / sellingCategories[0].revenuePaise) * 100),
                }))}
                color="var(--color-series-2)"
              />
              {sellingCategories.length < byCategory.length && (
                <p className="mt-4 text-[0.68rem] text-muted">
                  {byCategory.length - sellingCategories.length} categor
                  {byCategory.length - sellingCategories.length === 1 ? "y has" : "ies have"} no sales yet.
                </p>
              )}
            </ChartFrame>
          </>
        ) : (
          <NoData
            title="Top Sellers by Revenue"
            note="Nothing sold yet. Once orders come in, the best sellers and the categories they belong to appear here."
          />
        )}

        <Card
          title={anySales ? "Not Sold in This Period" : "Products on Sale"}
          className="lg:col-span-2"
        >
          {neverSold.length === 0 ? (
            <p className="py-6 text-center text-[0.8rem] text-ink-2">
              Every product has sold at least once. Rare, and worth celebrating.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {neverSold.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.82rem] text-ink">{p.name}</span>
                    <span className="block text-[0.68rem] text-muted">
                      {p.sku} · {p.category.name}
                    </span>
                  </span>
                  <span className="tnum text-[0.78rem] text-ink-2">{inr(p.pricePaise / 100)}</span>
                  <span className="w-24 text-right text-[0.72rem] text-muted">
                    {STATUS[p.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
