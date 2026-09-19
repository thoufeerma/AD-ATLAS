import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, User, Mail, Phone, Tag, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge, { toneFor } from "@/components/ui/Badge";
import StatusControl from "@/components/orders/StatusControl";
import { ApiError, apiGet } from "@/lib/api/server";
import { humanize, type OrderDetail } from "@/lib/api/types";
import { inr } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/orders/[number]">): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number}` };
}

const rupees = (paise: number) => inr(paise / 100);
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default async function OrderDetailPage({ params }: PageProps<"/orders/[number]">) {
  const { number } = await params;

  let order: OrderDetail;
  try {
    order = await apiGet<OrderDetail>(`/admin/orders/${encodeURIComponent(number)}`);
  } catch (err) {
    // Only a genuine 404 becomes the not-found page. Anything else — including
    // the redirect thrown for an expired session — must propagate.
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <>
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[0.76rem] text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to orders
      </Link>

      <PageHeader
        title={`Order #${order.number}`}
        subtitle={`Placed ${when(order.placedAt)} · ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        actions={<Badge tone={toneFor(order.status)}>{humanize(order.status)}</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card title="Update Status">
            <StatusControl number={order.number} status={order.status} />
          </Card>

          <Card title="Timeline">
            <ol className="relative space-y-5 border-l border-hairline pl-5">
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[26px] top-1 size-2.5 rounded-full border-2 border-card bg-series-1" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneFor(e.status)} dot={false}>
                      {humanize(e.status)}
                    </Badge>
                    <span className="text-[0.7rem] text-muted">{when(e.createdAt)}</span>
                  </div>
                  {e.note && <p className="mt-1.5 text-[0.78rem] text-ink-2">{e.note}</p>}
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Items">
            <ul className="divide-y divide-hairline">
              {order.items.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] text-ink">{l.productName}</p>
                    <p className="text-[0.68rem] text-muted">
                      {[l.sku, l.shadeName && `Shade: ${l.shadeName}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="tnum text-[0.76rem] text-ink-2">
                    {l.quantity} × {rupees(l.unitPricePaise)}
                  </span>
                  <span className="tnum w-24 text-right text-[0.82rem] text-ink">
                    {rupees(l.lineTotalPaise)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-hairline pt-5 text-[0.82rem]">
              <Row label="Subtotal" value={rupees(order.subtotalPaise)} />
              {order.discountPaise > 0 && (
                <Row
                  label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"}
                  value={`– ${rupees(order.discountPaise)}`}
                  tone="good"
                />
              )}
              <Row
                label="Shipping"
                value={order.shippingPaise === 0 ? "FREE" : rupees(order.shippingPaise)}
                tone={order.shippingPaise === 0 ? "good" : undefined}
              />
              <div className="flex justify-between border-t border-hairline pt-3">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="tnum text-[1.05rem] font-semibold text-ink">{rupees(order.totalPaise)}</dd>
              </div>
              <p className="text-right text-[0.68rem] text-muted">
                Includes {rupees(order.taxPaise)} GST
              </p>
            </dl>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Customer">
            <ul className="space-y-2.5 text-[0.78rem] text-ink-2">
              <li className="flex items-center gap-2.5">
                <User className="size-4 shrink-0 text-series-1" />
                <span className="text-ink">{order.customer?.name ?? order.shipName}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-series-1" />
                <a href={`mailto:${order.email}`} className="truncate hover:text-series-1">
                  {order.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-series-1" />
                <a href={`tel:${order.shipPhone}`} className="hover:text-series-1">
                  +91 {order.shipPhone}
                </a>
              </li>
            </ul>
          </Card>

          <Card title="Shipping Address">
            {order.shippingMethod && (
              <p className="mb-3 flex gap-2.5 text-[0.78rem] text-ink-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-series-1" />
                <span>
                  <span className="font-medium text-ink">{order.shippingMethod}</span>
                  {order.shippingEta && <span className="block text-[0.72rem] text-muted">{order.shippingEta}</span>}
                </span>
              </p>
            )}
            <p className="flex gap-2.5 text-[0.78rem] leading-relaxed text-ink-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-series-1" />
              <span>
                {order.shipName}
                <br />
                {order.shipLine1}
                {order.shipLine2 && (
                  <>
                    <br />
                    {order.shipLine2}
                  </>
                )}
                <br />
                {order.shipCity}, {order.shipState} – {order.shipPincode}
                <br />
                {order.shipCountry}
              </span>
            </p>
          </Card>

          <Card title="Payment">
            <p className="flex items-center gap-2.5 text-[0.78rem] text-ink-2">
              <CreditCard className="size-4 shrink-0 text-series-1" />
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod
                  ? `Razorpay · ${humanize(order.paymentMethod)}`
                  : "—"}
            </p>
            {order.couponCode && (
              <p className="mt-2.5 flex items-center gap-2.5 text-[0.78rem] text-ink-2">
                <Tag className="size-4 shrink-0 text-series-1" />
                Coupon {order.couponCode}
              </p>
            )}
            <div className="mt-3">
              <Badge tone={toneFor(order.paymentStatus)}>{humanize(order.paymentStatus)}</Badge>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-2">{label}</dt>
      <dd className={tone === "good" ? "tnum font-medium text-[#006300]" : "tnum text-ink"}>{value}</dd>
    </div>
  );
}
