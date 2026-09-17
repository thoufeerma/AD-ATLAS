import { Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import LinePlot from "@/components/charts/LinePlot";
import { MONTHS, SALES_BY_MONTH, ORDERS_BY_MONTH } from "@/lib/mock";
import { inr, num } from "@/lib/utils";

export const metadata = { title: "Sales Reports" };

export default function SalesReportPage() {
  const total = SALES_BY_MONTH.reduce((n, v) => n + v, 0);
  const orders = ORDERS_BY_MONTH.reduce((n, v) => n + v, 0);
  const aov = Math.round(total / orders);
  const best = MONTHS[SALES_BY_MONTH.indexOf(Math.max(...SALES_BY_MONTH))];

  return (
    <>
      <PageHeader
        title="Sales Reports"
        subtitle="Revenue and order volume for the current year"
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export Report
          </Button>
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={inr(total)} delta={18.6} slot={1} note="this year" />
        <StatCard label="Orders" value={num(orders)} delta={12.4} slot={2} note="this year" />
        <StatCard label="Average Order Value" value={inr(aov)} delta={10.3} slot={3} note="this year" />
        <StatCard label="Best Month" value={best} note="by revenue" />
      </div>

      <div className="space-y-5">
        <ChartFrame
          title="Revenue by Month"
          subtitle="Gross sales before discounts and refunds"
          table={{
            columns: ["Month", "Revenue"],
            rows: MONTHS.map((m, i) => [m, inr(SALES_BY_MONTH[i])]),
          }}
        >
          <LinePlot
            labels={MONTHS}
            data={SALES_BY_MONTH}
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
            rows: MONTHS.map((m, i) => [m, num(ORDERS_BY_MONTH[i])]),
          }}
        >
          <LinePlot
            labels={MONTHS}
            data={ORDERS_BY_MONTH}
            color="var(--color-series-2)"
            name="Order count"
            formatAs="count"
            height={200}
          />
        </ChartFrame>
      </div>
    </>
  );
}
