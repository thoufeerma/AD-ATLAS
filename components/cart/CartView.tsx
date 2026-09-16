"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Minus,
  Plus,
  X,
  ArrowLeft,
  Lock,
  Tag,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  Gift,
  ShoppingBag,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import { useStore, useHydrated, resolveLines, cartTotals } from "@/lib/store";
import { inr } from "@/lib/utils";
import { STORE } from "@/lib/products";
import { TESTIMONIALS } from "@/lib/content";

const ASSURANCES = [
  { Icon: BadgeCheck, title: "100% Authentic", note: "Products" },
  { Icon: RotateCcw, title: "Easy Returns", note: "& Refunds" },
  { Icon: ShieldCheck, title: "Secure Payments", note: "Razorpay" },
  { Icon: Truck, title: "Free Shipping", note: `Above ₹${STORE.freeShippingAbove}` },
];

const WHY = [
  "Dermatologically Tested",
  "No Harmful Chemicals",
  "Cruelty Free",
  "Loved by Thousands",
];

export default function CartView() {
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const coupon = useStore((s) => s.coupon);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);

  const resolved = resolveLines(lines);
  const t = cartTotals(resolved, coupon);

  if (!hydrated) {
    return <div className="container-vel py-20" aria-hidden />;
  }

  if (resolved.length === 0) {
    return (
      <div className="container-vel py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-gold-500" />
        <h2 className="mt-5 font-display text-2xl text-plum-800">Your cart is empty</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Once you add something you love, it will show up here.
        </p>
        <Button href="/shop" className="mt-7">
          Continue Shopping
        </Button>
      </div>
    );
  }

  function handleCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (applyCoupon(code)) {
      setCouponError("");
      setCode("");
    } else {
      setCouponError(`That code is not valid. Try ${STORE.welcomeCode}.`);
    }
  }

  return (
    <div className="container-vel py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Lines */}
        <div>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100">
            <div className="hidden grid-cols-[minmax(0,1fr)_84px_120px_88px_36px] gap-3 border-b border-gold-200/70 px-5 py-3.5 sm:grid">
              {["Product", "Price", "Quantity", "Total", ""].map((h) => (
                <span key={h} className="label-caps text-[0.58rem] text-ink-soft">
                  {h}
                </span>
              ))}
            </div>

            <ul>
              {resolved.map((l) => (
                <li
                  key={`${l.slug}-${l.shade ?? ""}`}
                  className="grid grid-cols-[64px_minmax(0,1fr)_36px] items-center gap-3 border-b border-gold-200/50 px-5 py-5 last:border-0 sm:grid-cols-[minmax(0,1fr)_84px_120px_88px_36px]"
                >
                  <div className="col-span-2 flex items-center gap-4 sm:col-span-1">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-gold-200/70 bg-cream-50">
                      <Image
                        src={l.product.image}
                        alt={l.product.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${l.slug}`}
                        className="text-sm text-plum-800 hover:text-gold-600"
                      >
                        {l.product.name}
                      </Link>
                      {l.product.descriptor && (
                        <p className="mt-0.5 text-[0.68rem] text-ink-soft">
                          {l.product.descriptor}
                        </p>
                      )}
                      <p className="mt-0.5 text-[0.68rem] text-ink-soft">
                        {[l.product.size, l.shade].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>

                  <span className="hidden text-sm text-plum-800 sm:block">
                    {inr(l.product.price)}
                  </span>

                  <div className="col-start-2 sm:col-start-auto">
                    <div className="flex w-fit items-center rounded-sm border border-gold-300/70">
                      <button
                        onClick={() => setQty(l.slug, l.shade, l.qty - 1)}
                        aria-label={`Decrease quantity of ${l.product.name}`}
                        className="grid size-8 place-items-center text-plum-800 hover:text-gold-600"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm text-plum-800">{l.qty}</span>
                      <button
                        onClick={() => setQty(l.slug, l.shade, l.qty + 1)}
                        aria-label={`Increase quantity of ${l.product.name}`}
                        className="grid size-8 place-items-center text-plum-800 hover:text-gold-600"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(l.slug, l.shade)}
                      className="mt-1.5 text-[0.65rem] text-ink-soft hover:text-plum-800"
                    >
                      Remove
                    </button>
                  </div>

                  <span className="hidden text-sm font-medium text-plum-800 sm:block">
                    {inr(l.lineTotal)}
                  </span>

                  <button
                    onClick={() => remove(l.slug, l.shade)}
                    aria-label={`Remove ${l.product.name}`}
                    className="grid size-7 place-items-center justify-self-end rounded-full border border-gold-200 text-ink-soft transition-colors hover:border-plum-800 hover:text-plum-800"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <Button href="/shop" variant="outline">
              <ArrowLeft className="size-3.5" /> Continue Shopping
            </Button>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ASSURANCES.map(({ Icon, title, note }) => (
              <li key={title} className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-300/70">
                  <Icon className="size-4 text-gold-600" />
                </span>
                <span className="text-[0.68rem] leading-tight text-ink-soft">
                  <span className="block font-medium text-plum-800">{title}</span>
                  {note}
                </span>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <form
            onSubmit={handleCoupon}
            className="mt-6 rounded-[var(--radius-card)] bg-plum-800 p-5"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Tag className="size-6 shrink-0 text-gold-400" />
              <div className="flex-1">
                <p className="text-sm text-cream-50">Have a coupon code?</p>
                <p className="text-[0.68rem] text-cream-200/60">
                  Apply your code for instant discounts
                </p>
              </div>
              {coupon ? (
                <div className="flex items-center gap-3">
                  <span className="label-caps rounded-sm bg-gold-600 px-3 py-1.5 text-[0.6rem] text-white">
                    {coupon} applied
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[0.68rem] text-cream-200/70 hover:text-cream-50"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 gap-2 sm:flex-none">
                  <label htmlFor="coupon" className="sr-only">
                    Coupon code
                  </label>
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full rounded-sm border border-gold-500/35 bg-cream-50 px-3 py-2 text-sm text-plum-800 placeholder:text-ink-soft/60 focus:border-gold-400 focus:outline-none sm:w-52"
                  />
                  <Button type="submit" variant="gold">
                    Apply
                  </Button>
                </div>
              )}
            </div>
            {couponError && (
              <p className="mt-3 text-[0.68rem] text-blush-200">{couponError}</p>
            )}
          </form>

          {/* Gift banner */}
          <div className="mt-6 flex items-center gap-5 rounded-[var(--radius-card)] bg-blush-100 p-6">
            <Gift className="size-8 shrink-0 text-gold-600" />
            <div>
              <h3 className="font-display text-lg text-plum-800">
                Complimentary gift on orders above {inr(STORE.giftAbove)}
              </h3>
              <p className="mt-0.5 text-xs text-ink-soft">
                Luxury deserves a little extra. Treat yourself!
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h2 className="font-display text-xl text-plum-800">Order Summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <Row label={`Subtotal (${t.itemCount} Items)`} value={inr(t.subtotal)} />
              {t.discount > 0 && (
                <Row label="Discount" value={`- ${inr(t.discount)}`} tone="success" />
              )}
              <Row
                label="Shipping"
                value={t.shipping === 0 ? "FREE" : inr(t.shipping)}
                tone={t.shipping === 0 ? "success" : undefined}
              />
              {t.discount > 0 && (
                <div className="border-t border-gold-200/70 pt-3">
                  <Row label="You Save" value={inr(t.discount)} tone="success" />
                </div>
              )}
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-gold-200/70 pt-4">
              <div>
                <p className="text-sm font-medium text-plum-800">Estimated Total</p>
                <p className="text-[0.65rem] text-ink-soft">Inclusive of all taxes</p>
              </div>
              <p className="font-display text-2xl font-semibold text-plum-800">
                {inr(t.total)}
              </p>
            </div>

            <Button href="/checkout" className="mt-5 w-full" size="lg">
              <Lock className="size-3.5" /> Proceed to Checkout
            </Button>
            <p className="mt-2.5 text-center text-[0.65rem] text-ink-soft">
              Guaranteed safe &amp; secure checkout
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["Razorpay", "VISA", "Mastercard", "UPI", "Paytm"].map((m) => (
                <span
                  key={m}
                  className="rounded-sm border border-gold-200 bg-cream-50 px-2.5 py-1 text-[0.6rem] text-ink-soft"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h3 className="font-display text-lg text-plum-800">Why Velastia?</h3>
            <ul className="mt-4 space-y-3">
              {WHY.map((w) => (
                <li key={w} className="flex items-center gap-2.5 text-[0.75rem] text-ink-soft">
                  <BadgeCheck className="size-4 shrink-0 text-gold-600" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Social proof */}
      <section className="mt-12 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7">
        <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="font-display text-xl leading-snug text-plum-800">
              Trusted by 10,000+ Beautiful Souls
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={4.8} size={15} />
              <span className="text-[0.7rem] text-ink-soft">4.8/5 (2,345 Reviews)</span>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <li key={t.name}>
                <div className="flex items-center gap-2.5">
                  <Image
                    src={t.avatar}
                    alt=""
                    width={30}
                    height={30}
                    className="size-[30px] rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[0.72rem] font-medium text-plum-800">{t.name}</p>
                    <StarRating value={t.rating} size={9} />
                  </div>
                </div>
                <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-soft">{t.quote}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={tone === "success" ? "font-medium text-success" : "text-plum-800"}>
        {value}
      </dd>
    </div>
  );
}
