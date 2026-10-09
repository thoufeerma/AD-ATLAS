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
  FileText,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ReturnPanel from "@/components/order/ReturnPanel";
import { useSettings } from "@/components/providers/SettingsProvider";
import { LAST_ORDER_KEY, type LastOrder } from "@/components/checkout/lastOrder";
import { useAccount } from "@/lib/account";
import { api, ApiError } from "@/lib/api/client";
import type { OrderStatus, Product, TrackedOrder } from "@/lib/api/types";
import { inrPaise, cn, productImage, telHref, whatsappHref, looksLikeEmail } from "@/lib/utils";

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
  SHIPPED: { title: "Good news! Your order is on the way.", note: "Your order has been shipped and is expected to be delivered by" },
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
    hour: "2-digit",
    minute: "2-digit",
  });

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
  } catch {}

  const [number, setNumber] = useState(initialNumber);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const accountEmail = useAccount((s) => s.me?.email ?? "");
  const email = emailInput ?? (rememberedEmail || accountEmail);

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
    { Icon: Phone, title: store.supportPhone, note: "Mon - Sat | 10AM - 7PM", href: telHref(store.supportPhone) },
    { Icon: Mail, title: store.supportEmail, note: "We reply within 24 hrs", href: `mailto:${store.supportEmail}` },
    { Icon: MessageCircle, title: "WhatsApp Support", note: "Chat with us", href: whatsappHref(store.supportPhone) },
  ];

  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic Products", note: "Sourced with Care" },
    { Icon: RotateCcw, title: "Easy Returns", note: "Hassle Free Returns" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "100% Safe & Secure" },
    { Icon: Truck, title: "Free Shipping", note: "On Orders Above ₹999" },
  ];

  return (
    <div className="w-full space-y-10 py-10 md:py-14">
      {/* Lookup */}
      <section className="rounded-2xl border border-[#eaddce] bg-white p-8 md:p-12 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <h2 className="font-display text-[1.85rem] font-semibold text-[#20082d]">Enter Your Order Details</h2>
        <p className="mt-2 text-[0.9rem] font-medium text-[#20082d]/60">
          Enter your Order Number and Email ID to track your order status
        </p>

        <form onSubmit={lookUp} noValidate className="mt-8 grid items-end gap-6 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="order-no" className="mb-2 block text-[0.85rem] font-bold text-[#20082d]">
              Order Number <span className="text-[#c8963c]">*</span>
            </label>
            <input
              id="order-no"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              autoCapitalize="characters"
              placeholder="e.g. VL25052978"
              className="w-full rounded-md border border-[#eaddce] bg-white px-5 py-3.5 text-[0.95rem] font-medium uppercase text-[#20082d] placeholder:normal-case placeholder:text-[#20082d]/30 focus:border-[#c8963c] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="order-email" className="mb-2 block text-[0.85rem] font-bold text-[#20082d]">
              Email Address <span className="text-[#c8963c]">*</span>
            </label>
            <input
              id="order-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-md border border-[#eaddce] bg-white px-5 py-3.5 text-[0.95rem] font-medium text-[#20082d] placeholder:text-[#20082d]/30 focus:border-[#c8963c] focus:outline-none transition-colors"
            />
          </div>
          <Button type="submit" size="lg" className="h-[3.25rem] px-10 bg-[#20082d] text-white hover:bg-[#371938] font-bold uppercase tracking-widest text-[0.85rem]" disabled={looking}>
            <Truck className="size-5 mr-2.5" strokeWidth={2} /> {looking ? "LOOKING…" : "TRACK ORDER"}
          </Button>
        </form>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 text-[0.85rem] text-danger font-medium">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <p className="mt-6 text-[0.85rem] font-medium text-[#20082d]/60">
          Having trouble finding your order?{" "}
          <Link href="/contact" className="text-[#20082d] font-bold hover:text-[#c8963c] transition-colors">
            Contact us
          </Link>
        </p>
      </section>

      {order && <OrderResult order={order} bySlug={bySlug} email={email.trim()} />}

      {/* Help & Assurances */}
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-[#eaddce] bg-[#fcf9f5] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6 shrink-0 z-10">
            <span className="grid size-[4.5rem] shrink-0 place-items-center rounded-full bg-[#f6eadd] border border-[#eaddce]">
              <Headphones className="size-8 text-[#c8963c]" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-display text-[1.7rem] font-semibold text-[#20082d]">Need Help?</h2>
              <p className="text-[0.95rem] font-medium text-[#20082d]/70 mt-1">We're here for you!</p>
            </div>
          </div>

          <ul className="grid gap-8 sm:grid-cols-3 flex-1 w-full z-10 lg:pl-12">
            {help.map(({ Icon, title, note, href }) => (
              <li key={title}>
                <a href={href} className="group flex items-start gap-3.5">
                  <Icon className="size-6 mt-0.5 shrink-0 text-[#c8963c]" strokeWidth={1.5} />
                  <span className="text-[0.85rem] leading-[1.5]">
                    <span className="block font-bold text-[#20082d] group-hover:text-[#c8963c] transition-colors">{title}</span>
                    <span className="text-[#20082d]/70">{note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          
          <div className="absolute right-0 top-0 bottom-0 w-80 opacity-70 pointer-events-none hidden lg:block">
            <Image src="/images/login page left side banner.png" alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fcf9f5] via-[#fcf9f5]/60 to-transparent" />
          </div>
        </section>

        <ul className="grid grid-cols-2 gap-8 rounded-2xl border border-[#eaddce] bg-white p-8 md:p-10 lg:grid-cols-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)]">
          {assurances.map(({ Icon, title, note }) => (
            <li key={title} className="flex items-center justify-center lg:justify-start gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#fcf9f5] border border-[#eaddce]/50">
                <Icon className="size-6 text-[#c8963c]" strokeWidth={1.5} />
              </span>
              <span className="text-[0.85rem] leading-[1.4]">
                <span className="block font-bold text-[#20082d]">{title}</span>
                <span className="text-[#20082d]/60 font-medium text-[0.8rem]">{note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OrderResult({
  order,
  bySlug,
  email,
}: {
  order: TrackedOrder;
  bySlug: Map<string, Product>;
  email: string;
}) {
  const stopped = order.status === "CANCELLED" || order.status === "REFUNDED";
  const reached = STAGES.findIndex((s) => s.status === order.status);
  const firstAt = (status: OrderStatus) => order.events.find((e) => e.status === status)?.at;
  const headline = HEADLINE[order.status];
  const isCod = order.paymentMethod === "COD";
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  const payment =
    order.paymentStatus === "PAID"
      ? { label: "Paid", tone: "bg-green-100 text-green-800" }
      : order.paymentStatus === "REFUNDED"
        ? { label: "Refunded", tone: "bg-gray-200 text-gray-700" }
        : order.paymentStatus === "FAILED"
          ? { label: "Failed", tone: "bg-red-100 text-red-800" }
          : isCod
            ? { label: "Pay on Delivery", tone: "bg-[#fcf9f5] text-[#c8963c]" }
            : { label: "Pending", tone: "bg-[#fcf9f5] text-[#c8963c]" };

  return (
    <>
      {/* Status Tracker */}
      <section className="rounded-2xl border border-[#eaddce] bg-white p-8 md:p-12 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-[1.85rem] font-semibold text-[#20082d]">Order Status</h2>
          <div className="sm:text-right">
            <p className="text-[0.95rem] font-bold text-[#20082d]">Order #{order.number}</p>
            <p className="text-[0.85rem] font-medium text-[#20082d]/60 mt-1">Placed on {dateTime(order.placedAt)}</p>
          </div>
        </div>

        {!stopped && order.status !== "PENDING" && (
          <div className="relative mt-20 mb-10 w-full max-w-[92%] mx-auto">
            {/* Background Line */}
            <div className="absolute top-[1.45rem] left-0 right-0 h-[2.5px] bg-[#eaddce] z-0" />
            {/* Active Line Progress */}
            <div 
              className="absolute top-[1.45rem] left-0 h-[2.5px] bg-[#20082d] z-0 transition-all duration-500" 
              style={{ width: `${Math.max(0, (reached / (STAGES.length - 1)) * 100)}%` }} 
            />

            <ol className="relative z-10 flex justify-between">
              {STAGES.map((s, i) => {
                const done = i < reached;
                const active = i === reached;
                const future = i > reached;
                const at = firstAt(s.status);
                return (
                  <li key={s.status} className="flex flex-col items-center text-center w-28 -ml-14 first:ml-0 last:mr-0 first:w-auto last:w-auto">
                    <span
                      className={cn(
                        "grid size-12 place-items-center rounded-full border-[2.5px] transition-colors duration-300",
                        done ? "bg-[#20082d] border-[#20082d] text-white" : 
                        active ? "bg-white border-[#20082d] text-[#20082d]" : 
                        "bg-white border-[#eaddce] text-[#20082d]/30"
                      )}
                    >
                      {done ? <Check className="size-5" strokeWidth={3} /> : <s.Icon className="size-5" strokeWidth={active ? 2.5 : 2} />}
                    </span>
                    <p className={cn("mt-5 text-[0.85rem] font-bold", future ? "text-[#20082d]/50" : "text-[#20082d]")}>
                      {s.title}
                    </p>
                    <p className={cn("text-[0.75rem] font-medium mt-1.5 leading-[1.5]", future ? "text-[#20082d]/40" : "text-[#20082d]/70")}>
                      {at ? dateTime(at).split(",").map((line, idx) => <span key={idx} className="block">{line.trim()}</span>) : (
                        <>
                          <span className="block">Expected</span>
                          <span className="block">Soon</span>
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="mt-14 flex items-center gap-5 rounded-xl bg-[#f9f2f5] px-8 py-6 border border-[#20082d]/5">
          <span className="grid size-12 place-items-center rounded-full bg-transparent border border-[#20082d]/20 shrink-0">
            {stopped ? (
              <XCircle className="size-6 text-[#20082d]" strokeWidth={1.5} />
            ) : order.status === "PENDING" ? (
              <Clock className="size-6 text-[#20082d]" strokeWidth={1.5} />
            ) : (
              <Truck className="size-6 text-[#20082d]" strokeWidth={1.5} />
            )}
          </span>
          <div>
            <p className="text-[0.95rem] font-bold text-[#20082d]">
              {headline.title}
            </p>
            <p className="text-[0.85rem] font-medium text-[#20082d]/70 mt-1">
              {headline.note} {order.shippingEta ? ` ${order.shippingEta}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Details Split */}
      <section className="grid gap-8 lg:gap-10 lg:grid-cols-2 items-start">
        {/* Order Details Panel */}
        <div className="rounded-2xl border border-[#eaddce] bg-[#fcf9f5] p-8 md:p-12">
          <h2 className="font-display text-[1.65rem] font-semibold text-[#20082d] border-b border-[#eaddce] pb-6 mb-8">Order Details</h2>
          <dl className="space-y-6 text-[0.85rem]">
            <Row label="Order Number" value={order.number} />
            <Row label="Order Date" value={dateTime(order.placedAt)} />
            
            {order.tracking && (
              <div className="flex justify-between gap-6">
                <dt className="shrink-0 font-bold text-[#20082d]/70">Tracking</dt>
                <dd className="text-right font-bold text-[#20082d]">
                  {order.tracking.courier && <span className="block">{order.tracking.courier}</span>}
                  {order.tracking.url ? (
                    <a href={order.tracking.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-bold text-[#20082d] hover:text-[#c8963c] transition-colors mt-1.5">
                      <Truck className="size-4" /> {order.tracking.number}
                    </a>
                  ) : (
                    <span className="mt-1.5 block">{order.tracking.number}</span>
                  )}
                </dd>
              </div>
            )}
            
            <Row label="Payment Method" value={METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} />
            
            <div className="flex items-center justify-between">
              <dt className="font-bold text-[#20082d]/70">Payment Status</dt>
              <dd>
                <span className={cn("rounded-[0.25rem] px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider", payment.tone)}>
                  {payment.label}
                </span>
              </dd>
            </div>
            
            <Row label="Total Amount" value={inrPaise(order.totalPaise)} />
            
            <div className="flex justify-between gap-6 pt-3">
              <dt className="shrink-0 font-bold text-[#20082d]/70">Shipping Address</dt>
              <dd className="text-right leading-[1.65] font-semibold text-[#20082d]">
                <span className="font-bold block mb-1 text-[0.95rem]">{order.shipping.name}</span>
                {order.shipping.city}, {order.shipping.state} – {order.shipping.pincode}
                <br />
                India
              </dd>
            </div>
          </dl>
        </div>

        {/* Items Panel */}
        <div className="rounded-2xl border border-[#eaddce] bg-[#fcf9f5] p-8 md:p-12">
          <h2 className="font-display text-[1.65rem] font-semibold text-[#20082d] border-b border-[#eaddce] pb-6 mb-4">Items in Your Order ({itemCount})</h2>
          
          <ul className="divide-y divide-[#eaddce]">
            {order.items.map((i, n) => {
              const p = i.slug ? bySlug.get(i.slug) : undefined;
              return (
                <li key={`${i.slug ?? i.name}-${i.shade ?? ""}-${n}`} className="flex items-center gap-5 py-6">
                  <div className="relative size-16 shrink-0 overflow-hidden bg-transparent">
                    {p && <Image src={productImage(p)} alt="" fill sizes="64px" className="object-contain" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9rem] font-bold text-[#20082d]">{i.name}</p>
                    <p className="text-[0.75rem] font-medium text-[#20082d]/70 mt-1">
                      {[i.shade, p?.size].filter(Boolean).join(" · ")}
                    </p>
                    <p className="text-[0.75rem] font-medium text-[#20082d]/70 mt-1.5">Qty: {i.quantity}</p>
                  </div>
                  <span className="text-[0.95rem] font-bold text-[#20082d]">{inrPaise(i.lineTotalPaise)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="space-y-4 border-t border-[#eaddce] pt-8 text-[0.85rem]">
            <Row label="Subtotal" value={inrPaise(order.subtotalPaise)} />
            {order.discountPaise > 0 && (
              <div className="flex justify-between items-center">
                <dt className="font-bold text-[#20082d]/70">
                  Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                </dt>
                <dd className="font-bold text-green-700">– {inrPaise(order.discountPaise)}</dd>
              </div>
            )}
            <div className="flex justify-between items-center">
              <dt className="font-bold text-[#20082d]/70">Shipping</dt>
              <dd className={order.shippingPaise === 0 ? "font-bold text-green-700" : "font-bold text-[#20082d]"}>
                {order.shippingPaise === 0 ? "FREE" : inrPaise(order.shippingPaise)}
              </dd>
            </div>
          </dl>
          
          <div className="mt-8 flex items-center justify-between border-t border-[#eaddce] pt-8">
            <p className="font-display text-[1.5rem] font-semibold text-[#20082d]">
              {order.paymentStatus === "PAID" ? "Total Paid" : "Order Total"}
            </p>
            <p className="font-display text-[1.7rem] font-bold text-[#20082d]">{inrPaise(order.totalPaise)}</p>
          </div>

          <ReturnPanel orderNumber={order.number} email={email} />
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="font-bold text-[#20082d]/70">{label}</dt>
      <dd className="font-bold text-[#20082d] text-right">{value}</dd>
    </div>
  );
}
