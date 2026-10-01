"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import RatingBars from "@/components/ui/RatingBars";
import type { Product, RatingSummary, Testimonial } from "@/lib/api/types";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function BestsellersBlock({
  products,
  testimonials,
  rating,
  ratingHeadline,
}: {
  products: Product[];
  testimonials: Testimonial[];
  rating: RatingSummary;
  /** Editable in the admin: Settings → Site Copy. */
  ratingHeadline: string;
}) {
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll logic for reviews
    const rInterval = setInterval(() => {
      if (reviewsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = reviewsRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          reviewsRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          reviewsRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 5000);

    return () => clearInterval(rInterval);
  }, []);

  const scrollReviews = (dir: "left" | "right") => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-cream-50">
      <div className="container-vel grid gap-6 py-8 lg:grid-cols-2">
        {/* Left side: Bestsellers */}
        <div className="flex flex-col relative pr-4">
          <div className="mb-8 relative flex items-end justify-center">
            <div className="text-center">
              <h2 className="font-display text-[1.75rem] font-semibold tracking-[0.03em] uppercase text-plum-800">
                BESTSELLERS
              </h2>
              <p className="mt-1 text-sm font-medium text-ink-soft">Our most loved products.</p>
            </div>
            <Link
              href="/shop?filter=bestsellers"
              className="absolute right-0 bottom-1 label-caps inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-gold-600 hover:text-gold-500"
            >
              VIEW ALL <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <BestsellerCarousel products={products} />
        </div>

        {/* Right side: Promo + Ratings + Testimonials */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-stretch">
            {/* New arrivals promo */}
            <div className="relative w-[54%] flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-plum-800 p-7">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-3/5">
                <Image
                  src="/brand/coming-soon.webp"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 260px, 60vw"
                  className="object-cover object-left"
                />
                {/* Keeps the headline readable where it crosses the photo */}
                <div className="absolute inset-0 bg-gradient-to-r from-plum-800 via-plum-800/80 to-plum-800/10" />
              </div>
              <div className="relative">
                <h3 className="font-display text-[2rem] font-medium leading-[1.15] text-cream-50">
                  New Arrivals
                  <span className="block">Coming Soon</span>
                </h3>
                <hr className="w-[85%] max-w-[12rem] border-gold-200/30 my-4" />
                <p className="mt-2 text-[0.95rem] font-medium leading-[1.65] text-cream-50">
                  Skincare, Perfumes,<br />
                  Makeup Accessories<br />
                  &amp; more.
                </p>
              </div>
              <Button href="/shop?filter=coming-soon" variant="gold" className="relative mt-8 self-start px-6 text-[0.7rem] uppercase tracking-wider rounded-md font-semibold">
                EXPLORE NOW
              </Button>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] bg-gold-200/50 my-2" />

            {/* Ratings */}
            <div className="w-[38%] rounded-[var(--radius-card)] border border-gold-200/50 bg-cream-50 p-5 flex flex-col">
              <h3 className="font-display text-center text-[1.1rem] font-bold uppercase tracking-widest text-plum-800">
                {ratingHeadline}
              </h3>

              {rating.total > 0 ? (
                <>
                  <p className="mt-2 text-center font-display text-[3.25rem] font-bold leading-none text-plum-800">
                    {rating.average.toFixed(1)}
                  </p>
                  <StarRating value={rating.average} size={15} className="mt-2 justify-center w-full" />
                  <p className="mt-1.5 text-center text-[0.8rem] font-semibold text-ink-soft">
                    Based on {rating.total.toLocaleString("en-IN")}{" "}
                    {rating.total === 1 ? "review" : "reviews"}
                  </p>

                  <div className="mt-3 flex-1">
                    <RatingBars rating={rating} />
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-[0.8rem] font-medium leading-relaxed text-ink-soft flex-1">
                  Be the first to share how Velastia works for you.
                </p>
              )}

              <Button href="/reviews" className="mt-5 mx-auto w-fit px-7 text-[0.65rem] py-2.5 rounded-md uppercase tracking-wider">
                WRITE A REVIEW
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          <div className="relative mt-2 px-2">
            <div
              ref={reviewsRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2"
            >
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="min-w-[170px] flex-1 shrink-0 snap-start flex flex-col"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={t.avatarUrl} name={t.author} size={42} />
                    <div className="flex flex-col justify-center">
                      <figcaption className="text-[0.8rem] font-semibold text-plum-800">
                        {t.author}
                      </figcaption>
                      <StarRating value={t.rating} size={11} className="mt-0.5" />
                    </div>
                  </div>
                  <blockquote className="mt-3.5 text-[0.8rem] font-medium leading-relaxed text-ink-soft">
                    {t.quote}
                  </blockquote>
                </figure>
              ))}
            </div>
            
            {/* Arrows for testimonials */}
            <button onClick={() => scrollReviews("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500">
              <ChevronLeft className="size-4" />
            </button>
            <button onClick={() => scrollReviews("right")} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Cards in view at once; the gap between them matches `gap-4`. */
const VISIBLE = 3;
const GAP = "1rem";
/** How long each position is held, and how long the slide across takes. */
const STEP_MS = 4000;
const GLIDE_MS = 700;

const ARROW =
  "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-gold-200 bg-white text-gold-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:text-gold-500";

/**
 * The bestsellers, one card at a time, round and round.
 *
 * The track carries the list three times and starts on the middle copy. A
 * move that lands in the first or last copy is followed, once the glide has
 * finished, by a silent jump of one whole list back to the same card in the
 * middle — so it never visibly rewinds, in either direction. Moved with a
 * transform rather than native scrolling: smooth `scrollBy` fought the scroll
 * snapping and left the arrows doing nothing.
 */
function BestsellerCarousel({ products }: { products: Product[] }) {
  const n = products.length;
  const loops = n > VISIBLE;
  const [i, setI] = useState(n);
  const [silent, setSilent] = useState(false); // the jump back, with no animation
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  // Advance on a timer, restarted whenever the position changes — so an
  // arrow click buys a full interval rather than a leftover moment.
  useEffect(() => {
    if (!loops || paused) return;
    const t = setTimeout(() => {
      setSilent(false);
      setI((x) => x + 1);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [i, loops, paused]);

  // Out in the first or last copy: back to the middle once the glide is done.
  // A timer rather than transitionend, which never fires for visitors who
  // have asked for reduced motion.
  useEffect(() => {
    if (!loops || (i >= n && i < 2 * n)) return;
    const t = setTimeout(() => {
      setSilent(true);
      setI((x) => (x < n ? x + n : x - n));
    }, GLIDE_MS + 50);
    return () => clearTimeout(t);
  }, [i, n, loops]);

  function go(direction: 1 | -1) {
    setSilent(false);
    // Clicks faster than the glide can't run off either end of the track.
    setI((x) => Math.min(3 * n - VISIBLE, Math.max(0, x + direction)));
  }

  const card = (p: Product, key: string | number) => (
    <div key={key} className="w-[calc((100%-2rem)/3)] shrink-0">
      <ProductCard product={p} className="h-full" />
    </div>
  );

  // Nothing to slide through: the cards simply sit side by side.
  if (!loops) {
    return <div className="flex gap-4 px-2 pb-4">{products.map((p) => card(p, p.slug))}</div>;
  }

  return (
    <div
      className="relative px-2"
      // Hold still while someone is reading or about to click a card. Mouse
      // only: a tap on a phone would otherwise leave it paused for good.
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
    >
      <div
        className="overflow-hidden pb-4"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null || Math.abs(end - start) < 40) return;
          go(end < start ? 1 : -1);
        }}
      >
        <div
          className={cn(
            "flex gap-4",
            silent ? "transition-none" : "transition-transform duration-700 ease-out motion-reduce:transition-none",
          )}
          style={{ transform: `translateX(calc(${-i} * (100% + ${GAP}) / ${VISIBLE}))` }}
        >
          {[...products, ...products, ...products].map((p, k) => card(p, k))}
        </div>
      </div>

      <button type="button" aria-label="Previous bestsellers" onClick={() => go(-1)} className={cn(ARROW, "-left-3")}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" aria-label="Next bestsellers" onClick={() => go(1)} className={cn(ARROW, "-right-3")}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
