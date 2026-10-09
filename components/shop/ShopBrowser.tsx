"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
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
  { Icon: Heart, label: "Cruelty Free & Vegan" },
  { Icon: FlaskConical, label: "Science Backed" },
  { Icon: MapPin, label: "Made In India" },
  { Icon: Leaf, label: "Premium Ingredients" },
  { Icon: Sparkles, label: "Safe & Effective" },
];

type Status = Product["status"];

/** Rows of products on one page of results. */
const ROWS_PER_PAGE = 5;

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
  const columns = useColumns();
  const perPage = ROWS_PER_PAGE * columns;
  const filterKey = JSON.stringify([category, checked, types, bestOnly, maxPrice, sort]);
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const pageCount = Math.max(1, Math.ceil(results.length / perPage));
  const page = paging.key === filterKey ? Math.min(paging.page, pageCount) : 1;
  const firstIndex = (page - 1) * perPage;
  const pageProducts = results.slice(firstIndex, firstIndex + perPage);
  // The two closing tiles fill empty cells on the last page — never an extra row.
  const spareCells = page === pageCount ? perPage - pageProducts.length : 0;
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
            className="mb-4 flex w-full items-center justify-between rounded-sm border border-gold-200 bg-cream-100 px-4 py-3 lg:hidden"
          >
            <span className="font-display text-[1.15rem] font-bold uppercase tracking-wide text-plum-800">Filters</span>
            <SlidersHorizontal className="size-4 text-gold-600" />
          </button>

          <div className={cn("space-y-7", filtersOpen ? "block" : "hidden lg:block")}>
            <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-gold-200/70 pb-3">
                <h2 className="font-display text-[1.3rem] font-bold uppercase tracking-wide text-plum-800">Filters</h2>
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

            {/* Exclusive offer: the admin's shop-sidebar banner, plus the
                welcome code while it is live */}
            {promo && (
              <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-[#f8eadf] px-6 pt-7 pb-6 text-center">
                <Gift className="size-14 text-gold-600" strokeWidth={1.1} />
                <h3 className="mt-4 font-sans text-[1.05rem] font-semibold uppercase tracking-wide text-ink">
                  Exclusive Offer
                </h3>
                {/* The admin's banner text; any "10% OFF" in it is set in bold. */}
                <p className="mt-3 max-w-[12rem] text-balance text-[0.95rem] font-medium leading-snug text-ink">
                  {promo.split(/(\d+%\s*OFF)/i).map((part, i) =>
                    i % 2 ? <strong key={i} className="font-bold">{part}</strong> : part,
                  )}
                </p>
                {welcomeOffer && (
                  <p className="mt-2.5 text-[0.95rem] font-medium text-ink">
                    Use Code: <strong className="font-bold">{welcomeOffer.code}</strong>
                  </p>
                )}
                <Link
                  href="/shop"
                  className="mt-5 w-full max-w-[9.5rem] rounded-md bg-plum-800 py-3 text-[0.9rem] font-medium uppercase tracking-wide text-cream-50 transition-colors hover:bg-plum-700"
                >
                  Shop Now
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Results — scroll-mt keeps the top clear of the sticky header on a page change */}
        <div ref={resultsTop} className="scroll-mt-28">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.78rem] text-ink-soft">
              {pageCount > 1
                ? `Showing ${firstIndex + 1}–${firstIndex + pageProducts.length} of ${results.length} products`
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {pageProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}

              {/* Closing tiles from the reference grid, in the last page's empty cells */}
              {spareCells >= 1 && (
                <div className="relative flex min-h-[17rem] flex-col overflow-hidden rounded-[var(--radius-card)] bg-plum-900 px-6 pt-9 pb-6">
                  <Image
                    src="/images/shop page More Premium Products Coming Soon bg.png"
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 30vw, 50vw"
                    className="object-cover object-right-bottom"
                  />
                  {/* A light shade so the lettering reads over the photo */}
                  <div className="absolute inset-0 bg-plum-950/30" />
                  <h3 className="relative font-display text-[1.7rem] font-medium leading-[1.25] text-cream-50">
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
              )}

              {spareCells >= 2 && (
                <ul className="flex flex-col justify-center gap-4 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
                  {CLAIMS.map(({ Icon, label }) => (
                    <li key={label} className="flex items-center gap-3">
                      <Icon className="size-6 shrink-0 text-gold-600" strokeWidth={1.75} />
                      <span className="text-[0.95rem] font-medium text-ink">{label}</span>
                    </li>
                  ))}
                </ul>
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
