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
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import Avatar from "@/components/ui/Avatar";
import QuoteSummary from "./QuoteSummary";
import { useSettings } from "@/components/providers/SettingsProvider";
import { MAX_QTY, useStore, useHydrated } from "@/lib/store";
import { resolveCart, quoteItems, useQuote } from "@/lib/cart";
import { api } from "@/lib/api/client";
import type { Product, Quote, RatingSummary, Testimonial } from "@/lib/api/types";
import { inrPaise, cn, productImage } from "@/lib/utils";

export default function CartView({
  products,
  giftBanner,
  rating,
  testimonials,
}: {
  products: Product[];
  /** The admin's "cart.inline" banner headline, if one is active. */
  giftBanner: string | null;
  rating: RatingSummary;
  testimonials: Testimonial[];
}) {
  // The marketing lines here are editable in the admin (Settings → Site Copy).
  const { shipping, copy } = useSettings();
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const hydrated = useHydrated();
  const lines = useStore((s) => s.lines);
  const coupon = useStore((s) => s.coupon);
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  const setCoupon = useStore((s) => s.setCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);

  const rows = resolveCart(lines, products);
  const items = quoteItems(rows);
  const blocked = rows.some((r) => r.problem);
  const { quote, error, stale } = useQuote(hydrated ? { items, couponCode: coupon } : null);

  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic", note: "Products" },
    { Icon: RotateCcw, title: "Easy Returns", note: "& Refunds" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "Razorpay" },
    shipping?.freeAbovePaise != null
      ? { Icon: Truck, title: "Free Shipping", note: `Above ${inrPaise(shipping.freeAbovePaise)}` }
      : { Icon: Truck, title: "Fast Shipping", note: "Across India" },
  ];

  if (!hydrated) {
    return <div className="container-vel py-20" aria-hidden />;
  }

  if (rows.length === 0) {
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

  // The code is checked against the API before it's kept, so an unknown code
  // is reported right away instead of silently doing nothing.
  async function handleCoupon(e: React.FormEvent) {
    e.preventDefault();
    const entered = code.trim();
    if (!entered) return;
    if (items.length === 0) {
      setCouponError("Add an available item to your cart first.");
      return;
    }
    setApplying(true);
    setCouponError("");
    try {
      const q = await api<Quote>("POST", "/cart/quote", { items, couponCode: entered });
      if (q.coupon) {
        setCoupon(q.coupon.code);
        setCode("");
      } else {
        setCouponError(q.couponError ?? "That code is not valid");
      }
    } catch (err) {
      setCouponError((err as Error).message);
    } finally {
      setApplying(false);
    }
  }

  // A kept code can stop applying later, e.g. when the cart drops below its
  // minimum. Say why, rather than quietly dropping the discount.
  const keptCodeProblem = coupon && quote && !stale && !quote.coupon ? quote.couponError : null;

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
              {rows.map((r) => {
                const p = r.product;
                const name = p?.name ?? "Unavailable product";
                return (
                  <li
                    key={`${r.slug}-${r.shade ?? ""}`}
                    className={cn(
                      "grid grid-cols-[64px_minmax(0,1fr)_36px] items-center gap-3 border-b border-gold-200/50 px-5 py-5 last:border-0 sm:grid-cols-[minmax(0,1fr)_84px_120px_88px_36px]",
                      r.problem && "bg-blush-100/50",
                    )}
                  >
                    <div className="col-span-2 flex items-center gap-4 sm:col-span-1">
                      <div
                        className={cn(
                          "relative size-16 shrink-0 overflow-hidden rounded-md border border-gold-200/70 bg-cream-50",
                          r.problem && "opacity-50",
                        )}
                      >
                        {p && (
                          <Image
                            src={productImage(p)}
                            alt={p.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        {p ? (
                          <Link
                            href={`/product/${r.slug}`}
                            className="text-sm text-plum-800 hover:text-gold-600"
                          >
                            {p.name}
                          </Link>
                        ) : (
                          <p className="text-sm text-plum-800">{name}</p>
                        )}
                        {p?.descriptor && (
                          <p className="mt-0.5 text-[0.68rem] text-ink-soft">{p.descriptor}</p>
                        )}
                        <p className="mt-0.5 text-[0.68rem] text-ink-soft">
                          {[p?.size, r.shade].filter(Boolean).join(" · ")}
                        </p>
                        {r.problem && (
                          <p className="mt-1 flex items-center gap-1 text-[0.68rem] font-medium text-danger">
                            <AlertCircle className="size-3.5 shrink-0" /> {r.problem}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="hidden text-sm text-plum-800 sm:block">
                      {p ? inrPaise(p.pricePaise) : "—"}
                    </span>

                    <div className="col-start-2 sm:col-start-auto">
                      {!r.problem && (
                        <div className="flex w-fit items-center rounded-sm border border-gold-300/70">
                          <button
                            onClick={() => setQty(r.slug, r.shade, r.qty - 1)}
                            aria-label={`Decrease quantity of ${name}`}
                            className="grid size-8 place-items-center text-plum-800 hover:text-gold-600"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm text-plum-800">{r.qty}</span>
                          <button
                            onClick={() => setQty(r.slug, r.shade, r.qty + 1)}
                            disabled={r.qty >= MAX_QTY}
                            aria-label={`Increase quantity of ${name}`}
                            className="grid size-8 place-items-center text-plum-800 hover:text-gold-600 disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => remove(r.slug, r.shade)}
                        className="mt-1.5 text-[0.65rem] text-ink-soft hover:text-plum-800"
                      >
                        Remove
                      </button>
                    </div>

                    <span className="hidden text-sm font-medium text-plum-800 sm:block">
                      {p && !r.problem ? inrPaise(p.pricePaise * r.qty) : "—"}
                    </span>

                    <button
                      onClick={() => remove(r.slug, r.shade)}
                      aria-label={`Remove ${name}`}
                      className="grid size-7 place-items-center justify-self-end rounded-full border border-gold-200 text-ink-soft transition-colors hover:border-plum-800 hover:text-plum-800"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <Button href="/shop" variant="outline">
              <ArrowLeft className="size-3.5" /> Continue Shopping
            </Button>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {assurances.map(({ Icon, title, note }) => (
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
                  <span
                    className={cn(
                      "label-caps rounded-sm px-3 py-1.5 text-[0.6rem]",
                      keptCodeProblem ? "bg-cream-200/20 text-cream-100" : "bg-gold-600 text-white",
                    )}
                  >
                    {keptCodeProblem ? coupon : `${coupon} applied`}
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
                    autoCapitalize="characters"
                    className="w-full rounded-sm border border-gold-500/35 bg-cream-50 px-3 py-2 text-sm uppercase text-plum-800 placeholder:normal-case placeholder:text-ink-soft/60 focus:border-gold-400 focus:outline-none sm:w-52"
                  />
                  <Button type="submit" variant="gold" disabled={applying || !code.trim()}>
                    {applying ? "…" : "Apply"}
                  </Button>
                </div>
              )}
            </div>
            {(couponError || keptCodeProblem) && (
              <p role="alert" className="mt-3 text-[0.68rem] text-blush-200">
                {couponError || `${coupon} isn't applied: ${keptCodeProblem}.`}
              </p>
            )}
          </form>

          {/* Gift banner */}
          {giftBanner && (
            <div className="mt-6 flex items-center gap-5 rounded-[var(--radius-card)] bg-blush-100 p-6">
              <Gift className="size-8 shrink-0 text-gold-600" />
              <div>
                <h3 className="font-display text-lg text-plum-800">{giftBanner}</h3>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Luxury deserves a little extra. Treat yourself!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
            <h2 className="font-display text-xl text-plum-800">Order Summary</h2>

            {items.length > 0 ? (
              <QuoteSummary
                quote={quote}
                stale={stale || !!error}
                totalLabel="Estimated Total"
                showSavings
              />
            ) : (
              <p className="mt-4 text-sm text-ink-soft">None of the items in your cart can be bought right now.</p>
            )}

            {(error || blocked) && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-sm bg-blush-100 px-3 py-2.5 text-[0.72rem] text-plum-800">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                {error ?? "Remove the unavailable items above to continue."}
              </p>
            )}

            {error || blocked || items.length === 0 ? (
              <Button className="mt-5 w-full" size="lg" disabled>
                <Lock className="size-3.5" /> Proceed to Checkout
              </Button>
            ) : (
              <Button href="/checkout" className="mt-5 w-full" size="lg">
                <Lock className="size-3.5" /> Proceed to Checkout
              </Button>
            )}
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
              {copy.whyVelastia.map((w) => (
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
      {testimonials.length > 0 && (
        <section className="mt-12 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7">
          <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="font-display text-xl leading-snug text-plum-800">
                {copy.socialProofHeadline}
              </h2>
              {rating.total > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={rating.average} size={15} />
                  <span className="text-[0.7rem] text-ink-soft">
                    {rating.average.toFixed(1)}/5 ({rating.total.toLocaleString("en-IN")}{" "}
                    {rating.total === 1 ? "Review" : "Reviews"})
                  </span>
                </div>
              )}
            </div>
            <ul className="grid gap-5 sm:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <div className="flex items-center gap-2.5">
                    <Avatar src={t.avatarUrl} name={t.author} size={30} />
                    <div>
                      <p className="text-[0.72rem] font-medium text-plum-800">{t.author}</p>
                      <StarRating value={t.rating} size={9} />
                    </div>
                  </div>
                  <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-soft">{t.quote}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
