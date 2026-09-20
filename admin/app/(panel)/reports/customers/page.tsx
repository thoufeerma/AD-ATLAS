import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ChartFrame from "@/components/charts/ChartFrame";
import Donut from "@/components/charts/Donut";
import LinePlot from "@/components/charts/LinePlot";
import ExportCsv from "@/components/reports/ExportCsv";
import NoData from "@/components/reports/NoData";
import { apiGet } from "@/lib/api/server";
import type { CustomerReport } from "@/lib/api/types";
import { inr, monthLong, monthShort, num } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer Reports" };

/** One colour per segment, in the palette's fixed order. */
const SLOTS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
  "var(--color-muted)",
];

export default async function CustomerReportPage() {
  const { totals, change, segments, newByMonth, top } = await apiGet<CustomerReport>("/admin/reports/customers");
  const anyone = totals.customers > 0;
  const shown = segments.filter((s) => s.count > 0);

  return (
    <>
      <PageHeader
        title="Customer Reports"
        subtitle="Who is buying, how often, and how much. Guests who have ordered are counted too."
        actions={
          <ExportCsv
            filename="velastia-customers"
            disabled={!anyone}
            sections={[
              {
                title: "Customer mix",
                columns: ["Segment", "Customers"],
                rows: segments.map((s) => [s.label, s.count]),
              },
              {
                title: "New customers by month",
                columns: ["Month", "New customers"],
                rows: newByMonth.map((m) => [monthLong(m.month), m.count]),
              },
              {
                title: "Highest lifetime value",
                columns: ["Name", "Email", "Account", "Orders", "Spent (₹)"],
                rows: top.map((c) => [
                  c.name,
                  c.email,
                  c.hasAccount ? "Yes" : "Guest",
                  c.orders,
                  (c.spentPaise / 100).toFixed(2),
                ]),
              },
            ]}
          />
        }
      />

      <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customers" value={num(totals.customers)} slot={1} note={`${num(totals.accounts)} with an account`} />
        <StatCard
          label="Average Lifetime Value"
          value={inr(totals.avgLifetimePaise / 100)}
          slot={2}
          note="per customer who has ordered"
        />
        <StatCard
          label="Repeat Purchase Rate"
          value={`${totals.repeatRatePct.toFixed(totals.repeatRatePct % 1 ? 1 : 0)}%`}
          slot={3}
          note="ordered more than once"
        />
        <StatCard
          label="New This Month"
          value={num(totals.newThisMonth)}
          delta={change.newThisMonth ?? undefined}
          note="vs last month"
        />
      </div>

      {anyone ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ChartFrame
            title="Customer Mix"
            subtitle="By how many orders each person has placed"
            table={{
              columns: ["Segment", "Customers", "Share"],
              rows: segments.map((s) => [
                s.label,
                num(s.count),
                `${Math.round((s.count / totals.customers) * 100)}%`,
              ]),
            }}
          >
            <Donut
              centreValue={num(totals.customers)}
              centreLabel="Customers"
              slices={shown.map((s, i) => ({
                label: s.label,
                value: s.count,
                pct: Math.round((s.count / totals.customers) * 100),
                color: SLOTS[i % SLOTS.length],
              }))}
            />
          </ChartFrame>

          <ChartFrame
            title="New Customers by Month"
            subtitle="First time we saw the email address, whether they signed up or checked out as a guest"
            table={{
              columns: ["Month", "New Customers"],
              rows: newByMonth.map((m) => [monthLong(m.month), num(m.count)]),
            }}
          >
            <LinePlot
              labels={newByMonth.map((m) => monthShort(m.month))}
              data={newByMonth.map((m) => m.count)}
              color="var(--color-series-1)"
              name="New customers"
              formatAs="count"
              height={210}
            />
          </ChartFrame>

          <Card title="Highest Lifetime Value" className="lg:col-span-2">
            {top.length === 0 ? (
              <p className="py-6 text-center text-[0.8rem] text-ink-2">
                No orders yet, so there is nobody to rank.
              </p>
            ) : (
              <ol className="divide-y divide-hairline">
                {top.map((c, i) => (
                  <li key={c.email} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="tnum grid size-7 shrink-0 place-items-center rounded-lg bg-plane text-[0.7rem] font-semibold text-ink-2">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.82rem] text-ink">{c.name}</span>
                      <span className="block truncate text-[0.68rem] text-muted">
                        {c.email}
                        {!c.hasAccount && " · guest"}
                      </span>
                    </span>
                    <span className="tnum text-[0.76rem] text-ink-2">
                      {c.orders} order{c.orders === 1 ? "" : "s"}
                    </span>
                    <span className="tnum w-24 text-right text-[0.82rem] font-medium text-ink">
                      {inr(c.spentPaise / 100)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      ) : (
        <NoData
          title="Customer Mix"
          note="No customers yet. Everyone who orders or signs up appears here, with what they've spent."
        />
      )}
    </>
  );
}
