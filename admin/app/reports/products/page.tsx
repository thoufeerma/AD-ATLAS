import { Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ChartFrame from "@/components/charts/ChartFrame";
import BarList from "@/components/charts/BarList";
import { TOP_PRODUCTS, PRODUCTS } from "@/lib/mock";
import { inr, num } from "@/lib/utils";

export const metadata = { title: "Product Reports" };

export default function ProductReportPage() {
  const maxRevenue = Math.max(...TOP_PRODUCTS.map((p) => p.revenue));

  // Category revenue — one series, one colour (never a ramp across nominal
  // categories, which would double-encode bar length as hue).
  const byCategory = [...new Set(PRODUCTS.map((p) => p.category))]
    .map((cat) => ({
      label: cat,
      pct: PRODUCTS.filter((p) => p.category === cat).reduce(
        (n, p) => n + p.price * p.sold,
        0,
      ),
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <>
      <PageHeader
        title="Product Reports"
        subtitle="What is selling, and what is sitting"
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export Report
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartFrame
          title="Top Sellers by Revenue"
          table={{
            columns: ["Product", "Revenue", "Units"],
            rows: TOP_PRODUCTS.map((p) => [p.name, inr(p.revenue), num(p.sold)]),
          }}
        >
          <BarList
            rows={TOP_PRODUCTS.map((p) => ({
              label: p.name.replace("Velastia ", ""),
              pct: Math.round((p.revenue / maxRevenue) * 100),
            }))}
            format={(n) => `${n}%`}
          />
          <p className="mt-4 text-[0.68rem] text-muted">
            Bars are relative to the top seller ({inr(maxRevenue)}). Exact figures
            are in the table view.
          </p>
        </ChartFrame>

        <ChartFrame
          title="Revenue by Category"
          table={{
            columns: ["Category", "Revenue"],
            rows: byCategory.map((c) => [c.label, inr(c.pct)]),
          }}
        >
          <BarList
            rows={byCategory.map((c) => ({
              label: c.label,
              pct: Math.round((c.pct / byCategory[0].pct) * 100),
            }))}
            color="var(--color-series-2)"
          />
        </ChartFrame>

        <Card title="Never Sold" className="lg:col-span-2">
          <ul className="divide-y divide-hairline">
            {PRODUCTS.filter((p) => p.sold === 0).map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.82rem] text-ink">{p.name}</span>
                  <span className="block text-[0.68rem] text-muted">{p.sku}</span>
                </span>
                <span className="tnum text-[0.78rem] text-ink-2">{inr(p.price)}</span>
                <span className="text-[0.72rem] text-muted">{p.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
