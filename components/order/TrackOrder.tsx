"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import Button from "@/components/ui/Button";
import { PRODUCTS, STORE } from "@/lib/products";
import { inr, cn } from "@/lib/utils";

/**
 * Mirrors O-Order-Track-1.0v.png. With no backend yet, submitting the form
 * reveals the sample order the design shows; the lookup itself is a stub.
 */
const STAGES = [
  { Icon: Check, title: "Order Confirmed", date: "May 29, 2025", time: "11:45 AM", done: true },
  { Icon: Check, title: "Processing", date: "May 29, 2025", time: "02:30 PM", done: true },
  { Icon: Truck, title: "Shipped", date: "May 30, 2025", time: "09:15 AM", done: true, current: true },
  { Icon: Package, title: "Out for Delivery", date: "Expected", time: "May 31, 2025" },
  { Icon: Home, title: "Delivered", date: "Expected", time: "May 31, 2025" },
];

const SAMPLE = [
  { slug: "face-serum", qty: 1 },
  { slug: "day-cream", qty: 1 },
  { slug: "velvet-matte-lipstick", qty: 2, shade: "Rose Desire" },
];

const HELP = [
  { Icon: Phone, title: STORE.supportPhone, note: STORE.supportHours },
  { Icon: Mail, title: STORE.supportEmail, note: "We reply within 24 hrs" },
  { Icon: MessageCircle, title: "WhatsApp Support", note: "Chat with us" },
];

const ASSURANCES = [
  { Icon: BadgeCheck, title: "100% Authentic Products", note: "Sourced with Care" },
  { Icon: RotateCcw, title: "Easy Returns", note: "Hassle Free Returns" },
  { Icon: ShieldCheck, title: "Secure Payments", note: "100% Safe & Secure" },
  { Icon: Truck, title: "Free Shipping", note: `On Orders Above ₹${STORE.freeShippingAbove}` },
];

export default function TrackOrder() {
  const [shown, setShown] = useState(false);

  const items = SAMPLE.flatMap((s) => {
    const product = PRODUCTS.find((p) => p.slug === s.slug);
    return product ? [{ ...s, product, total: product.price * s.qty }] : [];
  });
  const subtotal = items.reduce((n, i) => n + i.total, 0);
  const discount = Math.round(subtotal * 0.1);
  const total = subtotal - discount;

  return (
    <div className="container-vel space-y-6 py-10">
      {/* Lookup */}
      <section className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
        <h2 className="font-display text-xl text-plum-800">Enter Your Order Details</h2>
        <p className="mt-1 text-[0.72rem] text-ink-soft">
          Enter your Order Number and Email ID to track your order status
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShown(true);
          }}
          className="mt-6 grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label htmlFor="order-no" className="mb-1.5 block text-[0.72rem] text-plum-800">
              Order Number <span className="text-gold-600">*</span>
            </label>
            <input
              id="order-no"
              required
              placeholder="e.g. VL25052978"
              className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
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
              placeholder="Enter your email address"
              className="w-full rounded-sm border border-gold-200 bg-cream-50 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg">
            <Truck className="size-3.5" /> Track Order
          </Button>
        </form>

        <p className="mt-4 text-[0.7rem] text-ink-soft">
          Having trouble finding your order?{" "}
          <Link href="/contact" className="text-plum-600 hover:text-gold-600">
            Contact us
          </Link>
        </p>
      </section>

      {shown && (
        <>
          {/* Status */}
          <section className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-display text-xl text-plum-800">Order Status</h2>
              <div className="text-right">
                <p className="text-sm text-plum-800">Order #VL25052978</p>
                <p className="text-[0.68rem] text-ink-soft">Placed on May 29, 2025</p>
              </div>
            </div>

            <ol className="mt-8 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {STAGES.map((s) => (
                <li key={s.title} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-full",
                      s.done
                        ? "bg-plum-800 text-gold-300"
                        : "border border-gold-300 text-gold-500",
                      s.current && "ring-2 ring-gold-500 ring-offset-2 ring-offset-cream-100",
                    )}
                  >
                    <s.Icon className="size-4" />
                  </span>
                  <p className="mt-2.5 text-[0.72rem] font-medium text-plum-800">{s.title}</p>
                  <p className="text-[0.65rem] text-ink-soft">{s.date}</p>
                  <p className="text-[0.65rem] text-ink-soft">{s.time}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex items-start gap-3 rounded-sm bg-blush-100 px-5 py-4">
              <Truck className="mt-0.5 size-5 shrink-0 text-gold-600" />
              <div>
                <p className="text-sm font-medium text-plum-800">
                  Good news! Your order is on the way.
                </p>
                <p className="text-[0.72rem] text-ink-soft">
                  Your order has been shipped and is expected to be delivered by May 31, 2025.
                </p>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
              <h2 className="font-display text-xl text-plum-800">Order Details</h2>
              <dl className="mt-5 space-y-3 text-[0.75rem]">
                <Row label="Order Number" value="VL25052978" />
                <Row label="Order Date" value="May 29, 2025 | 11:45 AM" />
                <Row label="Payment Method" value="Razorpay (UPI)" />
                <div className="flex items-center justify-between">
                  <dt className="text-ink-soft">Payment Status</dt>
                  <dd>
                    <span className="rounded-sm bg-success/12 px-2 py-0.5 text-[0.68rem] font-medium text-success">
                      Paid
                    </span>
                  </dd>
                </div>
                <Row label="Total Amount" value={inr(total)} />
                <div className="flex justify-between gap-6">
                  <dt className="shrink-0 text-ink-soft">Shipping Address</dt>
                  <dd className="text-right leading-relaxed text-plum-800">
                    Ananya Sharma
                    <br />
                    123, Lotus Residency
                    <br />
                    MG Road, Andheri West
                    <br />
                    Mumbai, Maharashtra – 400053
                    <br />
                    India
                    <br />
                    {STORE.supportPhone}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:p-8">
              <h2 className="font-display text-xl text-plum-800">
                Items in Your Order ({items.length})
              </h2>
              <ul className="mt-5 divide-y divide-gold-200/60">
                {items.map((i) => (
                  <li key={i.slug} className="flex items-center gap-3.5 py-3.5">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-50">
                      <Image src={i.product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.78rem] text-plum-800">{i.product.name}</p>
                      <p className="text-[0.66rem] text-ink-soft">
                        {[i.shade, i.product.size].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-[0.66rem] text-ink-soft">Qty: {i.qty}</p>
                    </div>
                    <span className="text-[0.8rem] text-plum-800">{inr(i.total)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-4 space-y-2.5 border-t border-gold-200/70 pt-4 text-[0.78rem]">
                <Row label="Subtotal" value={inr(subtotal)} />
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Discount ({STORE.welcomeCode})</dt>
                  <dd className="font-medium text-success">– {inr(discount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="font-medium text-success">FREE</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-gold-200/70 pt-4">
                <p className="font-display text-lg text-plum-800">Total Paid</p>
                <p className="font-display text-2xl font-semibold text-plum-800">{inr(total)}</p>
              </div>
            </div>
          </section>
        </>
      )}

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
            {HELP.map(({ Icon, title, note }) => (
              <li key={title} className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0 text-gold-600" />
                <span className="text-[0.7rem] leading-tight">
                  <span className="block font-medium text-plum-800">{title}</span>
                  <span className="text-ink-soft">{note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ul className="grid grid-cols-2 gap-6 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 lg:grid-cols-4">
        {ASSURANCES.map(({ Icon, title, note }) => (
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-plum-800">{value}</dd>
    </div>
  );
}
