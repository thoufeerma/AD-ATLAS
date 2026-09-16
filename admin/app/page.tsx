import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PackagePlus,
  TicketPlus,
  ImagePlus,
  Send,
  BarChart3,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge, { toneFor } from "@/components/ui/Badge";
import ChartFrame from "@/components/charts/ChartFrame";
import LinePlot from "@/components/charts/LinePlot";
import Donut from "@/components/charts/Donut";
import BarList from "@/components/charts/BarList";
import Sparkline from "@/components/charts/Sparkline";
import {
  KPIS,
  MONTHS,
  SALES_BY_MONTH,
  ORDERS_BY_MONTH,
  TOP_PRODUCTS,
  ORDERS,
  LOW_STOCK,
  COUNTERS,
  STORE_ANALYTICS,
  TRAFFIC_SOURCES,
  TOP_LOCATIONS,
  CUSTOMER_STATS,
} from "@/lib/mock";
import { inr, num, cn } from "@/lib/utils";

const RAMP = [
  "var(--color-ramp-1)",
  "var(--color-ramp-2)",
  "var(--color-ramp-3)",
  "var(--color-ramp-4)",
];

const SLOTS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
];

const QUICK_ACTIONS = [
  { label: "Add New Product", href: "/products/new", Icon: PackagePlus },
  { label: "Create Coupon", href: "/coupons", Icon: TicketPlus },
  { label: "Add New Banner", href: "/banners", Icon: ImagePlus },
  { label: "Send Email Campaign", href: "/campaigns", Icon: Send },
  { label: "View Reports", href: "/reports/sales", Icon: BarChart3 },
  { label: "Clear Cache", href: "/backup", Icon: Trash2 },
];

export default function DashboardPage() {
  const recent = ORDERS.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Welcome + KPIs */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-gradient-to-br from-[#fdeef0] via-[#fbf4fb] to-[#f3eefc] p-6">
          <h1 className="text-[0.95rem] text-ink-2">Welcome back,</h1>
          <p className="mt-1 text-[1.7rem] font-semibold leading-none text-ink">
            Admin <span aria-hidden>👋</span>
          </p>
          <p className="mt-3 max-w-[15rem] text-[0.8rem] leading-relaxed text-ink-2">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k) => (
            <StatCard
              key={k.label}
              label={k.label}
              value={k.value}
              delta={k.delta}
              series={k.series}
              slot={k.slot}
            />
          ))}
        </div>
      </div>

      {/* Sales overview + top selling + recent orders */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
        <ChartFrame
          title="Sales Overview"
          subtitle="Revenue and order volume, shown separately — see note below"
          controls={
            <span className="rounded-lg border border-hairline px-3 py-1.5 text-[0.72rem] text-ink-2">
              This Year
            </span>
          }
          table={{
            columns: ["Month", "Sales", "Orders"],
            rows: MONTHS.map((m, i) => [
              m,
              inr(SALES_BY_MONTH[i]),
              num(ORDERS_BY_MONTH[i]),
            ]),
          }}
        >
          {/*
            The reference draws Sales (₹) and Orders (a count) as two lines on a
            single ₹ axis — which makes an order count read as a rupee value and
            invents a correlation. Small multiples instead: each measure keeps
            its own scale, and the shared month axis still lets you compare shape.
          */}
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[0.72rem] font-medium text-ink-2">Sales (₹)</p>
              <LinePlot
                labels={MONTHS}
                data={SALES_BY_MONTH}
                color={SLOTS[0]}
                name="Sales in rupees"
                formatAs="rupees"
                height={168}
              />
            </div>
            <div>
              <p className="mb-1 text-[0.72rem] font-medium text-ink-2">Orders</p>
              <LinePlot
                labels={MONTHS}
                data={ORDERS_BY_MONTH}
                color={SLOTS[1]}
                name="Order count"
                formatAs="count"
                height={130}
              />
            </div>
          </div>
        </ChartFrame>

        <Card title="Top Selling Products" action="View All" actionHref="/reports/products">
          <ol className="space-y-4">
            {TOP_PRODUCTS.map((p) => (
              <li key={p.rank} className="flex items-center gap-3">
                <span className="tnum grid size-7 shrink-0 place-items-center rounded-lg bg-plane text-[0.7rem] font-semibold text-ink-2">
                  {p.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.78rem] text-ink">{p.name}</p>
                  <p className="tnum text-[0.68rem] text-muted">{num(p.sold)} sold</p>
                </div>
                <div className="text-right">
                  <p className="tnum text-[0.78rem] font-medium text-ink">{inr(p.revenue)}</p>
                  <p
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[0.66rem]",
                      p.trend === "up" ? "text-[#006300]" : "text-critical",
                    )}
                  >
                    {p.trend === "up" ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {p.trend === "up" ? "Rising" : "Falling"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-5">
          <Card title="Recent Orders" action="View All" actionHref="/orders">
            <ul className="space-y-3.5">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3">
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-[0.74rem] font-medium text-series-1 hover:underline"
                  >
                    #{o.id}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-[0.76rem] text-ink">
                    {o.customer}
                  </span>
                  <span className="tnum text-[0.76rem] text-ink">{inr(o.total)}</span>
                  <Badge tone={toneFor(o.status)} dot={false}>
                    {o.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Low Stock Products" action="View All" actionHref="/inventory">
            <ul className="space-y-3.5">
              {LOW_STOCK.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-[0.76rem] text-ink">
                    {p.name}
                  </span>
                  <span className="tnum text-[0.74rem] font-medium text-critical">
                    Stock: {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Counters + customer statistics */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTERS.map((c) => (
            <article
              key={c.label}
              className="rounded-[var(--radius-card)] border border-hairline bg-card p-5"
            >
              <p className="text-[0.78rem] text-ink-2">{c.label}</p>
              <p className="mt-2 text-[1.5rem] font-semibold leading-none text-ink">
                {c.value}
              </p>
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1 text-[0.68rem]",
                  c.tone === "up" ? "text-[#006300]" : "text-muted",
                )}
              >
                {c.tone === "up" ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {c.note}
              </p>
            </article>
          ))}
        </div>

        <ChartFrame
          title="Customer Statistics"
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
      </div>

      {/* Store analytics */}
      <Card title="Store Analytics">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-5 sm:grid-cols-2">
            {STORE_ANALYTICS.map((s, i) => (
              <div key={s.label} className="rounded-xl border border-hairline p-4">
                <p className="text-[0.74rem] text-ink-2">{s.label}</p>
                <p className="mt-1.5 text-[1.25rem] font-semibold leading-none text-ink">
                  {s.value}
                </p>
                <p
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-0.5 text-[0.66rem]",
                    s.delta >= 0 ? "text-[#006300]" : "text-critical",
                  )}
                >
                  {s.delta >= 0 ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {Math.abs(s.delta)}%
                </p>
                <div className="mt-2">
                  <Sparkline
                    data={s.series}
                    color={SLOTS[i % 3]}
                    label={`${s.label} trend`}
                    width={200}
                    height={32}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-4 text-[0.8rem] font-medium text-ink">Traffic Source</h3>
            {/* Ordered by share → single-hue ordinal ramp, not categorical hues */}
            <Donut
              size={140}
              thickness={22}
              centreValue="100%"
              centreLabel="of sessions"
              slices={TRAFFIC_SOURCES.map((t, i) => ({
                label: t.label,
                value: t.pct,
                pct: t.pct,
                color: RAMP[i],
              }))}
            />
          </div>

          <div>
            <h3 className="mb-4 text-[0.8rem] font-medium text-ink">Top Locations</h3>
            <BarList rows={TOP_LOCATIONS} />
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <Card title="Quick Actions">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-hairline px-3 py-4 text-center transition-colors hover:border-series-1 hover:bg-plane"
            >
              <Icon className="size-5 text-series-1" />
              <span className="text-[0.72rem] font-medium text-ink">{label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
