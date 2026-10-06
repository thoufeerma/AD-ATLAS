"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/lib/api/types";
import Lightbox, { type MediaItem } from "./Lightbox";

const INK = "text-[#1d052b]";

type Sort = "recent" | "highest" | "lowest";

/** "Velastia Velvet Matte Lipstick" → "Velvet Matte Lipstick", as the cards show it. */
const shortName = (name: string) => name.replace(/^Velastia\s+/i, "");

/**
 * The Reviews page's browsing area: category tabs, the filter and sort row,
 * and "What our beauties are saying" — a row of review cards that scrolls
 * sideways, or every matching review in a grid after "View all reviews".
 * Filtering happens here, over the latest published reviews.
 */
export default function ReviewsBrowser({
  reviews,
  total,
  categories,
  media,
}: {
  reviews: Review[];
  total: number;
  categories: { slug: string; name: string; count: number }[];
  /** Rendered between the filter row and the review cards. */
  media?: React.ReactNode;
}) {
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState("");
  const [withMedia, setWithMedia] = useState("");
  const [verified, setVerified] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [showAll, setShowAll] = useState(false);
  const [photo, setPhoto] = useState<MediaItem | null>(null);
  const row = useRef<HTMLUListElement>(null);

  const products = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of reviews) seen.set(r.product.slug, shortName(r.product.name));
    return [...seen].sort((a, b) => a[1].localeCompare(b[1]));
  }, [reviews]);

  const shown = useMemo(() => {
    const list = reviews.filter(
      (r) =>
        (!category || r.product.category?.slug === category) &&
        (!product || r.product.slug === product) &&
        (!rating || r.rating === Number(rating)) &&
        (!withMedia || r.images.length > 0) &&
        (!verified || r.isVerified),
    );
    if (sort === "highest") list.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, category, product, rating, withMedia, verified, sort]);

  function scroll(dir: 1 | -1) {
    const el = row.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const tabs = [{ slug: "", name: "All Reviews", count: total }, ...categories.filter((c) => c.count > 0)];
  const select =
    "h-9 w-full appearance-none rounded-[4px] border border-[#ece3d9] bg-[#fefaf6] pr-8 pl-3 text-[0.8rem] text-[#1d052b]/85 focus:border-[#c8963c] focus:outline-none xl:h-[2.69vw] xl:pr-[2.2vw] xl:pl-[0.98vw] xl:text-[1.12vw]";
  const chevron =
    "pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-[#1d052b]/70 xl:right-[0.9vw] xl:size-[1.17vw]";
  const arrow =
    "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-[#e3d6c8] bg-cream-50 text-[#1d052b] transition-colors hover:border-[#c8963c] sm:grid xl:size-[2.54vw]";

  return (
    <>
      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Review categories"
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible xl:gap-[1.76vw] xl:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => {
          const active = category === t.slug;
          return (
            <button
              key={t.slug || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setCategory(t.slug);
                setProduct("");
              }}
              className={`h-9 shrink-0 rounded-full border px-5 text-[0.72rem] font-medium uppercase transition-colors xl:h-[2.73vw] xl:px-[2.05vw] xl:text-[1.045vw] ${
                active
                  ? "border-[#2e0f2e] bg-[#2e0f2e] text-cream-50"
                  : "border-[#e8ddd1] text-[#1d052b] hover:border-[#c8963c]"
              }`}
            >
              {t.name} <span className={active ? "" : "text-[#1d052b]/60"}>({t.count.toLocaleString("en-IN")})</span>
            </button>
          );
        })}
      </div>

      {/* Filter and sort */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 border-y border-[#efe6dc] py-4 sm:flex sm:flex-wrap sm:items-center xl:mt-[1.37vw] xl:gap-[1.07vw] xl:py-[1.51vw] xl:pb-[1.86vw]">
        <p className={`col-span-2 text-[0.75rem] font-semibold uppercase xl:pl-[0.5vw] xl:text-[1.07vw] ${INK}`}>Filter By</p>
        <label className="relative sm:w-36 xl:w-[10.35vw]">
          <span className="sr-only">Product</span>
          <select value={product} onChange={(e) => setProduct(e.target.value)} className={select}>
            <option value="">Product</option>
            {products.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown className={chevron} strokeWidth={1.5} />
        </label>
        <label className="relative sm:w-32 xl:w-[10.06vw]">
          <span className="sr-only">Rating</span>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className={select}>
            <option value="">Rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "star" : "stars"}
              </option>
            ))}
          </select>
          <ChevronDown className={chevron} strokeWidth={1.5} />
        </label>
        <label className="relative sm:w-36 xl:w-[10.21vw]">
          <span className="sr-only">With media</span>
          <select value={withMedia} onChange={(e) => setWithMedia(e.target.value)} className={select}>
            <option value="">With Media</option>
            <option value="yes">With photos only</option>
          </select>
          <ChevronDown className={chevron} strokeWidth={1.5} />
        </label>
        <label className="relative sm:w-40 xl:w-[11.77vw]">
          <span className="sr-only">Verified buyers</span>
          <select value={verified} onChange={(e) => setVerified(e.target.value)} className={select}>
            <option value="">Verified Buyers</option>
            <option value="yes">Verified buyers only</option>
          </select>
          <ChevronDown className={chevron} strokeWidth={1.5} />
        </label>
        <div className="col-span-2 flex items-center gap-2.5 sm:ml-auto xl:gap-[1.22vw]">
          <p className={`shrink-0 text-[0.75rem] font-semibold uppercase xl:text-[1.07vw] ${INK}`}>Sort By</p>
          <label className="relative w-full sm:w-40 xl:w-[11.08vw]">
            <span className="sr-only">Sort reviews</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className={chevron} strokeWidth={1.5} />
          </label>
        </div>
      </div>

      {media}

      {/* What our beauties are saying */}
      <section aria-labelledby="beauties-saying" className="mt-8 border-t border-[#efe6dc] pt-5 xl:mt-[2.34vw] xl:pt-[1.95vw]">
        <h2
          id="beauties-saying"
          className={`font-display text-[1.15rem] font-bold uppercase leading-none tracking-[0.01em] xl:text-[1.47vw] ${INK}`}
        >
          What Our Beauties Are Saying
        </h2>

        {shown.length === 0 ? (
          <p className="mt-4 rounded-md border border-[#efe6dc] bg-[#fdf7f1] p-10 text-center text-sm text-[#1d052b]/70">
            {reviews.length === 0 ? "Be the first to review a Velastia product." : "No reviews match these filters yet."}
          </p>
        ) : (
          <div className="relative mt-3 xl:-mx-[0.68vw] xl:mt-[1.37vw]">
            {!showAll && shown.length > 4 && (
              <>
                <button type="button" onClick={() => scroll(-1)} aria-label="Previous reviews" className={`${arrow} -left-4 xl:-left-[2.54vw]`}>
                  <ChevronLeft className="size-4 xl:size-[1.2vw]" strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => scroll(1)} aria-label="More reviews" className={`${arrow} -right-4 xl:-right-[2.54vw]`}>
                  <ChevronRight className="size-4 xl:size-[1.2vw]" strokeWidth={1.5} />
                </button>
              </>
            )}
            <ul
              ref={row}
              className={
                showAll
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-[1.37vw]"
                  : "flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] xl:gap-[1.37vw] [&::-webkit-scrollbar]:hidden"
              }
            >
              {shown.map((r) => (
                <li
                  key={r.id}
                  className={`flex flex-col rounded-md border border-[#efe5da] bg-[#fdf7f1] p-4 xl:min-h-[28.37vw] xl:px-[1.66vw] xl:pt-[1.66vw] xl:pb-[1.76vw] ${
                    showAll ? "" : "w-[80vw] shrink-0 snap-start sm:w-[45vw] lg:w-[30vw] xl:w-[21.48vw]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5 text-[#c98a2c] xl:gap-[0.2vw]" aria-label={`${r.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`size-3.5 xl:size-[1.17vw] ${n <= r.rating ? "fill-current" : "text-[#e3d6c8]"}`}
                          strokeWidth={n <= r.rating ? 0 : 1.5}
                        />
                      ))}
                    </span>
                    {r.isVerified && (
                      <span className="flex items-center gap-1 text-[0.62rem] text-[#1d052b]/60 xl:gap-[0.5vw] xl:text-[0.8vw]">
                        <Check className="size-3 text-[#a8762c] xl:size-[1vw]" strokeWidth={2.5} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <p className={`mt-3 text-[0.95rem] font-semibold leading-snug xl:mt-[1.42vw] xl:text-[1.24vw] ${INK}`}>{r.title}</p>
                  )}
                  <p
                    className={`mt-2 text-[0.85rem] leading-[1.7] text-[#1d052b]/85 xl:text-[1.15vw] xl:leading-[1.95vw] ${
                      r.title ? "xl:mt-[1.07vw]" : "xl:mt-[1.9vw]"
                    }`}
                  >
                    {r.body}
                  </p>
                  {r.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-1 pt-0 xl:mt-auto xl:gap-[0.29vw] xl:pt-[1.86vw]">
                      {r.images.slice(0, 3).map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setPhoto({ src, kind: "image", caption: `${r.authorName} · ${shortName(r.product.name)}` })}
                          aria-label={`View ${r.authorName}'s photo`}
                          className="aspect-[61.5/58.5] overflow-hidden rounded-[3px] bg-[#efdccb]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- customer photos come from storage at any size */}
                          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={`pt-4 ${r.images.length > 0 ? "xl:pt-[1.51vw]" : "mt-auto xl:pt-[1.86vw]"}`}>
                    <p className={`text-[0.82rem] font-medium xl:text-[1.045vw] xl:leading-[1.4vw] ${INK}`}>{r.authorName}</p>
                    <Link
                      href={`/product/${r.product.slug}`}
                      className="mt-0.5 block text-[0.75rem] text-[#1d052b]/80 hover:text-[#a8762c] xl:mt-[0.35vw] xl:text-[0.99vw]"
                    >
                      {shortName(r.product.name)}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {shown.length > 4 && (
          <div className="mt-5 flex justify-center xl:mt-[1.42vw]">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="h-10 rounded-[3px] bg-[#2e0f2e] px-8 text-[0.75rem] font-semibold uppercase text-cream-50 transition-colors hover:bg-[#45174a] xl:h-[2.93vw] xl:w-[15.92vw] xl:px-0 xl:text-[1.06vw]"
            >
              {showAll ? "Show Fewer Reviews" : "View All Reviews"}
            </button>
          </div>
        )}
      </section>

      <Lightbox item={photo} onClose={() => setPhoto(null)} />
    </>
  );
}
