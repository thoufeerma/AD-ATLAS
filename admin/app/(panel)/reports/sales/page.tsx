import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import LinePlot from "@/components/charts/LinePlot";
import ExportCsv from "@/components/reports/ExportCsv";
import NoData from "@/components/reports/NoData";
import { apiGet } from "@/lib/api/server";
import type { SalesReport } from "@/lib/api/types";
import { inr, monthLong, monthShort, num } from "@/lib/utils";

export const metadata: Metadata = { title: "Sales Reports" };

export default async function SalesReportPage() {
  const report = await apiGet<SalesReport>("/admin/reports/sales");
  const { totals, change, months, best } = report;
  const labels = months.map((m) => monthShort(m.month));
  const anySales = totals.orders > 0;

  return (
    <>
      <PageHeader
        title="Sales Reports"
        subtitle="Revenue and orders over the last 12 months. Unpaid, cancelled and refunded orders are left out."
        actions={
          <ExportCsv
            filename="velastia-sales"
            disabled={!anySales}
            sections={[
              {
                title: "Revenue and orders by month",
                columns: ["Month", "Revenue (₹)", "Orders"],
                rows: months.map((m) => [monthLong(m.month), (m.revenuePaise / 100).toFixed(2), m.orders]),
              },
            ]}
          />
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={inr(totals.revenuePaise / 100)}
          delta={change.revenue ?? undefined}
          slot={1}
          note="last 12 months"
        />
        <StatCard
          label="Orders"
          value={num(totals.orders)}
          delta={change.orders ?? undefined}
          slot={2}
          note="last 12 months"
        />
        <StatCard
          label="Average Order Value"
          value={inr(totals.aovPaise / 100)}
          delta={change.aov ?? undefined}
          slot={3}
          note="last 12 months"
        />
        <StatCard
          label="Best Month"
          value={best ? monthLong(best.month) : "—"}
          note={best ? `${inr(best.revenuePaise / 100)} revenue` : "no orders yet"}
        />
      </div>

      {anySales ? (
        <div className="space-y-5">
          <ChartFrame
            title="Revenue by Month"
            subtitle="Order totals, including shipping and tax, after discounts"
            table={{
              columns: ["Month", "Revenue"],
              rows: months.map((m) => [monthLong(m.month), inr(m.revenuePaise / 100)]),
            }}
          >
            <LinePlot
              labels={labels}
              data={months.map((m) => m.revenuePaise / 100)}
              color="var(--color-series-1)"
              name="Revenue in rupees"
              formatAs="rupees"
              height={240}
            />
          </ChartFrame>

          <ChartFrame
            title="Orders by Month"
            subtitle="Order count — a separate plot, since it shares no scale with revenue"
            table={{
              columns: ["Month", "Orders"],
              rows: months.map((m) => [monthLong(m.month), num(m.orders)]),
            }}
          >
            <LinePlot
              labels={labels}
              data={months.map((m) => m.orders)}
              color="var(--color-series-2)"
              name="Order count"
              formatAs="count"
              height={200}
            />
          </ChartFrame>

          <p className="text-[0.7rem] text-muted">
            {num(totals.unitsSold)} items sold · {inr(totals.discountPaise / 100)} given away in discounts
          </p>
        </div>
      ) : (
        <NoData
          title="Revenue by Month"
          note="No orders yet. Revenue and order counts appear here as soon as the first order is placed."
        />
      )}
    </>
  );
}
