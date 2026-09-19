"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  Truck,
  Check,
  Package,
  Home,
  Headphones,
  Phone,
  Mail,
  MessageCircle,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
  ClipboardCheck,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { LAST_ORDER_KEY, type LastOrder } from "@/components/checkout/lastOrder";
import { api, ApiError } from "@/lib/api/client";
import type { OrderStatus, Product, TrackedOrder } from "@/lib/api/types";
import { inrPaise, cn, productImage, telHref, whatsappHref, looksLikeEmail } from "@/lib/utils";

/** Mirrors O-Order-Track-1.0v.png, driven by the order the API returns. */
const STAGES: { status: OrderStatus; title: string; Icon: typeof Check }[] = [
  { status: "CONFIRMED", title: "Order Confirmed", Icon: ClipboardCheck },
  { status: "PROCESSING", title: "Processing", Icon: Package },
  { status: "SHIPPED", title: "Shipped", Icon: Truck },
  { status: "OUT_FOR_DELIVERY", title: "Out for Delivery", Icon: Truck },
  { status: "DELIVERED", title: "Delivered", Icon: Home },
];

const HEADLINE: Record<OrderStatus, { title: string; note: string }> = {
  PENDING: { title: "Awaiting payment", note: "We'll start on your order as soon as payment is confirmed." },
  CONFIRMED: { title: "Order confirmed", note: "We've received your order and will start preparing it shortly." },
  PROCESSING: { title: "Being prepared", note: "We're packing your items with care." },
  SHIPPED: { title: "Good news! Your order is on the way.", note: "It has left our warehouse and is with the courier." },
  OUT_FOR_DELIVERY: { title: "Out for delivery", note: "Your order should reach you today." },
  DELIVERED: { title: "Delivered", note: "Enjoy your Velastia beauty!" },
  CANCELLED: { title: "This order was cancelled", note: "If you didn't expect this, please contact us." },
  REFUNDED: { title: "This order was refunded", note: "Refunds reach the original payment method in 5–7 business days." },
};

const METHOD_LABEL: Record<string, string> = {
  UPI: "Razorpay (UPI)",
  CARD: "Razorpay (Card)",
  NETBANKING: "Razorpay (Net Banking)",
  WALLET: "Razorpay (Wallet)",
  COD: "Cash on Delivery",
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** The email used at checkout in this tab, to save retyping it. */
const subscribe = () => () => {};
const readLastOrder = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};

export default function TrackOrder({ products }: { products: Product[] }) {
  const { store } = useSettings();
  const params = useSearchParams();
  const initialNumber = params.get("order") ?? "";

  const raw = useSyncExternalStore(subscribe, readLastOrder, () => null);
  let rememberedEmail = "";
  try {
    const last = raw ? (JSON.parse(raw) as LastOrder) : null;
    if (last && last.order.number === initialNumber.toUpperCase()) rememberedEmail = last.email;
  } catch {
    // Unreadable storage just means no prefill.
  }

  const [number, setNumber] = useState(initialNumber);
  // null until the shopper types, so the remembered email can fill in.
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const email = emailInput ?? rememberedEmail;

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [looking, setLooking] = useState(false);
  const [error, setError] = useState("");

  const bySlug = new Map(products.map((p) => [p.slug, p]));

  async function lookUp(e: React.FormEvent) {
    e.preventDefault();
    const n = number.trim();
    if (!n || !looksLikeEmail(email)) {
      setError("Enter your order number and the email you used at checkout.");
      return;
    }
    setLooking(true);
    setError("");
    try {
      const q = new URLSearchParams({ number: n, email: email.trim() });
      setOrder(await api<TrackedOrder>("GET", `/orders/track?${q}`));
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof ApiError && err.status === 404
          ? "We couldn't find an order with that number and email. Check both and try again."
          : (err as Error).message,
      );
    } finally {
      setLooking(false);
    }
  }

  const help = [
    { Icon: Phone, title: store.supportPhone, note: store.supportHours, href: telHref(store.supportPhone) },
    { Icon: Mail, title: store.supportEmail, note: "We reply within 24 hrs", href: `mailto:${store.supportEmail}` },
    { Icon: MessageCircle, title: "WhatsApp Support", note: "Chat with us", href: whatsappHref(store.supportPhone) },
  ];

  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic Products", note: "Sourced with Care" },
    { Icon: RotateCcw, title: "Easy Returns", note: "Hassle Free Returns" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "100% Safe & Secure" },
    { Icon: Headphones, title: "Customer Support", note: "We're Here to Help" },
  ];

  return (
    <div className="container-vel space-y-6 py-10">
      {/* Lookup */}
      <section className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
        <h2 className="font-display text-xl text-plum-800">Enter Your Order Details</h2>
        <p className="mt-1 text-[0.72rem] text-ink-soft">
          Enter your Order Number and Email ID to track your order status
        </p>

        <form onSubmit={lookUp} noValidate className="mt-6 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="order-no" className="mb-1.5 block text-[0.72rem] text-plum-800">
              Order Number <span className="text-gold-600">*</span>
            </label>
            <input
              id="order-no"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoCapitalize="characters"
              placeholder="e.g. VL2605291234"
              className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm uppercase text-plum-800 placeholder:normal-case placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="order-email" className="mb-1.5 block text-[0.72rem] text-plum-800">
              Email Address <span className="text-gold-600">*</span>
            </label>
            <input
              id="order-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg" disabled={looking}>
            <Truck className="size-3.5" /> {looking ? "Looking…" : "Track Order"}
          </Button>
        </form>

        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 text-[0.75rem] text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <p className="mt-4 text-[0.7rem] text-ink-soft">
          Having trouble finding your order?{" "}
          <Link href="/contact" className="text-plum-600 hover:text-gold-600">
            Contact us
          </Link>
        </p>
      </section>

      {order && <OrderResult order={order} bySlug={bySlug} />}

      {/* Help */}
      <section className="rounded-[var(--radius-card)] border border-gold-200/70 bg-blush-100 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-blush-200">
              <Headphones className="size-5 text-gold-700" />
            </span>
            <div>
              <h2 className="font-display text-lg text-plum-800">Need Help?</h2>
              <p className="text-[0.72rem] text-ink-soft">We&apos;re here for you!</p>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-3">
            {help.map(({ Icon, title, note, href }) => (
              <li key={title}>
                <a href={href} className="group flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-gold-600" />
                  <span className="text-[0.7rem] leading-tight">
                    <span className="block font-medium text-plum-800 group-hover:text-gold-600">{title}</span>
                    <span className="text-ink-soft">{note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ul className="grid grid-cols-2 gap-6 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 lg:grid-cols-4">
        {assurances.map(({ Icon, title, note }) => (
          <li key={title} className="flex items-center gap-2.5">
            <Icon className="size-5 shrink-0 text-gold-600" />
            <span className="text-[0.66rem] leading-tight">
              <span className="block font-medium text-plum-800">{title}</span>
              <span className="text-ink-soft">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderResult({ order, bySlug }: { order: TrackedOrder; bySlug: Map<string, Product> }) {
  const stopped = order.status === "CANCELLED" || order.status === "REFUNDED";
  const reached = STAGES.findIndex((s) => s.status === order.status);
  const firstAt = (status: OrderStatus) => order.events.find((e) => e.status === status)?.at;
  const headline = HEADLINE[order.status];
  const isCod = order.paymentMethod === "COD";
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  const payment =
    order.paymentStatus === "PAID"
      ? { label: "Paid", tone: "bg-success/12 text-success" }
      : order.paymentStatus === "REFUNDED"
        ? { label: "Refunded", tone: "bg-cream-300 text-ink-soft" }
        : order.paymentStatus === "FAILED"
          ? { label: "Failed", tone: "bg-danger/10 text-danger" }
          : isCod
            ? { label: "Pay on Delivery", tone: "bg-gold-200/60 text-gold-700" }
            : { label: "Pending", tone: "bg-gold-200/60 text-gold-700" };

  return (
    <>
      {/* Status */}
      <section className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-xl text-plum-800">Order Status</h2>
          <div className="text-right">
            <p className="text-sm text-plum-800">Order #{order.number}</p>
            <p className="text-[0.68rem] text-ink-soft">Placed on {dateTime(order.placedAt)}</p>
          </div>
        </div>

        {!stopped && order.status !== "PENDING" && (
          <ol className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {STAGES.map((s, i) => {
              const done = i <= reached;
              const at = firstAt(s.status);
              return (
                <li key={s.status} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-full",
                      done ? "bg-plum-800 text-gold-300" : "border border-gold-300 text-gold-500",
                      i === reached && "ring-2 ring-gold-500 ring-offset-2 ring-offset-cream-100",
                    )}
                  >
                    {done && i < reached ? <Check className="size-4" /> : <s.Icon className="size-4" />}
                  </span>
                  <p className="mt-2.5 text-[0.72rem] font-medium text-plum-800">{s.title}</p>
                  <p className="text-[0.65rem] text-ink-soft">
                    {at ? dateTime(at) : done ? "Done" : "Upcoming"}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8 flex items-start gap-3 rounded-sm bg-blush-100 px-5 py-4">
          {stopped ? (
            <XCircle className="mt-0.5 size-5 shrink-0 text-gold-600" />
          ) : order.status === "PENDING" ? (
            <Clock className="mt-0.5 size-5 shrink-0 text-gold-600" />
          ) : (
            <Truck className="mt-0.5 size-5 shrink-0 text-gold-600" />
          )}
          <div>
            <p className="text-sm font-medium text-plum-800">{headline.title}</p>
            <p className="text-[0.72rem] text-ink-soft">{headline.note}</p>
          </div>
        </div>

        {/* Every update, including notes the team added */}
        {order.events.length > 0 && (
          <ul className="mt-6 space-y-2 border-t border-gold-200/70 pt-5">
            {[...order.events].reverse().map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex flex-wrap gap-x-3 text-[0.72rem]">
                <span className="w-40 shrink-0 text-ink-soft">{dateTime(e.at)}</span>
                <span className="text-plum-800">
                  {HEADLINE[e.status]?.title ?? e.status}
                  {e.note && <span className="text-ink-soft"> — {e.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Details */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
          <h2 className="font-display text-xl text-plum-800">Order Details</h2>
          <dl className="mt-5 space-y-3 text-[0.75rem]">
            <Row label="Order Number" value={order.number} />
            <Row label="Order Date" value={dateTime(order.placedAt)} />
            {order.shippingMethod && (
              <Row
                label="Delivery"
                value={order.shippingEta ? `${order.shippingMethod} · ${order.shippingEta}` : order.shippingMethod}
              />
            )}
            <Row label="Payment Method" value={METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} />
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Payment Status</dt>
              <dd>
                <span className={cn("rounded-sm px-2 py-0.5 text-[0.68rem] font-medium", payment.tone)}>
                  {payment.label}
                </span>
              </dd>
            </div>
            <Row label="Total Amount" value={inrPaise(order.totalPaise)} />
            <div className="flex justify-between gap-6">
              <dt className="shrink-0 text-ink-soft">Shipping To</dt>
              <dd className="text-right leading-relaxed text-plum-800">
                {order.shipping.name}
                <br />
                {order.shipping.city}, {order.shipping.state} – {order.shipping.pincode}
                <br />
                India
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
          <h2 className="font-display text-xl text-plum-800">Items in Your Order ({itemCount})</h2>
          <ul className="mt-5 divide-y divide-gold-200/60">
            {order.items.map((i, n) => {
              const p = i.slug ? bySlug.get(i.slug) : undefined;
              return (
                <li key={`${i.slug ?? i.name}-${i.shade ?? ""}-${n}`} className="flex items-center gap-3.5 py-3.5">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-50">
                    {p && <Image src={productImage(p)} alt="" fill sizes="48px" className="object-contain p-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.78rem] text-plum-800">{i.name}</p>
                    <p className="text-[0.66rem] text-ink-soft">
                      {[i.shade, p?.size].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-[0.66rem] text-ink-soft">Qty: {i.quantity}</p>
                  </div>
                  <span className="text-[0.8rem] text-plum-800">{inrPaise(i.lineTotalPaise)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 space-y-2.5 border-t border-gold-200/70 pt-4 text-[0.78rem]">
            <Row label="Subtotal" value={inrPaise(order.subtotalPaise)} />
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
          <div className="mt-4 flex items-center justify-between border-t border-gold-200/70 pt-4">
            <p className="font-display text-lg text-plum-800">
              {order.paymentStatus === "PAID" ? "Total Paid" : "Order Total"}
            </p>
            <p className="font-display text-2xl font-semibold text-plum-800">{inrPaise(order.totalPaise)}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-plum-800">{value}</dd>
    </div>
  );
}
