"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  SlidersHorizontal,
  ShieldCheck,
  Leaf,
  FlaskConical,
  Heart,
  MapPin,
  Sparkles,
  LayoutGrid,
  Wand2,
  Droplet,
  Smile,
  Brush,
  SprayCan,
  Copy,
  Check as CheckIcon,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { Category, Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

const CLAIMS = [
  { Icon: ShieldCheck, label: "Dermatologically Tested" },
  { Icon: Heart, label: "Cruelty-Free & Vegan" },
  { Icon: FlaskConical, label: "Science Backed" },
  { Icon: MapPin, label: "Made In India" },
  { Icon: Leaf, label: "Premium Ingredients" },
  { Icon: Sparkles, label: "Safe & Effective" },
];

type Status = Product["status"];

/** Rows of products on one page of results. */
const ROWS_PER_PAGE = 5;

/** Deterministic pseudo-random generator seeded by string for stable UI layouts */
function pseudoRandom(seedStr: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return function next() {
    h = Math.imul(h ^ (h >>> 15), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 15), 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Products per row at the current width, matching the grid below (2, sm:3, xl:4). */
function useColumns() {
  return useSyncExternalStore(
    (onChange) => {
      const queries = [matchMedia("(min-width: 40rem)"), matchMedia("(min-width: 80rem)")];
      queries.forEach((q) => q.addEventListener("change", onChange));
      return () => queries.forEach((q) => q.removeEventListener("change", onChange));
    },
    () => (matchMedia("(min-width: 80rem)").matches ? 4 : matchMedia("(min-width: 40rem)").matches ? 3 : 2),
    // The server can't know the width; the widest layout until the browser says.
    () => 4,
  );
}

/** Presets the footer links to: /shop?filter=bestsellers, /shop?filter=coming-soon */
export type ShopFilter = "bestsellers" | "coming-soon";

/** Chip icons, one per category as drawn on the shop page. */
const CHIP_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  lipstick: Wand2,
  "lip-care": Droplet,
  face: Smile,
  skincare: Sparkles,
  accessories: Brush,
  perfume: SprayCan,
};

export interface ShopAd {
  id: string;
  theme: "event" | "glow" | "luxury";
  badge?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  categoryFilter?: string[];
}

const SHOP_ADS: ShopAd[] = [
  {
    id: "beauty-event",
    theme: "event",
    badge: "LIMITED TIME",
    eyebrow: "THE BEAUTY EVENT",
    title: "UP TO 40% OFF",
    subtitle: "Selected skincare essentials & luxury elixirs",
    cta: "Shop The Sale",
    href: "/shop?category=skincare",
    image: "/images/shop-ad-event.jpg",
    categoryFilter: ["all", "skincare", "offers"],
  },
  {
    id: "skincare-glow",
    theme: "glow",
    badge: "DAILY RITUAL",
    eyebrow: "AYURVEDIC SCIENCE",
    title: "GLOW STARTS HERE",
    subtitle: "Pure botanical potency crafted for radiant Indian skin.",
    cta: "Explore Ritual",
    href: "/shop?category=skincare",
    image: "/images/Blush Pink Cosmos Still Life.png",
    categoryFilter: ["all", "skincare"],
  },
  {
    id: "buy2-get10",
    theme: "luxury",
    badge: "EXCLUSIVE OFFER",
    eyebrow: "A LITTLE MORE LUXURY",
    title: "BUY 2, GET 10% OFF",
    subtitle: "Curate your signature shades across our velvet matte collection.",
    cta: "Claim Offer",
    href: "/shop?category=lipstick",
    image: "/products/velvet-matte-hero.jpg",
    categoryFilter: ["all", "lipstick", "lip-care"],
  },
];

export default function ShopBrowser({
  products,
  categories,
  promo,
  initialCategory,
  initialFilter,
}: {
  products: Product[];
  categories: Category[];
  /** Headline of the admin's "shop.sidebar" banner; the card hides without one. */
  promo: string | null;
  initialCategory?: string;
  initialFilter?: ShopFilter;
}) {
  const { welcomeOffer } = useSettings();

  // The slider tops out at the priciest product, rounded up to the next ₹100,
  // so a newly added premium product is never filtered out by default.
  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(0, ...products.map((p) => p.pricePaise)) / 10_000) * 100,
    [products],
  );

  const [category, setCategory] = useState(
    initialCategory && categories.some((c) => c.slug === initialCategory) ? initialCategory : "all",
  );
  const [checked, setChecked] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // null = no limit
  const [types, setTypes] = useState<Status[]>(initialFilter === "coming-soon" ? ["COMING_SOON"] : []);
  const [bestOnly, setBestOnly] = useState(initialFilter === "bestsellers");
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    let list =
      maxPrice == null ? products : products.filter((p) => p.pricePaise <= maxPrice * 100);

    if (category !== "all") list = list.filter((p) => p.category.slug === category);
    if (checked.length) list = list.filter((p) => checked.includes(p.category.slug));
    if (types.length) list = list.filter((p) => types.includes(p.status));
    if (bestOnly) list = list.filter((p) => p.isBestseller);

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.pricePaise - b.pricePaise);
      case "price-desc":
        return [...list].sort((a, b) => b.pricePaise - a.pricePaise);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        // The API already returns products in featured order: purchasable
        // first, then bestsellers, then newest.
        return list;
    }
  }, [products, category, checked, types, bestOnly, maxPrice, sort]);

  const toggle = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  // ── Pages of at most ROWS_PER_PAGE rows ──
  // The page belongs to one set of filters: change any of them (or the sort)
  // and it's back to page 1, with no effect needed to reset it.
  // Session seed initialized once on client mount to keep ad layout stable during interactions
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 1000000));

  const columns = useColumns();
  const perPage = ROWS_PER_PAGE * columns;
  const maxProdsPerPage = Math.max(1, perPage - 2); // 2 slots reserved for ads on a 5-row page

  // Relevant ads for the current category
  const relevantAds = useMemo(() => {
    if (category === "skincare") {
      return SHOP_ADS.filter((a) => a.categoryFilter?.includes("skincare"));
    }
    if (category === "lipstick" || category === "lip-care") {
      return SHOP_ADS.filter((a) => a.categoryFilter?.includes("lipstick"));
    }
    return SHOP_ADS;
  }, [category]);

  const filterKey = JSON.stringify([category, checked, types, bestOnly, maxPrice, sort]);
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(results.length / maxProdsPerPage));
  const page = paging.key === filterKey ? Math.min(paging.page, pageCount) : 1;

  type DisplayItem =
    | { kind: "product"; product: Product; key: string }
    | { kind: "ad"; ad: ShopAd; key: string };

  // Calculate the 5 rows with ads in only 2 random rows at random columns
  const displayItems = useMemo<DisplayItem[]>(() => {
    const startProdIdx = (page - 1) * maxProdsPerPage;
    const pageProducts = results.slice(startProdIdx, startProdIdx + maxProdsPerPage);

    if (pageProducts.length === 0) return [];

    // How many ads to show on this page: 2 if enough products (>=5), 1 if small collection (>=2), 0 if only 1
    const numAds = relevantAds.length === 0 || pageProducts.length < 2 ? 0 : pageProducts.length >= 5 ? 2 : 1;
    const totalCards = pageProducts.length + numAds;
    const numRows = Math.min(ROWS_PER_PAGE, Math.ceil(totalCards / columns));

    if (numAds === 0) {
      return pageProducts.map((p) => ({ kind: "product", product: p, key: p.slug }));
    }

    // Deterministic random generator for this page and filter view
    const rand = pseudoRandom(`${sessionSeed}-${page}-${filterKey}-${columns}`);

    // Choose candidate pairs of rows (prefer spacing between ads when 4+ rows)
    const candidatePairs: [number, number][] = [];
    const minRowSpacing = numRows >= 4 ? 2 : 1;
    for (let r1 = 0; r1 < numRows; r1++) {
      for (let r2 = r1 + 1; r2 < numRows; r2++) {
        if (r2 - r1 >= minRowSpacing) {
          candidatePairs.push([r1, r2]);
        }
      }
    }
    if (candidatePairs.length === 0 && numRows >= 2) {
      for (let r1 = 0; r1 < numRows; r1++) {
        for (let r2 = r1 + 1; r2 < numRows; r2++) {
          candidatePairs.push([r1, r2]);
        }
      }
    }

    const pair = candidatePairs.length > 0
      ? candidatePairs[Math.floor(rand() * candidatePairs.length)]
      : [0, Math.min(1, numRows - 1)];
    const [rowA, rowB] = pair;

    // Pick random columns within the chosen rows
    const maxColFor = (r: number) =>
      r === numRows - 1 && totalCards % columns !== 0 ? totalCards % columns : columns;

    const colA = Math.floor(rand() * Math.max(1, maxColFor(rowA)));
    const colB = Math.floor(rand() * Math.max(1, maxColFor(rowB)));

    // Pick 2 distinct ads from relevant ads
    const adIdxA = Math.floor(rand() * relevantAds.length);
    const adIdxB =
      relevantAds.length > 1
        ? (adIdxA + 1 + Math.floor(rand() * (relevantAds.length - 1))) % relevantAds.length
        : adIdxA;
    const adA = relevantAds[adIdxA];
    const adB = relevantAds[adIdxB];

    const items: DisplayItem[] = [];
    let pIdx = 0;

    for (let r = 0; r < numRows; r++) {
      const colsInThisRow = maxColFor(r);
      for (let c = 0; c < colsInThisRow; c++) {
        if (r === rowA && c === colA && numAds >= 1) {
          items.push({ kind: "ad", ad: adA, key: `ad-${adA.id}-${page}-${r}-${c}` });
        } else if (r === rowB && c === colB && numAds >= 2) {
          items.push({ kind: "ad", ad: adB, key: `ad-${adB.id}-${page}-${r}-${c}` });
        } else if (pIdx < pageProducts.length) {
          const p = pageProducts[pIdx++];
          items.push({ kind: "product", product: p, key: p.slug });
        }
      }
    }

    while (pIdx < pageProducts.length) {
      const p = pageProducts[pIdx++];
      items.push({ kind: "product", product: p, key: p.slug });
    }

    return items;
  }, [page, maxProdsPerPage, results, relevantAds, columns, sessionSeed, filterKey]);

  const startProdIdx = (page - 1) * maxProdsPerPage;
  const pageProductsCount = displayItems.filter((i) => i.kind === "product").length;
  const firstProductNumber = results.length > 0 ? startProdIdx + 1 : 0;
  const lastProductNumber = startProdIdx + pageProductsCount;

  // The two closing tiles fill empty cells on the last page — never an extra row.
  const spareCells = page === pageCount ? Math.max(0, perPage - displayItems.length) : 0;
  const resultsTop = useRef<HTMLDivElement>(null);

  function goToPage(n: number) {
    setPaging({ key: filterKey, page: n });
    resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="container-vel pt-6 pb-10">
      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mb-8 flex gap-6 overflow-x-auto px-4 sm:justify-center lg:gap-14">
        {[{ id: "all", label: "All" }, ...categories.map((c) => ({ id: c.slug, label: c.name }))].map((c) => {
          const active = category === c.id;
          const ChipIcon = CHIP_ICONS[c.id] ?? Sparkles;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="flex shrink-0 flex-col items-center gap-3"
            >
              <span
                className={cn(
                  "grid size-15 place-items-center rounded-full border transition-colors sm:size-18",
                  active
                    ? "border-plum-800 bg-plum-800 text-cream-50"
                    : "border-gold-300/70 bg-cream-100 text-gold-600 hover:border-gold-500",
                )}
              >
                <ChipIcon strokeWidth={1.25} className="size-6 sm:size-7" />
              </span>
              <span
                className={cn(
                  "text-[0.8rem] uppercase tracking-wide sm:text-[0.85rem]",
                  active ? "font-semibold text-plum-800" : "font-medium text-ink",
                )}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Filters */}
        <aside>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="mb-4 flex w-full items-center justify-between rounded-sm border border-gold-300/60 bg-[#fffdf9] px-4 py-3 shadow-[0_4px_12px_rgba(32,8,45,0.08)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(32,8,45,0.14)] hover:border-gold-400/70 lg:hidden"
          >
            <span className="font-heading text-[1.15rem] font-bold uppercase tracking-wide text-plum-800">Filters</span>
            <SlidersHorizontal className="size-4 text-gold-600" />
          </button>

          <div className={cn("space-y-7", filtersOpen ? "block" : "hidden lg:block")}>
            <div className="rounded-[var(--radius-card)] border border-gold-300/50 bg-[#fffdf9] p-5 shadow-[0_6px_20px_rgba(32,8,45,0.09),0_2px_6px_rgba(32,8,45,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(32,8,45,0.15),0_4px_12px_rgba(193,136,62,0.12)] hover:border-gold-400/70">
              <div className="mb-5 flex items-center justify-between border-b border-gold-200/70 pb-3">
                <h2 className="font-heading text-[1.3rem] font-bold uppercase tracking-wide text-plum-800">Filters</h2>
                <SlidersHorizontal className="size-5 text-gold-600" />
              </div>

              <FilterGroup title="Categories">
                {categories.map((c) => (
                  <Check
                    key={c.slug}
                    label={`${c.name} (${c.productCount})`}
                    checked={checked.includes(c.slug)}
                    onChange={() => setChecked((s) => toggle(s, c.slug))}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Price Range">
                <input
                  type="range"
                  min={0}
                  max={priceCeiling}
                  step={100}
                  value={maxPrice ?? priceCeiling}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxPrice(v >= priceCeiling ? null : v);
                  }}
                  className="w-full accent-gold-600"
                  aria-label="Maximum price"
                />
                <div className="mt-1 flex justify-between text-[0.8rem] text-ink-soft">
                  <span>₹0</span>
                  <span>₹{(maxPrice ?? priceCeiling).toLocaleString("en-IN")}</span>
                </div>
              </FilterGroup>

              <FilterGroup title="Product Type">
                <Check label="Best Sellers" checked={bestOnly} onChange={() => setBestOnly((b) => !b)} />
                <Check
                  label="Active Products"
                  checked={types.includes("ACTIVE")}
                  onChange={() => setTypes((s) => toggle(s, "ACTIVE"))}
                />
                <Check
                  label="Coming Soon"
                  checked={types.includes("COMING_SOON")}
                  onChange={() => setTypes((s) => toggle(s, "COMING_SOON"))}
                />
              </FilterGroup>

              {/* Ingredient claims are true of the whole range, so these are
                  shown as brand promises rather than working filters. */}
              <FilterGroup title="Ingredients" last>
                {["Cruelty Free", "Paraben Free", "Dermatologically Tested", "Vegan"].map((l) => (
                  <Check key={l} label={l} checked disabled onChange={() => {}} />
                ))}
              </FilterGroup>
            </div>

            {/* Exclusive offer & luxury sidebar ad suite */}
            <SidebarPromoCards
              promo={promo}
              welcomeCode={welcomeOffer?.code ?? "VEL10"}
            />
          </div>
        </aside>

        {/* Results — scroll-mt keeps the top clear of the sticky header on a page change */}
        <div ref={resultsTop} className="scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.78rem] text-ink-soft">
              {pageCount > 1
                ? `Showing ${firstProductNumber}–${lastProductNumber} of ${results.length} products`
                : `Showing ${results.length} of ${products.length} products`}
            </p>
            <label className="flex items-center gap-2 text-[0.78rem] text-ink-soft">
              Sort by:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-sm border border-gold-200 bg-cream-100 px-3 py-1.5 text-plum-800 focus:border-gold-500 focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-12 text-center text-sm text-ink-soft">
              No products match these filters yet.
            </p>
          ) : (
            <div
              key={`${category}-${sort}-${page}-${checked.join(",")}-${types.join(",")}-${bestOnly}-${maxPrice ?? "all"}`}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 xl:gap-5 2xl:gap-6 py-2"
            >
              {displayItems.map((item, i) => {
                const rowIndex = Math.floor(i / columns);
                return (
                  <FadeInItem key={item.key} rowIndex={rowIndex}>
                    {item.kind === "product" ? (
                      <ProductCard product={item.product} className="h-full" />
                    ) : (
                      <ShopAdCard ad={item.ad} />
                    )}
                  </FadeInItem>
                );
              })}

              {/* Closing tiles from the reference grid, in the last page's empty cells */}
              {spareCells >= 1 && (
                <FadeInItem rowIndex={Math.floor(displayItems.length / columns)}>
                  <div className="relative flex min-h-[17rem] h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-plum-900 px-6 pt-9 pb-6">
                    <Image
                      src="/images/shop page More Premium Products Coming Soon bg.png"
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
                      className="object-cover object-right-bottom"
                    />
                    {/* A light shade so the lettering reads over the photo */}
                    <div className="absolute inset-0 bg-plum-950/30" />
                    <h3 className="relative font-heading text-[1.7rem] font-bold leading-[1.25] text-cream-50">
                      More Premium
                      <br />
                      Products
                      <br />
                      Coming Soon
                    </h3>
                    <div
                      className="relative mt-5 self-start rounded-md border border-gold-300/70 px-4 py-2 text-[0.8rem] font-medium uppercase tracking-wide text-cream-50 transition-colors hover:border-gold-200 hover:bg-white/10 cursor-default"
                    >
                      Stay Tuned
                    </div>
                  </div>
                </FadeInItem>
              )}

              {spareCells >= 2 && (
                <FadeInItem rowIndex={Math.floor((displayItems.length + 1) / columns)}>
                  <ul className="flex flex-col justify-center h-full gap-4 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
                    {CLAIMS.map(({ Icon, label }) => (
                      <li key={label} className="flex items-center gap-3">
                        <Icon className="size-6 shrink-0 text-gold-600" strokeWidth={1.75} />
                        <span className="text-[0.95rem] font-medium text-ink">{label}</span>
                      </li>
                    ))}
                  </ul>
                </FadeInItem>
              )}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className="grid size-9 place-items-center rounded-sm border border-gold-200 text-plum-800 transition-colors hover:border-gold-500 disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "grid size-9 place-items-center rounded-sm text-[0.85rem] font-medium transition-colors",
                    n === page
                      ? "bg-plum-800 text-cream-50"
                      : "border border-gold-200 text-plum-800 hover:border-gold-500",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === pageCount}
                aria-label="Next page"
                className="grid size-9 place-items-center rounded-sm border border-gold-200 text-plum-800 transition-colors hover:border-gold-500 disabled:pointer-events-none disabled:opacity-35"
              >
                <ChevronRight className="size-4" />
              </button>
            </nav>
          )}

          <p className="mt-6 text-center text-xs text-ink-soft">
            Looking for something specific?{" "}
            <Link href="/contact" className="text-gold-600 hover:text-gold-500">
              Talk to us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn("pb-5", !last && "mb-5 border-b border-gold-200/60")}>
      <h3 className="mb-3 font-sans text-[0.9rem] font-medium text-gold-600">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 text-[0.9rem]",
        disabled ? "text-ink/55" : "cursor-pointer text-ink/80 hover:text-plum-800",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="size-4 accent-plum-800"
      />
      {label}
    </label>
  );
}

function FadeInItem({
  rowIndex,
  children,
}: {
  rowIndex: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      },
    );

    observer.observe(el);
    const fallbackTimer = setTimeout(() => setInView(true), 1200);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "h-full transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7 pointer-events-none",
      )}
      style={{
        transitionDelay: inView ? `${(rowIndex % 5) * 110}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}

function ShopAdCard({ ad }: { ad: ShopAd }) {
  const isLuxury = ad.theme === "luxury";
  const isGlow = ad.theme === "glow";

  return (
    <Link
      href={ad.href}
      className={cn(
        "group relative flex flex-col justify-between h-full min-h-[380px] sm:min-h-[420px] xl:min-h-[460px] 2xl:min-h-[500px] overflow-hidden rounded-[var(--radius-card)] p-6 sm:p-7 xl:p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(32,8,45,0.15)] hover:shadow-[0_20px_40px_rgba(32,8,45,0.25)] border",
        isLuxury
          ? "border-gold-300/70 bg-gradient-to-b from-[#fcf7f0] via-[#f7eee2] to-[#ebd8c4] text-plum-950 hover:border-gold-500"
          : isGlow
          ? "border-gold-400/50 bg-[#280a33] text-cream-50 hover:border-gold-400"
          : "border-gold-400/50 bg-[#1a0525] text-cream-50 hover:border-gold-400",
      )}
    >
      {/* Background image with luxury overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={ad.image}
          alt={ad.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-105",
            isLuxury ? "opacity-35 object-bottom" : isGlow ? "opacity-40 object-center" : "opacity-45 object-center",
          )}
        />
        {/* Gradients to guarantee pristine text readability */}
        {isLuxury ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[#ebd8c4]/95 via-[#f7eee2]/70 to-[#fcf7f0]/85" />
        ) : isGlow ? (
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b0523]/95 via-[#280a33]/75 to-[#380e47]/65" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[#12031a]/95 via-[#1a0525]/75 to-[#240833]/60" />
        )}
      </div>

      {/* Top section: Badge + Eyebrow */}
      <div className="relative z-10 flex flex-col items-start gap-2.5">
        {ad.badge && (
          <span
            className={cn(
              "label-caps px-2.5 py-0.5 rounded-full text-[0.62rem] xl:text-[0.68rem] font-bold tracking-[0.14em] uppercase shadow-sm border",
              isLuxury
                ? "border-plum-900/25 bg-plum-900/10 text-plum-900"
                : "border-gold-400/40 bg-gold-500/15 text-gold-300 backdrop-blur-sm",
            )}
          >
            {ad.badge}
          </span>
        )}
        <p
          className={cn(
            "label-caps text-[0.72rem] xl:text-[0.78rem] font-semibold tracking-[0.18em] uppercase",
            isLuxury ? "text-[#8a5a26]" : "text-gold-400",
          )}
        >
          {ad.eyebrow}
        </p>
      </div>

      {/* Middle/Bottom section: Headline, Subtitle, CTA */}
      <div className="relative z-10 flex flex-col items-start pt-8 pb-1">
        <h3
          className={cn(
            "font-heading font-black tracking-[-0.01em] uppercase leading-[1.08]",
            "text-[1.85rem] sm:text-[2rem] xl:text-[2.25rem] 2xl:text-[2.45rem]",
            isLuxury ? "text-plum-950" : isGlow ? "text-cream-50 font-display italic capitalize" : "text-cream-50",
          )}
        >
          {ad.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-[0.84rem] xl:text-[0.9rem] leading-relaxed line-clamp-2 max-w-[20rem]",
            isLuxury ? "text-plum-950/80 font-medium" : "text-cream-100/85",
          )}
        >
          {ad.subtitle}
        </p>

        {/* Action Button */}
        <div
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.75rem] xl:text-[0.8rem] font-bold uppercase tracking-[0.12em] transition-all duration-300 shadow-[0_4px_14px_rgba(32,8,45,0.22)] group-hover:gap-3 group-hover:shadow-[0_8px_20px_rgba(32,8,45,0.35)] group-hover:-translate-y-0.5",
            isLuxury
              ? "bg-plum-900 text-cream-50 hover:bg-plum-950 border border-gold-300/40"
              : "border border-gold-400/80 bg-gold-500 text-plum-950 hover:bg-gold-400",
          )}
        >
          <span>{ad.cta}</span>
          <span className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

/** Curated luxury promotions and brand privileges displayed in the shop sidebar */
function SidebarPromoCards({
  promo,
  welcomeCode,
}: {
  promo: string | null;
  welcomeCode: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(welcomeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const promoHeadline = (promo ?? "Get 10% OFF on your first order")
    .replace(/10%OFF/gi, "10% OFF")
    .replace(/CODE:([A-Za-z0-9]+)/g, "CODE: $1");

  return (
    <div className="space-y-6 pt-1">
      {/* ── CARD 1: EXCLUSIVE OFFER (LUXURY WELCOME PRIVILEGE) ── */}
      <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-gold-400/40 bg-gradient-to-br from-[#2a0838] via-[#1c0524] to-[#120219] p-5 shadow-xl shadow-plum-950/20 transition-all duration-300 hover:border-gold-400/70 hover:shadow-2xl hover:shadow-plum-950/30">
        {/* Ambient gold radial glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-gold-500/15 blur-2xl transition-all duration-500 group-hover:bg-gold-500/25" />

        {/* Top badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/35 bg-gold-500/15 px-2.5 py-0.5 text-[0.64rem] font-bold tracking-[0.16em] uppercase text-gold-300 shadow-sm backdrop-blur-xs">
            <Sparkles className="size-3 text-gold-300 animate-pulse" />
            Exclusive Offer
          </span>
          <span className="font-sans text-[0.65rem] font-semibold tracking-wider uppercase text-gold-400/70">
            Welcome Perk
          </span>
        </div>

        {/* Offer Headline */}
        <div className="relative z-10 mt-4 text-center">
          <p className="font-heading text-[2.1rem] font-black uppercase leading-tight tracking-tight text-cream-50 sm:text-[2.25rem]">
            10% OFF
          </p>
          <p className="mt-1 font-sans text-[0.82rem] font-medium leading-snug text-cream-100/90">
            {promoHeadline.split(/(\d+%\s*OFF)/i).map((part, i) =>
              i % 2 ? (
                <strong key={i} className="font-bold text-gold-300">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        </div>

        {/* Voucher Copy Module */}
        <div className="relative z-10 mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-gold-400/50 bg-plum-950/70 p-2.5 pl-3.5 shadow-inner backdrop-blur-sm">
          <div className="flex flex-col text-left">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold-300/75">
              Promo Code
            </span>
            <span className="font-heading text-[1.05rem] font-black tracking-wider text-cream-50 select-all">
              CODE: {welcomeCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy voucher code"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm cursor-pointer",
              copied
                ? "border border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                : "border border-gold-400/40 bg-gold-500 text-plum-950 hover:bg-gold-400 hover:shadow-gold-500/30",
            )}
          >
            {copied ? (
              <>
                <CheckIcon className="size-3.5 stroke-[2.5]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Primary CTA */}
        <Link
          href="/shop"
          className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 py-2.5 px-4 text-center text-[0.76rem] font-bold uppercase tracking-[0.14em] text-plum-950 shadow-md shadow-gold-500/20 transition-all duration-300 hover:shadow-gold-500/35 hover:brightness-105 active:scale-[0.99] group/btn"
        >
          <span>Claim & Shop</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>

        <p className="relative z-10 mt-2 text-center text-[0.62rem] text-cream-100/60">
          *Applied at checkout on full-size products
        </p>
      </div>

      {/* ── CARD 2: COMPLIMENTARY DELUXE GIFT (GIFT WITH PURCHASE) ── */}
      <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-gold-300/80 bg-gradient-to-br from-[#fffdfa] via-[#f7ede0] to-[#ecd9c5] p-5 shadow-md transition-all duration-300 hover:border-gold-400 hover:shadow-lg">
        {/* Top badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-plum-900/20 bg-plum-900/10 px-2.5 py-0.5 text-[0.64rem] font-bold tracking-[0.14em] uppercase text-plum-900">
            <Gift className="size-3 text-plum-900" />
            Complimentary Gift
          </span>
          <span className="font-heading text-[0.68rem] font-bold tracking-wider uppercase text-[#8a5a26]">
            Orders ₹999+
          </span>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative mt-3.5 h-24 w-full overflow-hidden rounded-xl border border-gold-300/60 shadow-inner">
          <Image
            src="/images/Complimentary gift on orders your cart.png"
            alt="Complimentary Luxury Miniature"
            fill
            className="object-cover object-right transition-transform duration-500 group-hover:scale-105"
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum-950/40 via-transparent to-transparent" />
          <span className="absolute bottom-1.5 left-2 rounded bg-cream-50/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-plum-950 backdrop-blur-xs">
            Deluxe Mini
          </span>
        </div>

        {/* Content */}
        <h4 className="mt-3 font-heading text-[1.1rem] font-black uppercase leading-snug tracking-tight text-plum-950">
          Free Deluxe Sample
        </h4>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-plum-950/80">
          Experience our cult-favorite Saffron Glow Elixir (10ml) complimentary with your order.
        </p>

        {/* Perks */}
        <div className="mt-3 space-y-1 text-[0.68rem] font-medium text-[#734b22]">
          <p className="flex items-center gap-1.5">
            <span className="text-gold-700">✦</span> Auto-added to cart on orders ₹999+
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-gold-700">✦</span> Hand-harvested botanical actives
          </p>
        </div>

        {/* Action button */}
        <Link
          href="/shop?filter=bestsellers"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-plum-900 py-2.5 px-4 text-center text-[0.75rem] font-bold uppercase tracking-[0.12em] text-cream-50 shadow-sm transition-all duration-200 hover:bg-plum-950 group/btn"
        >
          <span>Shop Bestsellers</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* ── CARD 3: THE BEAUTY SALE EVENT (40% OFF SKINCARE) ── */}
      <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-gold-400/40 bg-gradient-to-br from-[#200729] via-[#15031d] to-[#0c0211] p-5 shadow-xl shadow-plum-950/25 transition-all duration-300 hover:border-gold-400/70">
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gold-500/10 blur-xl transition-all duration-500 group-hover:bg-gold-500/20" />

        {/* Top badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-gold-400/40 bg-gold-500/15 px-2.5 py-0.5 text-[0.64rem] font-bold tracking-[0.14em] uppercase text-gold-300">
            Limited Time
          </span>
          <span className="font-heading text-[0.68rem] font-bold tracking-wider uppercase text-gold-400/75">
            Special Archive
          </span>
        </div>

        {/* High-res Image Preview */}
        <div className="relative z-10 mt-3.5 h-28 w-full overflow-hidden rounded-xl border border-gold-400/30 shadow-inner">
          <Image
            src="/images/shop-ad-event.jpg"
            alt="Beauty Sale Event"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15031d]/90 via-[#15031d]/30 to-transparent" />
          <span className="absolute bottom-2 left-2 rounded-md border border-gold-400/40 bg-gold-500/25 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-300 backdrop-blur-md">
            Save Up To 40%
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-3">
          <h4 className="font-heading text-[1.15rem] font-black uppercase leading-tight tracking-tight text-cream-50">
            The Beauty Event
          </h4>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-cream-100/80">
            Selected glow serums & clinical elixirs with restorative Ayurvedic bio-actives.
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/shop?category=skincare"
          className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/70 bg-gold-500/15 py-2.5 px-4 text-center text-[0.75rem] font-bold uppercase tracking-[0.12em] text-gold-300 shadow-sm transition-all duration-200 hover:bg-gold-500 hover:text-plum-950 group/btn"
        >
          <span>Explore Skincare Sale</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* ── CARD 4: SIGNATURE LIP DUO (BUY 2, GET 10% OFF) ── */}
      <div className="group relative overflow-hidden rounded-[var(--radius-card)] border border-rose-400/30 bg-gradient-to-br from-[#2f081c] via-[#200413] to-[#12020a] p-5 shadow-lg transition-all duration-300 hover:border-rose-400/60">
        {/* Top badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/15 px-2.5 py-0.5 text-[0.64rem] font-bold tracking-[0.14em] uppercase text-rose-300">
            Bundle Privilege
          </span>
          <span className="font-heading text-[0.68rem] font-bold tracking-wider uppercase text-rose-300/70">
            Auto Applied
          </span>
        </div>

        {/* High-res Velvet Matte Image Preview */}
        <div className="relative mt-3.5 h-28 w-full overflow-hidden rounded-xl border border-rose-400/25 shadow-inner">
          <Image
            src="/products/velvet-matte-hero.jpg"
            alt="Velvet Matte Lipstick"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#200413]/85 via-[#200413]/25 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full border border-white/40 bg-[#7a1528]" title="Velvet Plum" />
            <span className="inline-block size-3 rounded-full border border-white/40 bg-[#9d554d]" title="Warm Cashmere" />
            <span className="text-[0.6rem] font-semibold text-rose-200 uppercase tracking-wider pl-0.5">
              12 Shades
            </span>
          </div>
        </div>

        {/* Content */}
        <h4 className="mt-3 font-heading text-[1.12rem] font-black uppercase leading-tight tracking-tight text-cream-50">
          Buy 2, Get 10% Off
        </h4>
        <p className="mt-1 text-[0.78rem] leading-relaxed text-cream-100/80">
          Mix & match any two Velvet Matte Lipsticks or Nourishing Lip Oils.
        </p>

        {/* Action Button */}
        <Link
          href="/shop?category=lipstick"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/20 py-2.5 px-4 text-center text-[0.75rem] font-bold uppercase tracking-[0.12em] text-rose-200 shadow-sm transition-all duration-200 hover:bg-rose-500 hover:text-white group/btn"
        >
          <span>Curate Lip Duo</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>

      {/* ── CARD 5: FORMULATED FOR INDIAN SKIN (BRAND CREDIBILITY & CLINICAL PROMISE) ── */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-gold-400/30 bg-gradient-to-br from-[#1a0524] via-[#12031a] to-[#0a010f] p-5 shadow-lg text-cream-50">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-gold-400/30 bg-gold-500/10 px-2.5 py-0.5 text-[0.64rem] font-bold tracking-[0.14em] uppercase text-gold-300">
            Brand Promise
          </span>
          <span className="font-heading text-[0.68rem] font-bold tracking-wider uppercase text-gold-400/70">
            Pure & Safe
          </span>
        </div>

        <h4 className="mt-3 font-heading text-[1.05rem] font-black uppercase leading-snug tracking-tight text-cream-50">
          Designed For Indian Skin
        </h4>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-cream-100/75">
          Formulated to thrive in high-humidity climates with featherweight non-comedogenic wear.
        </p>

        {/* 4 Trust Micro-badges */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-[0.7rem] text-cream-100/90 font-medium">
          <div className="flex items-center gap-1.5 rounded-lg border border-gold-400/15 bg-plum-950/40 p-1.5 px-2">
            <ShieldCheck className="size-3.5 shrink-0 text-gold-400" />
            <span className="leading-tight text-[0.65rem]">Derm Tested</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gold-400/15 bg-plum-950/40 p-1.5 px-2">
            <Heart className="size-3.5 shrink-0 text-gold-400" />
            <span className="leading-tight text-[0.65rem]">100% Vegan</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gold-400/15 bg-plum-950/40 p-1.5 px-2">
            <FlaskConical className="size-3.5 shrink-0 text-gold-400" />
            <span className="leading-tight text-[0.65rem]">Clean Actives</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gold-400/15 bg-plum-950/40 p-1.5 px-2">
            <Sparkles className="size-3.5 shrink-0 text-gold-400" />
            <span className="leading-tight text-[0.65rem]">Anti-Humidity</span>
          </div>
        </div>

        <Link
          href="/ingredients"
          className="mt-3.5 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-gold-300 transition-colors hover:text-gold-200"
        >
          <span>Discover the clinical formulations</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}


