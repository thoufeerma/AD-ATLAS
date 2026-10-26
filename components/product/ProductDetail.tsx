"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  PenLine,
} from "lucide-react";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/ui/ProductCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import Lightbox from "@/components/reviews/Lightbox";
import RatingBars from "@/components/ui/RatingBars";
import { useSettings } from "@/components/providers/SettingsProvider";
import { MAX_QTY, useStore, useHydrated } from "@/lib/store";
import { inrPaise, cn, productImage } from "@/lib/utils";
import type { Product, ProductDetail as Detail } from "@/lib/api/types";
import { INGREDIENTS } from "@/lib/content";
import { getProductSaleBadge, getDiscountPercentage } from "@/lib/campaign";

/*
 * The reference design is a lipstick page. Its feature claims, lip-care
 * ingredients and how-to steps are true of lipsticks only, so they appear on
 * lip products only — a face serum shouldn't claim to be "smudge proof".
 */
const LIPSTICK_FEATURES = [
  { Icon: Clock, label: "Long Lasting", note: "Up to 12 Hours" },
  { Icon: ShieldCheck, label: "Smudge Proof", note: "Transfer Resistant" },
  { Icon: Droplets, label: "Rich Pigment", note: "One Swipe Color" },
  { Icon: Leaf, label: "Infused with Vitamin E", note: "Nourishing" },
  { Icon: Sparkles, label: "Dermatologically Tested", note: "Safe for All Skin Types" },
];

const LIP_HOW_TO_USE = [
  "Start with clean, exfoliated lips for the smoothest finish.",
  "Line the lips first if you want a sharper edge — the Velastia Lip Liner in a matching tone works best.",
  "Apply from the centre outwards, then press your lips together once.",
  "Build a second layer only where you want deeper colour.",
];

const LIP_CATEGORIES = ["lipstick", "lip-care"];

/** The pairing the reference design suggests, in its order. */
const PAIRS_WITH = ["lip-liner", "velvet-matte-liquid-lipstick", "makeup-fixer"];

type Tab = "Why You'll Love It" | "Ingredients" | "How to Use" | "Shipping & Returns";

export default function ProductDetail({
  product,
  catalog,
}: {
  product: Detail;
  catalog: Product[];
}) {
  const router = useRouter();
  const { shipping } = useSettings();

  const isLip = LIP_CATEGORIES.includes(product.category.slug);
  const isLipstick = product.category.slug === "lipstick";
  const tabs: Tab[] = [
    ...(product.benefits.length ? (["Why You'll Love It"] as const) : []),
    ...(isLip ? (["Ingredients", "How to Use"] as const) : []),
    "Shipping & Returns",
  ];

  const shades = product.shades;
  const images = product.images.length ? product.images : [{ url: productImage(product), alt: null }];
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = images[imageIndex]?.url ?? images[0].url;
  const [shade, setShade] = useState(shades[0]?.name);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [added, setAdded] = useState(false);
  const [writing, setWriting] = useState(false);

  const saleBadge = getProductSaleBadge(product);
  const discountPct = getDiscountPercentage(product.pricePaise, product.compareAtPaise);

  // Amazon-style Image Zoom state
  const ZOOM_LEVEL = 2.5;
  const [isZoomHovered, setIsZoomHovered] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, xPercent: 50, yPercent: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  function handleImageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = zoomContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const lensW = rect.width / ZOOM_LEVEL;
    const lensH = rect.height / ZOOM_LEVEL;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rawX = mouseX - lensW / 2;
    const rawY = mouseY - lensH / 2;
    const maxX = rect.width - lensW;
    const maxY = rect.height - lensH;

    const clampedX = Math.max(0, Math.min(rawX, maxX));
    const clampedY = Math.max(0, Math.min(rawY, maxY));

    const xPercent = maxX > 0 ? (clampedX / maxX) * 100 : 50;
    const yPercent = maxY > 0 ? (clampedY / maxY) * 100 : 50;

    setLensPos({
      x: clampedX,
      y: clampedY,
      xPercent,
      yPercent,
    });
  }

  const hydrated = useHydrated();
  const add = useStore((s) => s.add);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const wished = hydrated && wishlist.includes(product.slug);

  const comingSoon = product.status === "COMING_SOON";
  const buyable = !comingSoon && product.inStock;
  const purchasable = (p: Product) => p.status === "ACTIVE" && p.inStock;

  // "Frequently bought together": the design's pairing, from whatever of it is
  // on sale right now. Priced at the plain sum — no bundle discount exists at
  // checkout, so none is advertised.
  const bundleItems = buyable
    ? [
        product,
        ...PAIRS_WITH.filter((s) => s !== product.slug)
          .map((s) => catalog.find((p) => p.slug === s))
          .filter((p): p is Product => !!p && purchasable(p)),
      ].slice(0, 3)
    : [];

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => bundleItems.map((p) => p.slug));
  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    setSelectedSlugs(bundleItems.map((p) => p.slug));
  }, [product.slug]);

  const activeSlugs = selectedSlugs.length > 0 ? selectedSlugs : bundleItems.map((p) => p.slug);
  const selectedBundleItems = bundleItems.filter((p) => activeSlugs.includes(p.slug));
  const selectedTotal = selectedBundleItems.reduce((n, p) => n + p.pricePaise, 0);
  const compareTotal = selectedBundleItems.reduce(
    (n, p) => n + (p.compareAtPaise && p.compareAtPaise > p.pricePaise ? p.compareAtPaise : p.pricePaise),
    0,
  );
  const savedPaise = compareTotal - selectedTotal;

  function toggleBundleItem(slug: string) {
    setSelectedSlugs((prev) => {
      const current = prev.length > 0 ? prev : bundleItems.map((p) => p.slug);
      if (current.includes(slug)) {
        return current.filter((s) => s !== slug);
      }
      return [...current, slug];
    });
  }

  function handleBundleAdd() {
    selectedBundleItems.forEach((p) => {
      add(p.slug, 1, p.slug === product.slug ? shade : p.shades[0]?.name, {
        name: p.name,
        pricePaise: p.pricePaise,
        image: productImage(p),
      });
    });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  }

  // Same category first, then the rest of what's on sale.
  const related = catalog
    .filter((p) => p.slug !== product.slug && purchasable(p))
    .sort(
      (a, b) =>
        Number(b.category.slug === product.category.slug) -
        Number(a.category.slug === product.category.slug),
    )
    .slice(0, 16);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function checkScroll() {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }

  function scrollCarousel(dir: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  }

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [related.length]);

  const shippingNotes = [
    shipping?.freeAbovePaise != null
      ? `Free shipping on all orders above ${inrPaise(shipping.freeAbovePaise)}.`
      : null,
    shipping ? `${shipping.name}: ${shipping.eta}. Faster options may be offered at checkout.` : null,
    "Easy returns within 7 days of delivery on unopened products.",
    "Refunds reach the original payment method in 5–7 business days.",
  ].filter((n): n is string => !!n);

  function handleAdd() {
    add(product.slug, qty, shade, {
      name: product.name,
      pricePaise: product.pricePaise,
      image: productImage(product),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function buyNow() {
    add(product.slug, qty, shade);
    router.push("/checkout");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      // Dismissing the share sheet rejects; nothing to do.
    }
  }

  const { reviewSummary, reviews } = product;

  return (
    <>
      <div className="container-vel py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20 items-start">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative flex gap-4">
              {images.length > 1 && (
                <div className="hidden w-[68px] xl:w-[80px] shrink-0 flex-col gap-3 sm:flex">
                  {images.map((img, i) => (
                    <button
                      key={img.url + i}
                      type="button"
                      onClick={() => setImageIndex(i)}
                      onMouseEnter={() => setImageIndex(i)}
                      onFocus={() => setImageIndex(i)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border bg-cream-100 transition-all cursor-pointer",
                        i === imageIndex
                          ? "border-gold-500 ring-2 ring-gold-500/50 shadow-sm scale-[1.02]"
                          : "border-gold-200/70 hover:border-gold-400 hover:ring-1 hover:ring-gold-300",
                      )}
                      aria-label={`View image ${i + 1}`}
                      aria-pressed={i === imageIndex}
                    >
                      <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Interactive Image Container */}
              <div
                ref={zoomContainerRef}
                onMouseEnter={() => setIsZoomHovered(true)}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={() => setIsZoomHovered(false)}
                onClick={() => setLightboxOpen(true)}
                className="group relative flex-1 cursor-crosshair overflow-hidden rounded-[var(--radius-card)] border border-gold-200/60 bg-cream-100 select-none shadow-sm transition-all"
              >
                <div className="relative aspect-square">
                  <Image
                    src={currentImage}
                    alt={images[imageIndex]?.alt ?? product.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="object-contain p-6 transition-all duration-200"
                  />
                </div>

                {/* Amazon-style Hover Lens */}
                {isZoomHovered && (
                  <div
                    className="pointer-events-none absolute hidden lg:block border-2 border-gold-500/90 bg-gold-400/20 shadow-[0_0_12px_rgba(212,175,55,0.25)] z-20 backdrop-brightness-105"
                    style={{
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`,
                      width: `${100 / ZOOM_LEVEL}%`,
                      height: `${100 / ZOOM_LEVEL}%`,
                    }}
                  />
                )}

                {/* Zoom hint badge */}
                <span className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-cream-50/90 px-3 py-1.5 text-[0.65rem] font-medium text-plum-800 shadow-sm backdrop-blur transition-opacity group-hover:opacity-75">
                  <ZoomIn className="size-3.5" /> Hover to zoom · Click to expand
                </span>
              </div>

              {/* Amazon-style Zoomed Preview Pane (floats over the buy panel on hover) */}
              {isZoomHovered && (
                <div
                  className="pointer-events-none absolute left-[calc(100%+16px)] xl:left-[calc(100%+24px)] top-0 z-50 hidden lg:block w-full aspect-square overflow-hidden rounded-[var(--radius-card)] border border-gold-300/80 bg-cream-50 shadow-[0_20px_45px_rgba(32,8,45,0.22)]"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${lensPos.xPercent}% ${lensPos.yPercent}%`,
                    backgroundSize: `${ZOOM_LEVEL * 100}%`,
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* 2.5x Zoom badge */}
                  <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-plum-800/90 px-3 py-1 text-[0.65rem] font-bold text-gold-300 shadow-md backdrop-blur">
                    <ZoomIn className="size-3 text-gold-400" />
                    <span>2.5x Detail View</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex sm:hidden gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                {images.map((img, i) => (
                  <button
                    key={img.url + i}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={cn(
                      "relative size-14 shrink-0 overflow-hidden rounded-md border bg-cream-100 transition-all",
                      i === imageIndex
                        ? "border-gold-500 ring-2 ring-gold-500/50"
                        : "border-gold-200/70",
                    )}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === imageIndex}
                  >
                    <Image src={img.url} alt="" fill sizes="56px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy panel */}
          <div>
            {product.isBestseller && (
              <span className="label-caps inline-block rounded-full bg-gold-600 px-3 py-1 text-[0.55rem] text-white">
                Best Seller
              </span>
            )}

            <h1 className="mt-3 font-sans font-medium text-[2rem] leading-tight text-plum-800 sm:text-[2.3rem]">
              {product.name}
            </h1>
            {shade && <p className="mt-1 font-heading text-xl font-bold text-gold-600">{shade}</p>}

            {product.rating.count > 0 && (
              <a
                href="#reviews"
                className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-ink-soft hover:text-plum-800"
              >
                <StarRating value={product.rating.average} size={15} />
                <span className="font-medium text-plum-800">{product.rating.average.toFixed(1)}</span>
                <span>
                  ({product.rating.count.toLocaleString("en-IN")}{" "}
                  {product.rating.count === 1 ? "review" : "reviews"})
                </span>
              </a>
            )}

            {/* Amazon-style Sale Badge & Pricing */}
            <div className="mt-4 flex flex-col gap-1.5">
              {saleBadge && (
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#cc0c39] px-2.5 py-1 text-[0.75rem] font-bold tracking-wide text-white shadow-sm">
                    <Sparkles className="size-3 text-amber-200" />
                    {saleBadge}
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                {discountPct > 0 && (
                  <span className="font-sans text-[1.75rem] font-light text-[#cc0c39]">
                    -{discountPct}%
                  </span>
                )}
                <span className="font-heading text-[2.2rem] font-bold leading-none text-plum-800">
                  {inrPaise(product.pricePaise)}
                </span>
              </div>

              {product.compareAtPaise != null && product.compareAtPaise > product.pricePaise && (
                <p className="text-[0.8rem] text-ink-soft">
                  M.R.P.:{" "}
                  <span className="line-through">{inrPaise(product.compareAtPaise)}</span>
                </p>
              )}
              <p className="text-[0.72rem] text-ink-soft">Inclusive of all taxes</p>
            </div>

            {product.blurb && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.blurb}</p>
            )}

            {isLipstick && (
              <ul className="mt-6 space-y-2.5">
                {LIPSTICK_FEATURES.map(({ Icon, label, note }) => (
                  <li key={label} className="flex items-center gap-2.5 text-[0.78rem]">
                    <Icon className="size-4 shrink-0 text-gold-600" />
                    <span className="text-plum-800">{label}</span>
                    <span className="text-gold-300">|</span>
                    <span className="text-ink-soft">{note}</span>
                  </li>
                ))}
              </ul>
            )}

            {shades.length > 0 && (
              <div className="mt-7">
                <p className="label-caps text-[0.62rem] text-plum-800">
                  Shade: <span className="text-gold-600">{shade}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {shades.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => setShade(s.name)}
                      aria-label={s.name}
                      aria-pressed={shade === s.name}
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

            {/* Availability */}
            <p
              className={cn(
                "mt-6 flex items-center gap-1.5 text-[0.75rem]",
                buyable ? "text-success" : "text-ink-soft",
              )}
            >
              <span className={cn("size-1.5 rounded-full", buyable ? "bg-success" : "bg-gold-500")} />
              {comingSoon
                ? "Coming soon"
                : !product.inStock
                  ? "Out of stock"
                  : product.lowStock
                    ? "In stock — only a few left"
                    : "In stock"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border border-gold-300/70">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={!buyable}
                  aria-label="Decrease quantity"
                  className="grid size-10 place-items-center text-plum-800 hover:text-gold-600 disabled:opacity-40"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-9 text-center text-sm text-plum-800">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                  disabled={!buyable}
                  aria-label="Increase quantity"
                  className="grid size-10 place-items-center text-plum-800 hover:text-gold-600 disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Button onClick={handleAdd} disabled={!buyable} size="lg" className="flex-1 sm:flex-none">
                {added ? (
                  <>
                    <Check className="size-3.5" /> Added
                  </>
                ) : comingSoon ? (
                  "Coming Soon"
                ) : !product.inStock ? (
                  "Out of Stock"
                ) : (
                  "Add to Cart"
                )}
              </Button>
              {buyable && (
                <Button onClick={buyNow} variant="gold" size="lg" className="flex-1 sm:flex-none">
                  Buy Now
                </Button>
              )}
            </div>

            <div className="mt-5 flex items-center gap-6 text-[0.75rem]">
              <button
                onClick={() => toggleWish(product.slug)}
                className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-plum-800"
              >
                <Heart className="size-4" fill={wished ? "currentColor" : "none"} />
                {wished ? "In Wishlist" : "Add to Wishlist"}
              </button>
              <button
                onClick={share}
                className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-plum-800"
              >
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
            {tabs.map((t) => (
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
                {product.benefits.map((b) => (
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
                {LIP_HOW_TO_USE.map((step, i) => (
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
                {shippingNotes.map((n) => (
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
            <h2 className="font-heading font-bold text-2xl tracking-[0.05em] text-plum-800">ALL SHADES</h2>
            <p className="mt-1 text-xs text-ink-soft">Find your perfect shade</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {shades.map((s) => (
              <li key={s.code}>
                <button
                  onClick={() => setShade(s.name)}
                  aria-pressed={shade === s.name}
                  className={cn(
                    "block w-full overflow-hidden rounded-[var(--radius-card)] border transition-colors",
                    shade === s.name ? "border-gold-600" : "border-gold-200/70 hover:border-gold-400",
                  )}
                >
                  <span className="block aspect-4/3 w-full" style={{ backgroundColor: s.hex }} />
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
      {isLip && (
        <section className="bg-cream-100 py-14">
          <div className="container-vel">
            <div className="mb-8 text-center">
              <h2 className="font-heading font-bold text-2xl tracking-[0.05em] text-plum-800">
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
                  className="rounded-[var(--radius-card)] border border-gold-300/40 bg-[#fffdf9] p-5 text-center shadow-[0_4px_14px_rgba(32,8,45,0.07)] transition-all duration-300 hover:shadow-[0_10px_22px_rgba(32,8,45,0.14)] hover:-translate-y-1"
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
      )}

      {/* Reviews */}
      <section id="reviews" className="container-vel scroll-mt-28 py-14">
        <h2 className="mb-8 text-center font-heading font-bold text-2xl tracking-[0.05em] text-plum-800">
          CUSTOMER REVIEWS
        </h2>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-[var(--radius-card)] border border-gold-300/50 bg-[#fffdf9] p-6 text-center shadow-[0_6px_20px_rgba(32,8,45,0.08),0_2px_6px_rgba(32,8,45,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(32,8,45,0.14),0_4px_12px_rgba(193,136,62,0.12)]">
            {reviewSummary.total > 0 ? (
              <>
                <p className="font-heading text-[3rem] font-bold leading-none text-plum-800">
                  {reviewSummary.average.toFixed(1)}
                </p>
                <StarRating value={reviewSummary.average} size={16} className="mt-2 w-full justify-center" />
                <p className="mt-1.5 text-[0.68rem] text-ink-soft">
                  Based on {reviewSummary.total.toLocaleString("en-IN")}{" "}
                  {reviewSummary.total === 1 ? "review" : "reviews"}
                </p>
                <RatingBars rating={reviewSummary} />
              </>
            ) : (
              <p className="py-4 text-sm leading-relaxed text-ink-soft">
                No reviews yet. Tried it? Be the first to share your thoughts.
              </p>
            )}
            {!comingSoon && (
              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-full"
                onClick={() => setWriting((w) => !w)}
                aria-expanded={writing}
              >
                <PenLine className="size-3.5" /> Write a Review
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {writing && (
              <div className="rounded-[var(--radius-card)] border border-gold-300/50 bg-[#fffdf9] p-5 sm:p-6 shadow-[0_6px_20px_rgba(32,8,45,0.08)]">
                <ReviewForm productSlug={product.slug} />
              </div>
            )}

            {reviews.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {reviews.map((r) => (
                  <figure
                    key={r.id}
                    className="flex flex-col rounded-[var(--radius-card)] border border-gold-300/40 bg-[#fffdf9] p-4 shadow-[0_4px_16px_rgba(32,8,45,0.08),0_1.5px_4px_rgba(32,8,45,0.04)] transition-all duration-300 hover:shadow-[0_10px_24px_rgba(32,8,45,0.14),0_3px_8px_rgba(193,136,62,0.1)] hover:-translate-y-1"
                  >
                    <figcaption className="text-[0.75rem] font-medium text-plum-800">
                      {r.authorName}
                    </figcaption>
                    {r.isVerified && <p className="text-[0.6rem] text-success">Verified Buyer</p>}
                    <StarRating value={r.rating} size={11} className="mt-2.5" />
                    <blockquote className="mt-2 text-[0.73rem] leading-relaxed text-ink-soft">
                      {r.body}
                    </blockquote>
                    <p className="mt-auto pt-3 text-[0.62rem] text-ink-soft/80">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button href="/reviews" variant="outline">
            View All Reviews <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </section>

      {/* Frequently bought together */}
      {bundleItems.length > 1 && (
        <section className="bg-cream-100/70 border-y border-gold-200/60 py-10 lg:py-14">
          <div className="container-vel">
            <div className="mb-7 lg:mb-9 text-center">
              <h2 className="font-heading font-bold text-xl sm:text-2xl xl:text-[1.75rem] tracking-[0.04em] text-plum-800 uppercase">
                FREQUENTLY BOUGHT TOGETHER
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-medium text-ink-soft">
                Carefully paired for an effortless, complete beauty routine
              </p>
            </div>

            <div className="mx-auto flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-3 xl:gap-4 max-w-[1060px]">
              {/* Product cards row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
                {bundleItems.map((p, i) => {
                  const isSelected = activeSlugs.includes(p.slug);
                  const isCurrent = p.slug === product.slug;
                  const shadeItem = isCurrent
                    ? (product.shades.find((s) => s.name === shade) ?? p.shades?.[0])
                    : p.shades?.[0];
                  const shadeColor = shadeItem
                    ? shadeItem.hex
                    : p.descriptor && p.descriptor.toLowerCase().includes("nude")
                      ? "#b56c5a"
                      : null;
                  const shadeLabel = isCurrent
                    ? shade
                    : shadeItem
                      ? shadeItem.name
                      : p.descriptor ?? null;

                  return (
                    <div key={p.slug} className="flex flex-col sm:flex-row items-center">
                      {/* Product Card - matching standard product card dimensions */}
                      <article
                        className={cn(
                          "group relative flex flex-col w-[200px] sm:w-[185px] md:w-[200px] lg:w-[210px] xl:w-[215px] overflow-hidden rounded-[var(--radius-card)] bg-white border transition-all duration-300",
                          isSelected
                            ? "border-gold-300/40 shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.18)] hover:border-gold-400/80"
                            : "border-gold-200/40 opacity-50 bg-cream-50/50 shadow-none",
                        )}
                      >
                        {/* Status / 'This Item' Badge */}
                        {isCurrent ? (
                          <span className="label-caps pointer-events-none absolute left-0 top-2.5 z-10 bg-plum-800 px-2 py-0.5 text-[0.58rem] font-bold text-gold-300 shadow-sm">
                            This Item
                          </span>
                        ) : p.isBestseller ? (
                          <span className="label-caps pointer-events-none absolute left-0 top-2.5 z-10 bg-plum-800 px-2 py-0.5 text-[0.58rem] font-bold text-gold-300 shadow-sm">
                            Best Seller
                          </span>
                        ) : null}

                        {/* Checkbox toggle */}
                        <button
                          type="button"
                          onClick={() => toggleBundleItem(p.slug)}
                          aria-label={isSelected ? `Remove ${p.name} from bundle` : `Add ${p.name} to bundle`}
                          className={cn(
                            "absolute right-2.5 top-2.5 z-10 flex size-6 items-center justify-center rounded-full border transition-all shadow-sm cursor-pointer",
                            isSelected
                              ? "border-plum-800 bg-plum-800 text-cream-50"
                              : "border-gold-300 bg-white/95 text-transparent hover:border-plum-800",
                          )}
                        >
                          <Check className="size-3.5 stroke-[3]" />
                        </button>

                        {/* Image */}
                        <div className="relative aspect-square w-full overflow-hidden bg-cream-100/60 border-b border-black/[0.04]">
                          <Image
                            src={productImage(p)}
                            alt={p.name}
                            fill
                            sizes="(min-width: 1024px) 220px, 200px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col items-center px-3 pb-3.5 pt-2.5 text-center">
                          <Link
                            href={`/product/${p.slug}`}
                            className="h-[2.4rem] flex items-center justify-center font-sans text-[0.76rem] sm:text-[0.78rem] lg:text-[0.82rem] font-semibold leading-tight text-ink transition-colors hover:text-gold-600 line-clamp-2 text-center"
                          >
                            {p.name}
                          </Link>

                          {/* Shade indicator with fixed height for baseline alignment */}
                          <div className="h-5 flex items-center justify-center gap-1.5 text-[0.68rem] text-ink-soft">
                            {shadeLabel ? (
                              <>
                                {shadeColor && (
                                  <span
                                    className="size-2 rounded-full border border-black/15 shrink-0"
                                    style={{ backgroundColor: shadeColor }}
                                  />
                                )}
                                <span className="font-medium truncate max-w-[120px]">
                                  {shadeLabel}
                                </span>
                              </>
                            ) : null}
                          </div>

                          {/* Price */}
                          <p className="mt-auto pt-1 font-price text-[0.88rem] sm:text-[0.92rem] lg:text-[0.96rem] font-bold text-plum-800">
                            {inrPaise(p.pricePaise)}
                            {p.compareAtPaise && p.compareAtPaise > p.pricePaise && (
                              <span className="ml-1 text-[0.68rem] font-normal text-ink-soft line-through">
                                {inrPaise(p.compareAtPaise)}
                              </span>
                            )}
                          </p>
                        </div>
                      </article>

                      {/* Plus icon connector */}
                      {i < bundleItems.length - 1 && (
                        <div className="my-2 sm:my-0 sm:mx-2 xl:mx-2.5 flex items-center justify-center shrink-0">
                          <span className="grid size-7 sm:size-8 place-items-center rounded-full bg-white border border-gold-300 shadow-sm text-gold-600 font-bold">
                            <Plus className="size-3.5 sm:size-4" strokeWidth={2.5} />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Equals connector on desktop */}
              <div className="hidden lg:flex items-center justify-center shrink-0 mx-1">
                <span className="grid size-7 sm:size-8 place-items-center rounded-full bg-white border border-gold-300 shadow-sm text-gold-600 font-bold text-sm">
                  =
                </span>
              </div>

              {/* Bundle summary box */}
              <div className="w-full sm:w-[320px] lg:w-[250px] xl:w-[270px] shrink-0 rounded-[var(--radius-card)] border border-gold-300/70 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE1] p-5 sm:p-5.5 flex flex-col justify-between text-center shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(32,8,45,0.18),0_4px_10px_rgba(193,136,62,0.15)]">
                <div>
                  <span className="label-caps inline-block rounded-full bg-gold-500/15 border border-gold-400/40 px-3 py-0.5 text-[0.62rem] font-bold tracking-wider text-gold-800">
                    CURATED BUNDLE
                  </span>
                  <h3 className="mt-2 font-heading text-[0.92rem] font-bold uppercase tracking-wider text-plum-900">
                    Buy {selectedBundleItems.length} Together
                  </h3>
                  <p className="mt-0.5 text-[0.7rem] text-ink-soft">
                    {selectedBundleItems.length === bundleItems.length
                      ? "Complete signature routine"
                      : `${selectedBundleItems.length} of ${bundleItems.length} items selected`}
                  </p>

                  <div className="my-3 py-2.5 border-y border-gold-200/60 flex flex-col items-center">
                    <span className="text-[0.64rem] uppercase font-bold tracking-wider text-ink-soft">
                      Bundle Total
                    </span>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-price text-xl sm:text-2xl font-bold text-plum-900 leading-none">
                        {inrPaise(selectedTotal)}
                      </span>
                      {compareTotal > selectedTotal && (
                        <span className="font-price text-xs text-ink-soft line-through">
                          {inrPaise(compareTotal)}
                        </span>
                      )}
                    </div>
                    {savedPaise > 0 && (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-800 border border-emerald-200/60">
                        You Save {inrPaise(savedPaise)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    className="w-full py-2.5 min-h-[42px] text-[0.72rem] uppercase tracking-wider font-bold rounded-md shadow-sm transition-all active:scale-[0.99]"
                    disabled={selectedBundleItems.length === 0}
                    onClick={handleBundleAdd}
                  >
                    {bundleAdded ? "Added to Cart ✓" : `Add All ${selectedBundleItems.length} to Cart`}
                  </Button>

                  <ul className="mt-3 space-y-1.5 border-t border-gold-200/50 pt-2.5 text-left text-[0.68rem] text-ink-soft">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 shrink-0 text-gold-600" />
                      <span>Complimentary luxury packaging</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 shrink-0 text-gold-600" />
                      <span>Free express shipping included</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* You may also love */}
      {related.length > 0 && (
        <section className="container-vel py-14">
          <div className="mb-8 text-center">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl tracking-[0.05em] text-plum-800 uppercase">
              YOU MAY ALSO LOVE
            </h2>
          </div>

          <div className="group/slider relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {/* Left navigation arrow */}
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className={cn(
                "absolute -left-2.5 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 grid size-10 lg:size-11 place-items-center rounded-full border border-gold-300/80 bg-white/95 text-plum-800 shadow-[0_4px_14px_rgba(32,8,45,0.12)] backdrop-blur transition-all duration-200 hover:bg-white hover:scale-105 hover:border-plum-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed",
              )}
            >
              <ChevronLeft className="size-5 lg:size-6" strokeWidth={2} />
            </button>

            {/* Slider track */}
            <div
              ref={carouselRef}
              onScroll={checkScroll}
              className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory"
            >
              {related.map((p) => (
                <div
                  key={p.slug}
                  className="w-[60%] sm:w-[38%] md:w-[28%] lg:w-[calc(20%-16px)] xl:w-[calc(20%-16px)] shrink-0 snap-start"
                >
                  <ProductCard product={p} className="h-full" />
                </div>
              ))}
            </div>

            {/* Right navigation arrow */}
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              aria-label="Next products"
              className={cn(
                "absolute -right-2.5 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 grid size-10 lg:size-11 place-items-center rounded-full border border-gold-300/80 bg-white/95 text-plum-800 shadow-[0_4px_14px_rgba(32,8,45,0.12)] backdrop-blur transition-all duration-200 hover:bg-white hover:scale-105 hover:border-plum-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed",
              )}
            >
              <ChevronRight className="size-5 lg:size-6" strokeWidth={2} />
            </button>
          </div>
        </section>
      )}

      {/* Sticky buy bar */}
      {buyable && (
        <div className="sticky bottom-0 z-40 border-t border-gold-500/25 bg-plum-800/97 backdrop-blur lg:hidden">
          <div className="container-vel flex items-center gap-3 py-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-cream-100">
              <Image src={images[0].url} alt="" fill sizes="40px" className="object-contain p-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans truncate text-[0.7rem] text-cream-100">{product.name}</p>
              <p className="text-[0.75rem] font-medium text-gold-300">{inrPaise(product.pricePaise)}</p>
            </div>
            <Button onClick={handleAdd} variant="gold" size="sm">
              {added ? "Added" : "Add"}
            </Button>
            <Button onClick={buyNow} size="sm" className="bg-cream-50 text-plum-800 hover:bg-cream-200">
              Buy Now
            </Button>
          </div>
        </div>
      )}

      {/* Full-screen image lightbox dialog */}
      <Lightbox
        item={lightboxOpen ? { src: currentImage, kind: "image", caption: product.name } : null}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
