import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  RefreshCcw,
  Truck,
  MapPin,
  CreditCard,
  User,
  Check,
  Package,
  Home,
  ClipboardCheck,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import { ORDERS, PRODUCTS } from "@/lib/mock";
import { inr, cn } from "@/lib/utils";

export function generateStaticParams() {
  return ORDERS.map((o) => ({ id: o.id }));
}

const STAGES = [
  { Icon: ClipboardCheck, label: "Confirmed" },
  { Icon: Package, label: "Processing" },
  { Icon: Truck, label: "Shipped" },
  { Icon: Home, label: "Delivered" },
];

const REACHED: Record<string, number> = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: 0,
  Refunded: 3,
};

export default async function OrderDetailPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = ORDERS.find((o) => o.id === id);
  if (!order) notFound();

  // Stand-in line items until the API can return the real basket. The discount
  // is derived so subtotal − discount equals the order's stored total: the
  // arithmetic on screen always reconciles, whatever the placeholder lines are.
  const lines = PRODUCTS.slice(0, order.items).map((p, i) => ({
    ...p,
    qty: i === 0 ? 2 : 1,
  }));
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const discount = Math.max(subtotal - order.total, 0);
  const reached = REACHED[order.status] ?? 0;

  return (
    <>
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.76rem] text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.id}`}
        subtitle={`Placed on ${order.placed} · ${order.items} items`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Printer className="size-3.5" /> Invoice
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCcw className="size-3.5" /> Refund
            </Button>
            <Button size="sm">
              <Truck className="size-3.5" /> Update Status
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title="Fulfilment">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-[0.78rem] text-ink-2">Current status</span>
              <Badge tone={toneFor(order.status)}>{order.status}</Badge>
            </div>
            <ol className="grid gap-5 sm:grid-cols-4">
              {STAGES.map((s, i) => {
                const done = i <= reached && order.status !== "Cancelled";
                return (
                  <li key={s.label} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        done ? "bg-series-1 text-white" : "bg-plane text-muted",
                      )}
                    >
                      {done && i < reached ? (
                        <Check className="size-4" />
                      ) : (
                        <s.Icon className="size-4" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[0.74rem]",
                        done ? "font-medium text-ink" : "text-muted",
                      )}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Items">
            <ul className="divide-y divide-hairline">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-plane text-[0.62rem] font-medium text-muted">
                    {l.sku.split("-")[1]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] text-ink">{l.name}</p>
                    <p className="text-[0.68rem] text-muted">
                      {l.sku} · Qty {l.qty}
                    </p>
                  </div>
                  <span className="tnum text-[0.82rem] text-ink">
                    {inr(l.price * l.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-hairline pt-5 text-[0.82rem]">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd className="tnum text-ink">{inr(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-2">Discount</dt>
                  <dd className="tnum font-medium text-[#006300]">– {inr(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-2">Shipping</dt>
                <dd className="font-medium text-[#006300]">FREE</dd>
              </div>
              <div className="flex justify-between border-t border-hairline pt-3">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="tnum text-[1.05rem] font-semibold text-ink">
                  {inr(order.total)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Customer">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-sidebar text-[0.7rem] font-semibold text-pill">
                {order.customer
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[0.85rem] font-medium text-ink">
                  {order.customer}
                </p>
                <p className="truncate text-[0.7rem] text-muted">{order.email}</p>
              </div>
            </div>
            <Button href="/customers" variant="outline" size="sm" className="mt-4 w-full">
              <User className="size-3.5" /> View Customer
            </Button>
          </Card>

          <Card title="Shipping Address">
            <p className="flex gap-2.5 text-[0.78rem] leading-relaxed text-ink-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-series-1" />
              <span>
                {order.customer}
                <br />
                123, Lotus Residency, MG Road
                <br />
                {order.city}, India
                <br />
                +91 98765 43210
              </span>
            </p>
          </Card>

          <Card title="Payment">
            <p className="flex items-center gap-2.5 text-[0.78rem] text-ink-2">
              <CreditCard className="size-4 shrink-0 text-series-1" />
              {order.payment}
            </p>
            <div className="mt-3">
              <Badge tone={order.status === "Refunded" ? "serious" : "good"}>
                {order.status === "Refunded" ? "Refunded" : "Paid"}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
