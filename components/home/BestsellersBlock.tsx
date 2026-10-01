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
  const productsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll logic for products
    const pInterval = setInterval(() => {
      if (productsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = productsRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          productsRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          productsRef.current.scrollBy({ left: clientWidth / 3, behavior: "smooth" });
        }
      }
    }, 4000);

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

    return () => {
      clearInterval(pInterval);
      clearInterval(rInterval);
    };
  }, []);

  const scrollProducts = (dir: "left" | "right") => {
    if (productsRef.current) {
      const clientWidth = productsRef.current.clientWidth;
      productsRef.current.scrollBy({ left: dir === "left" ? -clientWidth / 3 : clientWidth / 3, behavior: "smooth" });
    }
  };

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

          <div className="relative px-2">
            <div
              ref={productsRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
            >
              {products.map((p) => (
                <div key={p.slug} className="min-w-[calc(33.333%-11px)] shrink-0 snap-start">
                  <ProductCard product={p} className="h-full" />
                </div>
              ))}
            </div>
            {/* Arrows for bestsellers */}
            <button onClick={() => scrollProducts("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => scrollProducts("right")} className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full bg-white border border-gold-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-gold-600 hover:text-gold-500">
              <ChevronRight className="size-5" />
            </button>
          </div>
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
