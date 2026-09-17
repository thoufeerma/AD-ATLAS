import Link from "next/link";
import {
  ArrowUpRight,
  PackagePlus,
  TicketPlus,
  ImagePlus,
  Send,
  BarChart3,
  Trash2,
  Activity,
  Inbox,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge, { toneFor } from "@/components/ui/Badge";
import ChartFrame from "@/components/charts/ChartFrame";
import LinePlot from "@/components/charts/LinePlot";
import Donut from "@/components/charts/Donut";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { humanize, type Dashboard } from "@/lib/api/types";
import { inr, num, cn } from "@/lib/utils";

const SLOTS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const QUICK_ACTIONS = [
  { label: "Add New Product", href: "/products/new", Icon: PackagePlus },
  { label: "Create Coupon", href: "/coupons", Icon: TicketPlus },
  { label: "Add New Banner", href: "/banners", Icon: ImagePlus },
  { label: "Send Email Campaign", href: "/campaigns", Icon: Send },
  { label: "View Reports", href: "/reports/sales", Icon: BarChart3 },
  { label: "Clear Cache", href: "/backup", Icon: Trash2 },
];

const rupees = (paise: number) => inr(paise / 100);

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <Inbox className="size-6 text-muted" />
      <p className="max-w-[16rem] text-[0.76rem] text-ink-2">{children}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [admin, d] = await Promise.all([
    requireAdmin(),
    apiGet<Dashboard>("/admin/dashboard"),
  ]);

  const months = d.salesByMonth.map((m) => MONTH_NAMES[Number(m.month.slice(5, 7)) - 1]!);
  const salesRupees = d.salesByMonth.map((m) => m.salesPaise / 100);
  const orderCounts = d.salesByMonth.map((m) => m.orders);
  const hasSales = salesRupees.some((v) => v > 0);

  const segTotal = d.customerSegments.repeat + d.customerSegments.oneTime + d.customerSegments.noPurchase;
  const segments = [
    { label: "Repeat customers", count: d.customerSegments.repeat },
    { label: "One-time customers", count: d.customerSegments.oneTime },
    { label: "No purchase yet", count: d.customerSegments.noPurchase },
  ].map((s) => ({ ...s, pct: segTotal ? Math.round((s.count / segTotal) * 1000) / 10 : 0 }));

  // No prior 30-day period to compare against → no delta, rather than "+∞%".
  const delta = (v: number | null) => (v === null ? undefined : v);

  return (
    <div className="space-y-5">
      {/* Welcome + KPIs */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <section className="relative overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-gradient-to-br from-[#fdeef0] via-[#fbf4fb] to-[#f3eefc] p-6">
          <h1 className="text-[0.95rem] text-ink-2">Welcome back,</h1>
          <p className="mt-1 text-[1.7rem] font-semibold leading-tight text-ink">
            {admin.name.split(" ")[0]} <span aria-hidden>👋</span>
          </p>
          <p className="mt-3 max-w-[15rem] text-[0.8rem] leading-relaxed text-ink-2">
            Here&apos;s what&apos;s happening with your store in the last 30 days.
          </p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Sales"
            value={rupees(d.kpis.totalSalesPaise.value)}
            delta={delta(d.kpis.totalSalesPaise.delta)}
            series={salesRupees}
            slot={1}
          />
          <StatCard
            label="Orders"
            value={num(d.kpis.orders.value)}
            delta={delta(d.kpis.orders.delta)}
            series={orderCounts}
            slot={2}
          />
          <StatCard
            label="New Customers"
            value={num(d.kpis.newCustomers.value)}
            delta={delta(d.kpis.newCustomers.delta)}
            slot={3}
          />
          <StatCard
            label="Revenue"
            value={rupees(d.kpis.revenuePaise.value)}
            delta={delta(d.kpis.revenuePaise.delta)}
            note={`vs last 30 days · AOV ${rupees(d.kpis.averageOrderValuePaise)}`}
            slot={1}
          />
        </div>
      </div>

      {/* Sales overview + top selling + recent orders */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,4fr)]">
        {hasSales ? (
          <ChartFrame
            title="Sales Overview"
            subtitle="Last 12 months — revenue and order volume shown separately"
            table={{
              columns: ["Month", "Sales", "Orders"],
              rows: d.salesByMonth.map((m, i) => [
                `${months[i]} ${m.month.slice(0, 4)}`,
                rupees(m.salesPaise),
                num(m.orders),
              ]),
            }}
          >
            {/*
              Revenue (₹) and order count have different units, so they are
              small multiples on their own scales — never two lines on one ₹
              axis, which would make an order count read as a rupee amount.
            */}
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[0.72rem] font-medium text-ink-2">Sales (₹)</p>
                <LinePlot labels={months} data={salesRupees} color={SLOTS[0]!} name="Sales in rupees" formatAs="rupees" height={168} />
              </div>
              <div>
                <p className="mb-1 text-[0.72rem] font-medium text-ink-2">Orders</p>
                <LinePlot labels={months} data={orderCounts} color={SLOTS[1]!} name="Order count" formatAs="count" height={130} />
              </div>
            </div>
          </ChartFrame>
        ) : (
          <Card title="Sales Overview">
            <Empty>No sales yet. This chart fills in as orders come through the storefront.</Empty>
          </Card>
        )}

        <Card title="Top Selling Products" action="View All" actionHref="/reports/products">
          {d.topProducts.length === 0 ? (
            <Empty>Best sellers appear here once orders are placed.</Empty>
          ) : (
            <ol className="space-y-4">
              {d.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="tnum grid size-7 shrink-0 place-items-center rounded-lg bg-plane text-[0.7rem] font-semibold text-ink-2">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.78rem] text-ink">{p.name}</p>
                    <p className="tnum text-[0.68rem] text-muted">{num(p.unitsSold)} sold</p>
                  </div>
                  <p className="tnum text-[0.78rem] font-medium text-ink">{rupees(p.revenuePaise)}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Recent Orders" action="View All" actionHref="/orders">
            {d.recentOrders.length === 0 ? (
              <Empty>No orders yet.</Empty>
            ) : (
              <ul className="space-y-3.5">
                {d.recentOrders.map((o) => (
                  <li key={o.number} className="flex items-center gap-3">
                    <Link href={`/orders/${o.number}`} className="text-[0.74rem] font-medium text-series-1 hover:underline">
                      #{o.number}
                    </Link>
                    <span className="min-w-0 flex-1 truncate text-[0.76rem] text-ink">{o.shipName}</span>
                    <span className="tnum text-[0.76rem] text-ink">{rupees(o.totalPaise)}</span>
                    <Badge tone={toneFor(o.status)} dot={false}>
                      {humanize(o.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Low Stock Products" action="View All" actionHref="/inventory">
            {d.lowStock.length === 0 ? (
              <Empty>Everything is above its low-stock threshold.</Empty>
            ) : (
              <ul className="space-y-3.5">
                {d.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-[0.76rem] text-ink">{p.name}</span>
                    <span className={cn("tnum text-[0.74rem] font-medium", p.stock === 0 ? "text-critical" : "text-[#8a5d00]")}>
                      {p.stock === 0 ? "Out of stock" : `Stock: ${p.stock}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Counters + customer statistics */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Counter label="Total Products" value={d.counters.products} href="/products" />
          <Counter label="Total Categories" value={d.counters.categories} href="/categories" />
          <Counter
            label="Total Reviews"
            value={d.counters.reviews}
            href="/reviews"
            note={d.counters.pendingReviews ? `${d.counters.pendingReviews} awaiting moderation` : undefined}
          />
          <Counter label="Active Coupons" value={d.counters.activeCoupons} href="/coupons" />
        </div>

        {segTotal === 0 ? (
          <Card title="Customer Statistics">
            <Empty>Customers are created when they place their first order.</Empty>
          </Card>
        ) : (
          <ChartFrame
            title="Customer Statistics"
            table={{
              columns: ["Segment", "Customers", "Share"],
              rows: segments.map((s) => [s.label, num(s.count), `${s.pct}%`]),
            }}
          >
            <Donut
              centreValue={num(segTotal)}
              centreLabel="Total Customers"
              slices={segments.map((s, i) => ({ label: s.label, value: s.count, pct: s.pct, color: SLOTS[i]! }))}
            />
          </ChartFrame>
        )}
      </div>

      {/* Store analytics — no data source yet */}
      <Card title="Store Analytics">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-plane">
            <Activity className="size-5 text-series-1" />
          </span>
          <div className="flex-1">
            <p className="text-[0.85rem] font-medium text-ink">Traffic analytics isn&apos;t connected yet</p>
            <p className="mt-1 max-w-2xl text-[0.76rem] leading-relaxed text-ink-2">
              Visitors, conversion rate, traffic sources and top locations come from an analytics
              service such as Google Analytics 4 or Plausible, not from the store database. Every
              order, sales and customer figure above is live.
            </p>
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

function Counter({
  label,
  value,
  href,
  note,
}: {
  label: string;
  value: number;
  href: string;
  note?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-card)] border border-hairline bg-card p-5 transition-colors hover:border-series-1"
    >
      <p className="text-[0.78rem] text-ink-2">{label}</p>
      <p className="mt-2 text-[1.5rem] font-semibold leading-none text-ink">{num(value)}</p>
      <p className={cn("mt-2 inline-flex items-center gap-1 text-[0.68rem]", note ? "text-[#8a5d00]" : "text-muted")}>
        {note ? note : (<>View all <ArrowUpRight className="size-3" /></>)}
      </p>
    </Link>
  );
}
