import { Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import Donut from "@/components/charts/Donut";
import LinePlot from "@/components/charts/LinePlot";
import { CUSTOMER_STATS, CUSTOMERS, MONTHS } from "@/lib/mock";
import { inr, num } from "@/lib/utils";

export const metadata = { title: "Customer Reports" };

const SLOTS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
];

const NEW_BY_MONTH = [180, 214, 196, 268, 240, 322, 290, 358, 330, 402, 372, 284];

export default function CustomerReportPage() {
  const top = [...CUSTOMERS].sort((a, b) => b.spent - a.spent).slice(0, 5);
  const avgLtv = Math.round(
    CUSTOMERS.reduce((n, c) => n + c.spent, 0) / CUSTOMERS.length,
  );
  const repeatRate =
    (CUSTOMERS.filter((c) => c.orders > 1).length / CUSTOMERS.length) * 100;

  return (
    <>
      <PageHeader
        title="Customer Reports"
        subtitle="Who is buying, how often, and how much"
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export Report
          </Button>
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Customers" value={num(CUSTOMER_STATS.total)} delta={15.7} slot={1} />
        <StatCard label="Average Lifetime Value" value={inr(avgLtv)} delta={8.4} slot={2} />
        <StatCard label="Repeat Purchase Rate" value={`${repeatRate.toFixed(0)}%`} delta={4.1} slot={3} />
        <StatCard label="New This Month" value="284" delta={-6.2} slot={1} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartFrame
          title="Customer Mix"
          table={{
            columns: ["Segment", "Customers", "Share"],
            rows: CUSTOMER_STATS.segments.map((s) => [s.label, num(s.count), `${s.pct}%`]),
          }}
        >
          <Donut
            centreValue={num(CUSTOMER_STATS.total)}
            centreLabel="Total Customers"
            slices={CUSTOMER_STATS.segments.map((s) => ({
              label: s.label,
              value: s.count,
              pct: s.pct,
              color: SLOTS[s.slot - 1],
            }))}
          />
        </ChartFrame>

        <ChartFrame
          title="New Customers by Month"
          table={{
            columns: ["Month", "New Customers"],
            rows: MONTHS.map((m, i) => [m, num(NEW_BY_MONTH[i])]),
          }}
        >
          <LinePlot
            labels={MONTHS}
            data={NEW_BY_MONTH}
            color="var(--color-series-1)"
            name="New customers"
            formatAs="count"
            height={210}
          />
        </ChartFrame>

        <Card title="Highest Lifetime Value" className="lg:col-span-2">
          <ol className="divide-y divide-hairline">
            {top.map((c, i) => (
              <li key={c.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="tnum grid size-7 shrink-0 place-items-center rounded-lg bg-plane text-[0.7rem] font-semibold text-ink-2">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.82rem] text-ink">{c.name}</span>
                  <span className="block text-[0.68rem] text-muted">{c.email}</span>
                </span>
                <span className="tnum text-[0.76rem] text-ink-2">{c.orders} orders</span>
                <span className="tnum w-24 text-right text-[0.82rem] font-medium text-ink">
                  {inr(c.spent)}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
