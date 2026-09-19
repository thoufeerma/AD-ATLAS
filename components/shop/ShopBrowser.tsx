"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
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
import Button from "@/components/ui/Button";
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

  return (
    <div className="container-vel py-10">
      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mb-10 flex gap-3 overflow-x-auto px-4 sm:justify-center">
        {[{ id: "all", label: "All" }, ...categories.map((c) => ({ id: c.slug, label: c.name }))].map((c) => {
          const active = category === c.id;
          const ChipIcon = CHIP_ICONS[c.id] ?? Sparkles;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-full border transition-colors",
                  active
                    ? "border-plum-800 bg-plum-800 text-gold-300"
                    : "border-gold-300/70 bg-cream-100 text-gold-600 hover:border-gold-500",
                )}
              >
                <ChipIcon className="size-5" />
              </span>
              <span
                className={cn(
                  "label-caps text-[0.58rem]",
                  active ? "text-plum-800" : "text-ink-soft",
                )}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Filters */}
        <aside>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="mb-4 flex w-full items-center justify-between rounded-sm border border-gold-200 bg-cream-100 px-4 py-3 lg:hidden"
          >
            <span className="label-caps text-plum-800">Filters</span>
            <SlidersHorizontal className="size-4 text-gold-600" />
          </button>

          <div className={cn("space-y-7", filtersOpen ? "block" : "hidden lg:block")}>
            <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-gold-200/70 pb-3">
                <h2 className="label-caps text-plum-800">Filters</h2>
                <SlidersHorizontal className="size-4 text-gold-600" />
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
                <div className="mt-1 flex justify-between text-[0.68rem] text-ink-soft">
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
              <div className="rounded-[var(--radius-card)] border border-gold-300/60 bg-blush-100 p-6 text-center">
                <Gift className="mx-auto size-7 text-gold-600" />
                <h3 className="label-caps mt-3 text-plum-800">Exclusive Offer</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{promo}</p>
                {welcomeOffer && (
                  <p className="mt-1.5 text-xs text-ink-soft">
                    Use Code:{" "}
                    <strong className="font-medium text-plum-800">{welcomeOffer.code}</strong>
                  </p>
                )}
                <Button href="/shop" size="sm" className="mt-4">
                  Shop Now
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.78rem] text-ink-soft">
              Showing {results.length} of {products.length} products
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
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}

              {/* Closing tiles from the reference grid */}
              <div className="flex flex-col justify-center rounded-[var(--radius-card)] bg-plum-800 p-6 text-center">
                <h3 className="font-display text-xl leading-tight text-cream-50">
                  More Premium Products Coming Soon
                </h3>
                <Button variant="gold" size="sm" className="mt-4 self-center" href="/offers">
                  Stay Tuned
                </Button>
              </div>

              <ul className="space-y-2.5 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5">
                {CLAIMS.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0 text-gold-600" />
                    <span className="text-[0.7rem] text-ink-soft">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <span className="label-caps grid size-8 place-items-center rounded-sm bg-plum-800 text-cream-50">
              1
            </span>
          </div>

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
      <h3 className="label-caps mb-3 text-[0.62rem] text-gold-700">{title}</h3>
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
        "flex items-center gap-2.5 text-[0.75rem]",
        disabled ? "text-ink-soft/70" : "cursor-pointer text-ink-soft hover:text-plum-800",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="size-3.5 accent-plum-800"
      />
      {label}
    </label>
  );
}
