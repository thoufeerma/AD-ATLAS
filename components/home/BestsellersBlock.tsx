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
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLoop } from "@/lib/loop";

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
      <div className="container-vel grid gap-6 xl:gap-8 2xl:gap-10 py-8 xl:py-10 2xl:py-12 lg:grid-cols-2">
        {/* Left side: Bestsellers */}
        <div className="flex flex-col relative pr-0 sm:pr-2 lg:pr-4 w-full min-w-0">
          <div className="mb-6 sm:mb-8 relative flex items-end justify-between sm:justify-center">
            <div className="text-left sm:text-center">
              <h2 className="font-heading text-[1.5rem] sm:text-[1.75rem] xl:text-[2.15rem] 2xl:text-[2.45rem] font-bold tracking-[0.03em] uppercase text-plum-800">
                BESTSELLERS
              </h2>
              <p className="mt-1 text-xs sm:text-sm xl:text-[1rem] font-medium text-ink">Our most loved products.</p>
            </div>
            <Link
              href="/shop?filter=bestsellers"
              className="sm:absolute sm:right-0 sm:bottom-1 label-caps inline-flex min-h-[44px] items-center gap-1.5 text-[0.7rem] xl:text-[0.8rem] font-bold text-gold-600 hover:text-gold-500"
            >
              VIEW ALL <ArrowRight className="size-3.5 xl:size-4" />
            </Link>
          </div>

          <BestsellerCarousel products={products} />
        </div>

        {/* Right side: Promo + Ratings + Testimonials */}
        <div className="flex flex-col gap-4 xl:gap-6 w-full min-w-0">
          <div className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-5 xl:gap-6">
            {/* New arrivals promo */}
            <div className="relative w-full md:flex-[1.28] flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-plum-800 p-6 sm:p-7 xl:p-8 2xl:p-9 border border-gold-400/35 shadow-[0_4px_16px_rgba(32,8,45,0.18),0_1.5px_4px_rgba(32,8,45,0.08)] transition-all duration-300 hover:shadow-[0_16px_32px_rgba(32,8,45,0.25),0_4px_12px_rgba(193,136,62,0.2)] hover:border-gold-400/60">
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
                <h3 className="font-heading text-[1.65rem] sm:text-[2rem] xl:text-[2.35rem] 2xl:text-[2.65rem] font-bold leading-[1.15] text-cream-50">
                  New Arrivals
                  <span className="block">Coming Soon</span>
                </h3>
                <hr className="w-[85%] max-w-[12rem] xl:max-w-[15rem] border-gold-200/30 my-3 sm:my-4" />
                <p className="mt-2 text-[0.88rem] sm:text-[0.95rem] xl:text-[1.08rem] 2xl:text-[1.16rem] font-medium leading-[1.65] text-cream-50">
                  Skincare, Perfumes,<br />
                  Makeup Accessories<br />
                  &amp; more.
                </p>
              </div>
              <Button href="/shop?filter=coming-soon" variant="gold" className="relative mt-4 xl:mt-6 self-start px-6 xl:px-8 py-2.5 xl:py-3.5 min-h-[44px] text-[0.7rem] xl:text-[0.78rem] uppercase tracking-wider rounded-md font-semibold">
                EXPLORE NOW
              </Button>
            </div>

            {/* Ratings */}
            <div className="w-full md:flex-1 rounded-[var(--radius-card)] border border-gold-300/40 bg-white p-5 xl:p-7 2xl:p-8 flex flex-col shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(32,8,45,0.18),0_4px_12px_rgba(193,136,62,0.15)] hover:border-gold-400/80">
              <h3 className="font-heading text-center text-[1rem] sm:text-[1.1rem] xl:text-[1.22rem] 2xl:text-[1.3rem] font-bold uppercase tracking-widest text-plum-800">
                {ratingHeadline}
              </h3>

              {rating.total > 0 ? (
                <>
                  <p className="mt-2 text-center font-heading text-[2.75rem] sm:text-[3.25rem] xl:text-[3.8rem] 2xl:text-[4.2rem] font-bold leading-none text-plum-800">
                    {rating.average.toFixed(1)}
                  </p>
                  <StarRating value={rating.average} size={16} className="mt-2 justify-center w-full" />
                  <p className="mt-1.5 text-center text-[0.75rem] sm:text-[0.8rem] xl:text-[0.9rem] font-semibold text-ink">
                    Based on {rating.total.toLocaleString("en-IN")}{" "}
                    {rating.total === 1 ? "review" : "reviews"}
                  </p>

                  <div className="mt-3 xl:mt-4 flex-1">
                    <RatingBars rating={rating} />
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-[0.8rem] font-medium leading-relaxed text-ink flex-1">
                  Be the first to share how Velastia works for you.
                </p>
              )}

              <Button href="/reviews" className="mt-4 sm:mt-5 xl:mt-6 mx-auto w-fit px-7 xl:px-9 min-h-[44px] text-[0.65rem] xl:text-[0.75rem] py-2.5 xl:py-3.5 rounded-md uppercase tracking-wider">
                WRITE A REVIEW
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          <div className="relative mt-2 xl:mt-3 px-2">
            <div
              ref={reviewsRef}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar py-2 divide-x divide-gold-200/40"
            >
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="min-w-[170px] xl:min-w-[220px] flex-1 shrink-0 snap-start flex flex-col px-4 sm:px-5 xl:px-6 first:pl-0 last:pr-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={t.avatarUrl} name={t.author} size={46} />
                    <div className="flex flex-col justify-center">
                      <figcaption className="text-[0.8rem] xl:text-[0.92rem] font-semibold text-plum-800">
                        {t.author}
                      </figcaption>
                      <StarRating value={t.rating} size={12} className="mt-0.5" />
                    </div>
                  </div>
                  <blockquote className="mt-3 text-[0.78rem] sm:text-[0.8rem] xl:text-[0.9rem] font-medium leading-relaxed text-ink">
                    {t.quote}
                  </blockquote>
                </figure>
              ))}
            </div>
            
            {/* Arrows for testimonials */}
            <button onClick={() => scrollReviews("left")} aria-label="Previous reviews" className="absolute -left-2 sm:-left-3 xl:-left-4 top-1/2 -translate-y-1/2 z-10 grid size-11 xl:size-12 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500 active:scale-95">
              <ChevronLeft className="size-5 xl:size-6" />
            </button>
            <button onClick={() => scrollReviews("right")} aria-label="Next reviews" className="absolute -right-2 sm:-right-3 xl:-right-4 top-1/2 -translate-y-1/2 z-10 grid size-11 xl:size-12 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500 active:scale-95">
              <ChevronRight className="size-5 xl:size-6" />
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
/** How long each position is held (swaps slightly faster). */
const STEP_MS = 2500;

const ARROW =
  "absolute top-1/2 z-10 grid size-11 xl:size-12 2xl:size-13 -translate-y-1/2 place-items-center rounded-full border border-gold-200 bg-white text-gold-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:text-gold-500 active:scale-95";

/** The bestsellers, one card at a time, round and round (see lib/loop.ts). */
function BestsellerCarousel({ products }: { products: Product[] }) {
  const { loops, i, go, tripled, trackClass, hoverProps, swipeProps } = useLoop(products, {
    visible: VISIBLE,
    stepMs: STEP_MS,
  });

  const card = (p: Product, key: string | number) => (
    <div key={key} className="w-[calc((100%-2rem)/3)] shrink-0 py-3 px-1">
      <ProductCard product={p} className="h-full" />
    </div>
  );

  // Nothing to slide through: the cards simply sit side by side.
  if (!loops) {
    return (
      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-[var(--gap)] px-2 pt-2 pb-6 no-scrollbar"
        style={{ "--gap": "1rem", scrollPaddingLeft: "0.5rem" } as React.CSSProperties}
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="w-[calc((100%-var(--gap))/2.15)] md:w-[calc((100%-2*var(--gap))/3.2)] lg:w-[calc((100%-2*var(--gap))/3)] shrink-0 snap-start py-3 px-1"
          >
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0">
      {/* Mobile: simple scroll snap */}
      <div
        className="flex lg:hidden w-full overflow-x-auto snap-x snap-mandatory gap-[var(--gap)] px-2 pt-2 pb-6 no-scrollbar"
        style={{ "--gap": "1rem", scrollPaddingLeft: "0.5rem" } as React.CSSProperties}
      >
        {products.map((p) => (
          <div
            key={p.slug}
            className="w-[calc((100%-var(--gap))/2.15)] md:w-[calc((100%-2*var(--gap))/3.2)] shrink-0 snap-start py-3 px-1"
          >
            <ProductCard product={p} className="h-full" />
          </div>
        ))}
      </div>

      {/* Desktop: infinite loop carousel */}
      <div className="hidden lg:block relative px-2" {...hoverProps}>
        <div className="overflow-hidden pt-2 pb-6 px-1.5 -mx-1.5" {...swipeProps}>
          <div
            className={cn(trackClass, "gap-4")}
            style={{ transform: `translateX(calc(${-i} * (100% + ${GAP}) / ${VISIBLE}))` }}
          >
            {tripled.map((p, k) => card(p, k))}
          </div>
        </div>

        <button type="button" aria-label="Previous bestsellers" onClick={() => go(-1)} className={cn(ARROW, "-left-3 xl:-left-4")}>
          <ChevronLeft className="size-5 xl:size-6" />
        </button>
        <button type="button" aria-label="Next bestsellers" onClick={() => go(1)} className={cn(ARROW, "-right-3 xl:-right-4")}>
          <ChevronRight className="size-5 xl:size-6" />
        </button>
      </div>
    </div>
  );
}
