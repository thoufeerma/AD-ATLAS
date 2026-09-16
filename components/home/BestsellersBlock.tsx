import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import { bestsellers } from "@/lib/products";
import { TESTIMONIALS, RATING_SUMMARY } from "@/lib/content";

/**
 * The three-up band from B-1-Home: bestseller carousel on the left,
 * "New Arrivals" promo in the middle, ratings panel on the right.
 */
export default function BestsellersBlock() {
  const products = bestsellers();

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
              href="/shop"
              className="label-caps inline-flex items-center gap-1.5 text-[0.6rem] text-gold-600 hover:text-gold-500"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>

        {/* New arrivals promo */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-plum-800 p-7">
          <div className="pointer-events-none absolute -right-8 top-0 h-full w-2/3 opacity-45">
            <Image
              src="/social/ig-3.png"
              alt=""
              fill
              sizes="300px"
              className="object-cover"
            />
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
          <Button href="/shop" variant="gold" className="relative mt-8 self-start">
            Explore Now
          </Button>
        </div>

        {/* Ratings */}
        <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6">
          <h3 className="label-caps text-center text-[0.62rem] text-plum-800">
            Loved by Thousands
          </h3>

          <p className="mt-4 text-center font-display text-[3rem] font-semibold leading-none text-plum-800">
            {RATING_SUMMARY.average}
          </p>
          <StarRating value={RATING_SUMMARY.average} size={16} className="mt-2 justify-center w-full" />
          <p className="mt-1.5 text-center text-[0.68rem] text-ink-soft">
            Based on {RATING_SUMMARY.total.toLocaleString("en-IN")}+ reviews
          </p>

          <ul className="mt-5 space-y-1.5">
            {RATING_SUMMARY.breakdown.map((b) => (
              <li key={b.stars} className="flex items-center gap-2 text-[0.65rem] text-ink-soft">
                <span className="w-2 text-right">{b.stars}</span>
                <span className="text-gold-500">★</span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-cream-300">
                  <span
                    className="block h-full rounded-full bg-gold-500"
                    style={{ width: `${b.pct}%` }}
                  />
                </span>
                <span className="w-7 text-right">{b.pct}%</span>
              </li>
            ))}
          </ul>

          <Button href="/reviews" className="mt-6 w-full">
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review chips */}
      <div className="container-vel -mt-6 grid gap-3.5 pb-14 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-[var(--radius-card)] border border-gold-200/60 bg-cream-100 p-4"
          >
            <div className="flex items-center gap-2.5">
              <Image
                src={t.avatar}
                alt=""
                width={30}
                height={30}
                className="size-[30px] rounded-full object-cover"
              />
              <div>
                <figcaption className="text-[0.72rem] font-medium text-plum-800">
                  {t.name}
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
