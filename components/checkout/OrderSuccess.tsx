"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  Package,
  Truck,
  Home,
  ClipboardCheck,
  MapPin,
  CreditCard,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { Product } from "@/lib/api/types";
import { inrPaise, productImage } from "@/lib/utils";
import { LAST_ORDER_KEY, type LastOrder } from "./lastOrder";

const TRACKER = [
  { Icon: ClipboardCheck, title: "Order Confirmed", note: "We've received your order" },
  { Icon: Package, title: "Processing", note: "We're preparing your items" },
  { Icon: Truck, title: "On The Way", note: "Your order is on the way" },
  { Icon: Home, title: "Delivered", note: "Enjoy your Velastia beauty" },
];

const METHOD_LABEL: Record<string, string> = {
  UPI: "UPI",
  CARD: "Credit / Debit Card",
  NETBANKING: "Net Banking",
  WALLET: "Wallet",
  COD: "Cash on Delivery",
};

/** sessionStorage never changes while this page is open, so there is nothing
 *  to subscribe to — but reading it through useSyncExternalStore keeps the
 *  server render (null) and the client render consistent without an effect. */
const subscribe = () => () => {};
const readOrder = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    // Storage can throw in private modes; fall back to the plain confirmation.
    return null;
  }
};

export default function OrderSuccess({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const { shipping } = useSettings();
  const [copied, setCopied] = useState(false);

  const number = params.get("order") ?? "";

  const raw = useSyncExternalStore(subscribe, readOrder, () => null);
  const saved = useMemo<LastOrder | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as LastOrder;
      // Only show details for the order in the URL, never a different one.
      return parsed.order?.number === number ? parsed : null;
    } catch {
      return null;
    }
  }, [raw, number]);

  const order = saved?.order;
  const isCod = order?.paymentMethod === "COD";
  const itemCount = order?.items.reduce((n, l) => n + l.quantity, 0) ?? 0;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const placedAt = order
    ? new Date(order.placedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const suggestions = products.filter((p) => p.status === "ACTIVE" && p.inStock).slice(0, 5);

  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic", note: "Products" },
    { Icon: RotateCcw, title: "Easy Returns", note: "& Refunds" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "Razorpay" },
    shipping?.freeAbovePaise != null
      ? { Icon: Truck, title: "Free Shipping", note: `Above ${inrPaise(shipping.freeAbovePaise)}` }
      : { Icon: Truck, title: "Fast Shipping", note: "Across India" },
  ];

  function copyNumber() {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const trackHref = number ? `/track-order?order=${encodeURIComponent(number)}` : "/track-order";

  return (
    <>
      {/* Confirmation */}
      <section className="border-b border-gold-200/60 bg-blush-100/60">
        <div className="container-vel py-14 text-center">
          <CheckCircle2 className="mx-auto size-14 text-success" strokeWidth={1.4} />
          <h1 className="mt-5 font-display text-[2.6rem] leading-none text-plum-800">
            Thank You!
          </h1>
          <p className="mt-2 font-script text-2xl text-gold-600">
            Your order has been placed successfully.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            We&apos;ve received your order and it&apos;s now being processed. Keep your order
            number handy — you&apos;ll need it to track your order.
          </p>

          {number && (
            <div className="mx-auto mt-7 inline-block rounded-[var(--radius-card)] bg-cream-100 px-8 py-5">
              <p className="label-caps text-[0.58rem] text-ink-soft">Order Number</p>
              <p className="mt-1.5 flex items-center justify-center gap-2 font-display text-2xl font-semibold text-plum-800">
                #{number}
                <button onClick={copyNumber} aria-label="Copy order number" className="text-gold-600 hover:text-gold-500">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </p>
              {placedAt && <p className="mt-1 text-[0.68rem] text-ink-soft">{placedAt}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Tracker */}
      <section className="container-vel -mt-px py-10">
        <ol className="grid gap-4 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKER.map(({ Icon, title, note }, i) => (
            <li key={title} className="flex items-center gap-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full ${
                  i === 0 ? "bg-plum-800 text-gold-300" : "border border-gold-300 text-gold-600"
                }`}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-[0.7rem] leading-tight">
                <span className="block font-medium text-plum-800">{title}</span>
                <span className="text-ink-soft">{note}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Details */}
      <section className="container-vel grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h2 className="font-display text-xl text-plum-800">Order Details</h2>
            {saved && (
              <p className="mt-1 text-[0.72rem] text-ink-soft">
                Placed with <span className="text-plum-800">{saved.email}</span> — use it with
                your order number to track this order.
              </p>
            )}

            {saved ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-plum-800">
                    <MapPin className="size-4 text-gold-600" /> Delivery Address
                  </h3>
                  <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-soft">
                    {saved.address.name}
                    <br />
                    {saved.address.line1}
                    {saved.address.line2 && (
                      <>
                        <br />
                        {saved.address.line2}
                      </>
                    )}
                    <br />
                    {saved.address.city}, {saved.address.state} – {saved.address.pincode}
                    <br />
                    India
                    <br />
                    {saved.address.phone}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-plum-800">
                      <Truck className="size-4 text-gold-600" /> Shipping Method
                    </h3>
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-soft">
                      {saved.order.shippingMethod ?? "Standard Shipping"}
                      {saved.order.shippingEta && (
                        <>
                          <br />
                          {saved.order.shippingEta}
                        </>
                      )}
                      <br />
                      {saved.order.shippingPaise === 0
                        ? "(Free Shipping)"
                        : inrPaise(saved.order.shippingPaise)}
                    </p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-plum-800">
                      <CreditCard className="size-4 text-gold-600" /> Payment Method
                    </h3>
                    <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-soft">
                      {METHOD_LABEL[saved.order.paymentMethod] ?? saved.order.paymentMethod}
                      <br />
                      {isCod
                        ? `Pay ${inrPaise(saved.order.totalPaise)} when your order arrives`
                        : "via Razorpay"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[0.75rem] leading-relaxed text-ink-soft">
                Track this order any time with your order number and the email you used at
                checkout.
              </p>
            )}
          </div>

          {/* What's next */}
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-card)] bg-blush-100 p-6">
            <div>
              <h3 className="font-display text-lg text-plum-800">What&apos;s Next?</h3>
              <p className="mt-1 max-w-sm text-[0.72rem] leading-relaxed text-ink-soft">
                We&apos;ll pack and ship your order within a few days. Follow every step on the
                Track Order page.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button href={trackHref}>
                  <Truck className="size-3.5" /> Track Your Order
                </Button>
                <Link
                  href="/shop"
                  className="text-[0.72rem] text-gold-700 hover:text-gold-600"
                >
                  Continue Shopping →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
          <h2 className="font-display text-xl text-plum-800">Order Summary</h2>

          {order ? (
            <>
              <ul className="mt-5 divide-y divide-gold-200/60">
                {order.items.map((l, i) => {
                  const p = l.slug ? bySlug.get(l.slug) : undefined;
                  return (
                    <li key={`${l.slug ?? l.name}-${l.shade ?? ""}-${i}`} className="flex items-center gap-3 py-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-50">
                        {p && (
                          <Image src={productImage(p)} alt="" fill sizes="48px" className="object-contain p-1" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.76rem] text-plum-800">{l.name}</p>
                        <p className="text-[0.66rem] text-ink-soft">
                          {[l.shade, p?.size].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-[0.66rem] text-ink-soft">Qty: {l.quantity}</p>
                      </div>
                      <span className="text-[0.8rem] text-plum-800">{inrPaise(l.lineTotalPaise)}</span>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-4 space-y-2.5 border-t border-gold-200/70 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">
                    Subtotal ({itemCount} {itemCount === 1 ? "Item" : "Items"})
                  </dt>
                  <dd className="text-plum-800">{inrPaise(order.subtotalPaise)}</dd>
                </div>
                {order.discountPaise > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">
                      Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                    </dt>
                    <dd className="font-medium text-success">– {inrPaise(order.discountPaise)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className={order.shippingPaise === 0 ? "font-medium text-success" : "text-plum-800"}>
                    {order.shippingPaise === 0 ? "FREE" : inrPaise(order.shippingPaise)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-end justify-between border-t border-gold-200/70 pt-4">
                <div>
                  <p className="font-display text-lg text-plum-800">
                    {isCod ? "Pay on Delivery" : "Total Paid"}
                  </p>
                  <p className="text-[0.65rem] text-ink-soft">(Inclusive of all taxes)</p>
                </div>
                <p className="font-display text-2xl font-semibold text-plum-800">
                  {inrPaise(order.totalPaise)}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Your itemised summary is on the{" "}
              <Link href={trackHref} className="text-gold-700 hover:text-gold-600">
                Track Order
              </Link>{" "}
              page.
            </p>
          )}
        </aside>
      </section>

      {/* Closing banner */}
      <section className="container-vel pb-10">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[var(--radius-card)] bg-blush-100 p-8">
          <div>
            <h2 className="font-display text-2xl leading-snug text-plum-800">
              You&apos;re One Step Closer
              <span className="block">to Flawless Beauty!</span>
            </h2>
            <p className="mt-2 text-[0.75rem] text-ink-soft">
              Thank you for choosing Velastia. We can&apos;t wait for you to
              experience the magic.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {assurances.map(({ Icon, title, note }) => (
              <li key={title} className="flex flex-col items-center gap-2 text-center">
                <Icon className="size-5 text-gold-600" />
                <span className="text-[0.62rem] leading-tight text-ink-soft">
                  <span className="block font-medium text-plum-800">{title}</span>
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="container-vel pb-14">
          <h2 className="mb-8 text-center font-display text-2xl tracking-[0.05em] text-plum-800">
            You May Also Love
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {suggestions.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
