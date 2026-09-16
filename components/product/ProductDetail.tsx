"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  Clock,
  Droplets,
  Sparkles,
  Leaf,
  ShieldCheck,
  ZoomIn,
  Check,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/ui/ProductCard";
import { useStore } from "@/lib/store";
import { inr, cn } from "@/lib/utils";
import { PRODUCTS, type Product } from "@/lib/products";
import { INGREDIENTS, RATING_SUMMARY, TESTIMONIALS } from "@/lib/content";

const FEATURES = [
  { Icon: Clock, label: "Long Lasting", note: "Up to 12 Hours" },
  { Icon: ShieldCheck, label: "Smudge Proof", note: "Transfer Resistant" },
  { Icon: Droplets, label: "Rich Pigment", note: "One Swipe Color" },
  { Icon: Leaf, label: "Infused with Vitamin E", note: "Nourishing" },
  { Icon: Sparkles, label: "Dermatologically Tested", note: "Safe for All Skin Types" },
];

const TABS = ["Why You'll Love It", "Ingredients", "How to Use", "Shipping & Returns"] as const;

const HOW_TO_USE = [
  "Start with clean, exfoliated lips for the smoothest finish.",
  "Line the lips first if you want a sharper edge — the Velastia Lip Liner in a matching tone works best.",
  "Apply from the centre outwards, then press your lips together once.",
  "Build a second layer only where you want deeper colour.",
];

const SHIPPING_NOTES = [
  "Free shipping on all orders above ₹999.",
  "Standard delivery in 3–5 business days, metro cities usually sooner.",
  "Easy returns within 7 days of delivery on unopened products.",
  "Refunds reach the original payment method in 5–7 business days.",
];

export default function ProductDetail({ product }: { product: Product }) {
  const shades = product.shades ?? [];
  const [shade, setShade] = useState(shades[0]?.name);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [added, setAdded] = useState(false);

  const add = useStore((s) => s.add);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const wished = wishlist.includes(product.slug);

  // "Frequently bought together" — the bundle from the reference, priced off the
  // catalog rather than hardcoded, at the 15% the design advertises.
  const bundle = ["lip-liner", "velvet-matte-liquid-lipstick", "makeup-fixer"]
    .filter((s) => s !== product.slug)
    .map((s) => PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is Product => !!p);
  const bundleItems = [product, ...bundle].slice(0, 3);
  const bundleFull = bundleItems.reduce((n, p) => n + p.price, 0);
  const bundlePrice = Math.round(bundleFull * 0.85);

  const related = PRODUCTS.filter(
    (p) => p.status === "active" && p.slug !== product.slug,
  ).slice(0, 5);

  function handleAdd() {
    add(product.slug, qty, shade);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="container-vel py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div className="flex gap-4">
            <div className="hidden w-[68px] shrink-0 flex-col gap-3 sm:flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border bg-cream-100 transition-colors",
                    i === 0 ? "border-gold-500" : "border-gold-200/70 hover:border-gold-400",
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="68px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[var(--radius-card)] border border-gold-200/60 bg-cream-100">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 92vw"
                  className="object-contain p-6"
                />
              </div>
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-cream-50/90 px-3 py-1.5 text-[0.65rem] text-plum-800 backdrop-blur">
                <ZoomIn className="size-3.5" /> Zoom
              </span>
            </div>
          </div>

          {/* Buy panel */}
          <div>
            {product.bestseller && (
              <span className="label-caps inline-block rounded-full bg-gold-600 px-3 py-1 text-[0.55rem] text-white">
                Best Seller
              </span>
            )}

            <h1 className="mt-3 font-display text-[2rem] leading-tight text-plum-800 sm:text-[2.3rem]">
              {product.name}
            </h1>
            {shade && <p className="mt-1 font-display text-xl text-gold-600">{shade}</p>}

            {product.rating && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-soft">
                <StarRating value={product.rating} size={15} />
                <span className="font-medium text-plum-800">{product.rating}</span>
                <span>({product.reviewCount?.toLocaleString("en-IN")} reviews)</span>
                <span className="text-gold-300">|</span>
                <span>32 answered questions</span>
              </div>
            )}

            <p className="mt-5 font-display text-[2rem] font-semibold leading-none text-plum-800">
              {inr(product.price)}
            </p>
            <p className="mt-1 text-[0.7rem] text-ink-soft">Inclusive of all taxes</p>

            {product.blurb && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.blurb}</p>
            )}

            <ul className="mt-6 space-y-2.5">
              {FEATURES.map(({ Icon, label, note }) => (
                <li key={label} className="flex items-center gap-2.5 text-[0.78rem]">
                  <Icon className="size-4 shrink-0 text-gold-600" />
                  <span className="text-plum-800">{label}</span>
                  <span className="text-gold-300">|</span>
                  <span className="text-ink-soft">{note}</span>
                </li>
              ))}
            </ul>

            {shades.length > 0 && (
              <div className="mt-7">
                <p className="label-caps text-[0.62rem] text-plum-800">
                  Shade: <span className="text-gold-600">{shade}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {shades.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setShade(s.name)}
                      aria-label={s.name}
                      title={`${s.code} ${s.name}`}
                      className={cn(
                        "size-9 rounded-full transition-all",
                        shade === s.name
                          ? "ring-2 ring-gold-600 ring-offset-2 ring-offset-cream-50"
                          : "ring-1 ring-gold-200 hover:ring-gold-400",
                      )}
                      style={{ backgroundColor: s.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border border-gold-300/70">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid size-10 place-items-center text-plum-800 hover:text-gold-600"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-9 text-center text-sm text-plum-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="grid size-10 place-items-center text-plum-800 hover:text-gold-600"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Button onClick={handleAdd} size="lg" className="flex-1 sm:flex-none">
                {added ? (
                  <>
                    <Check className="size-3.5" /> Added
                  </>
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button href="/checkout" variant="gold" size="lg" className="flex-1 sm:flex-none">
                Buy Now
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-6 text-[0.75rem]">
              <button
                onClick={() => toggleWish(product.slug)}
                className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-plum-800"
              >
                <Heart className="size-4" fill={wished ? "currentColor" : "none"} />
                {wished ? "In Wishlist" : "Add to Wishlist"}
              </button>
              <button className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-plum-800">
                <Share2 className="size-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="border-y border-gold-200/60 bg-cream-100">
        <div className="container-vel py-12">
          <div className="no-scrollbar -mx-4 flex gap-8 overflow-x-auto border-b border-gold-200/70 px-4">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "label-caps relative shrink-0 pb-3 text-[0.66rem] transition-colors",
                  tab === t ? "text-plum-800" : "text-ink-soft hover:text-plum-800",
                )}
              >
                {t}
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-600" />}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === "Why You'll Love It" && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {(product.benefits ?? []).map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-600" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {tab === "Ingredients" && (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INGREDIENTS.map((ing) => (
                  <li
                    key={ing.name}
                    className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-50 p-4"
                  >
                    <p className="text-sm font-medium text-plum-800">{ing.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">{ing.benefit}</p>
                  </li>
                ))}
              </ul>
            )}

            {tab === "How to Use" && (
              <ol className="space-y-3">
                {HOW_TO_USE.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-ink-soft">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-plum-800 text-[0.65rem] text-gold-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}

            {tab === "Shipping & Returns" && (
              <ul className="space-y-3">
                {SHIPPING_NOTES.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-gold-600" />
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* All shades */}
      {shades.length > 0 && (
        <section className="container-vel py-14">
          <div className="mb-7 text-center">
            <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">ALL SHADES</h2>
            <p className="mt-1 text-xs text-ink-soft">Find your perfect shade</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shades.map((s) => (
              <li key={s.name}>
                <button
                  onClick={() => setShade(s.name)}
                  className={cn(
                    "block w-full overflow-hidden rounded-[var(--radius-card)] border transition-colors",
                    shade === s.name ? "border-gold-600" : "border-gold-200/70 hover:border-gold-400",
                  )}
                >
                  <span
                    className="block aspect-4/3 w-full"
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="block bg-cream-100 py-2.5 text-center text-[0.65rem] text-plum-800">
                    {s.code} {s.name.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ingredients that care */}
      <section className="bg-cream-100 py-14">
        <div className="container-vel">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
              INGREDIENTS THAT CARE
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Thoughtfully selected. Scientifically crafted.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {INGREDIENTS.map((ing) => (
              <li
                key={ing.name}
                className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-50 p-5 text-center"
              >
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-blush-100">
                  <Leaf className="size-5 text-gold-600" />
                </span>
                <p className="mt-3 text-sm font-medium text-plum-800">{ing.name}</p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-ink-soft">{ing.benefit}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-vel py-14">
        <h2 className="mb-8 text-center font-display text-2xl tracking-[0.05em] text-plum-800">
          CUSTOMER REVIEWS
        </h2>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 text-center">
            <p className="font-display text-[3rem] font-semibold leading-none text-plum-800">
              {RATING_SUMMARY.average}
            </p>
            <StarRating value={RATING_SUMMARY.average} size={16} className="mt-2 w-full justify-center" />
            <p className="mt-1.5 text-[0.68rem] text-ink-soft">
              Based on {product.reviewCount?.toLocaleString("en-IN")} reviews
            </p>
            <ul className="mt-5 space-y-1.5">
              {RATING_SUMMARY.breakdown.map((b) => (
                <li key={b.stars} className="flex items-center gap-2 text-[0.65rem] text-ink-soft">
                  <span className="w-2 text-right">{b.stars}</span>
                  <span className="text-gold-500">★</span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-cream-300">
                    <span className="block h-full rounded-full bg-gold-500" style={{ width: `${b.pct}%` }} />
                  </span>
                  <span className="w-7 text-right">{b.pct}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-4"
              >
                <div className="flex items-center gap-2.5">
                  <Image src={t.avatar} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
                  <div>
                    <figcaption className="text-[0.75rem] font-medium text-plum-800">{t.name}</figcaption>
                    <p className="text-[0.6rem] text-success">Verified Buyer</p>
                  </div>
                </div>
                <StarRating value={t.rating} size={11} className="mt-2.5" />
                <blockquote className="mt-2 text-[0.73rem] leading-relaxed text-ink-soft">
                  {t.quote}
                </blockquote>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button href="/reviews" variant="outline">
            View All Reviews <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </section>

      {/* Frequently bought together */}
      <section className="bg-cream-100 py-14">
        <div className="container-vel">
          <h2 className="mb-8 text-center font-display text-2xl tracking-[0.05em] text-plum-800">
            FREQUENTLY BOUGHT TOGETHER
          </h2>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <ul className="flex flex-wrap items-center justify-center gap-4">
              {bundleItems.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-4">
                  <div className="flex w-36 flex-col items-center text-center">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-50">
                      <Image src={p.image} alt={p.name} fill sizes="144px" className="object-contain p-2" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[0.7rem] text-ink">{p.name}</p>
                    <p className="text-[0.75rem] font-medium text-plum-800">{inr(p.price)}</p>
                  </div>
                  {i < bundleItems.length - 1 && (
                    <Plus className="size-4 shrink-0 text-gold-600" />
                  )}
                </li>
              ))}
            </ul>

            <div className="rounded-[var(--radius-card)] border border-gold-300/60 bg-blush-100 p-6 text-center">
              <p className="label-caps text-[0.62rem] text-plum-800">Buy All 3 &amp; Save 15%</p>
              <p className="mt-3">
                <span className="text-sm text-ink-soft line-through">{inr(bundleFull)}</span>{" "}
                <span className="font-display text-2xl font-semibold text-plum-800">
                  {inr(bundlePrice)}
                </span>
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => bundleItems.forEach((p) => add(p.slug, 1, p.shades?.[0]?.name))}
              >
                Add Bundle to Cart
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* You may also love */}
      <section className="container-vel py-14">
        <h2 className="mb-8 text-center font-display text-2xl tracking-[0.05em] text-plum-800">
          YOU MAY ALSO LOVE
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Sticky buy bar */}
      <div className="sticky bottom-0 z-40 border-t border-gold-500/25 bg-plum-800/97 backdrop-blur lg:hidden">
        <div className="container-vel flex items-center gap-3 py-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-cream-100">
            <Image src={product.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.7rem] text-cream-100">{product.name}</p>
            <p className="text-[0.75rem] font-medium text-gold-300">{inr(product.price)}</p>
          </div>
          <Button onClick={handleAdd} variant="gold" size="sm">
            {added ? "Added" : "Add"}
          </Button>
          <Button href="/checkout" size="sm" className="bg-cream-50 text-plum-800 hover:bg-cream-200">
            Buy Now
          </Button>
        </div>
      </div>
    </>
  );
}
