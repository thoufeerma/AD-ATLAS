import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import RatingBars from "@/components/ui/RatingBars";
import type { Product, RatingSummary, Testimonial } from "@/lib/api/types";

/**
 * The three-up band from B-1-Home: bestseller carousel on the left,
 * "New Arrivals" promo in the middle, ratings panel on the right.
 */
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
  return (
    <section className="bg-cream-50">
      <div className="container-vel grid gap-8 py-16 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Bestsellers */}
        <div>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
                BESTSELLERS
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft">Our most loved products.</p>
            </div>
            <Link
              href="/shop?filter=bestsellers"
              className="label-caps inline-flex items-center gap-1.5 text-[0.6rem] text-gold-600 hover:text-gold-500"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>

        {/* New arrivals promo */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-plum-800 p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-3/5">
            <Image
              src="/brand/coming-soon.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 260px, 60vw"
              className="object-cover object-left"
            />
            {/* Keeps the headline readable where it crosses the photo */}
            <div className="absolute inset-0 bg-gradient-to-r from-plum-800 via-plum-800/70 to-plum-800/25" />
          </div>
          <div className="relative">
            <h3 className="font-display text-[1.75rem] leading-tight text-cream-50">
              New Arrivals
              <span className="block">Coming Soon</span>
            </h3>
            <p className="mt-4 max-w-[11rem] text-sm leading-relaxed text-cream-200/75">
              Skincare, Perfumes, Makeup Accessories &amp; more.
            </p>
          </div>
          <Button href="/shop?filter=coming-soon" variant="gold" className="relative mt-8 self-start">
            Explore Now
          </Button>
        </div>

        {/* Ratings */}
        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
          <h3 className="label-caps text-center text-[0.62rem] text-plum-800">
            {ratingHeadline}
          </h3>

          {rating.total > 0 ? (
            <>
              <p className="mt-4 text-center font-display text-[3rem] font-semibold leading-none text-plum-800">
                {rating.average.toFixed(1)}
              </p>
              <StarRating value={rating.average} size={16} className="mt-2 justify-center w-full" />
              <p className="mt-1.5 text-center text-[0.68rem] text-ink-soft">
                Based on {rating.total.toLocaleString("en-IN")}{" "}
                {rating.total === 1 ? "review" : "reviews"}
              </p>

              <RatingBars rating={rating} />
            </>
          ) : (
            <p className="mt-6 text-center text-sm leading-relaxed text-ink-soft">
              Be the first to share how Velastia works for you.
            </p>
          )}

          <Button href="/reviews" className="mt-6 w-full">
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review chips */}
      <div className="container-vel -mt-6 grid gap-3.5 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.slice(0, 4).map((t) => (
          <figure
            key={t.id}
            className="rounded-[var(--radius-card)] border border-gold-200/60 bg-cream-100 p-4"
          >
            <div className="flex items-center gap-2.5">
              <Avatar src={t.avatarUrl} name={t.author} size={30} />
              <div>
                <figcaption className="text-[0.72rem] font-medium text-plum-800">
                  {t.author}
                </figcaption>
                <StarRating value={t.rating} size={9} />
              </div>
            </div>
            <blockquote className="mt-2.5 text-[0.72rem] leading-relaxed text-ink-soft">
              {t.quote}
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
