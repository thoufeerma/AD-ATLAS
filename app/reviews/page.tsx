import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import StarRating from "@/components/ui/StarRating";
import RatingBars from "@/components/ui/RatingBars";
import TrustStrip from "@/components/ui/TrustStrip";
import WriteReview from "@/components/reviews/WriteReview";
import { getProducts, getRatingSummary, getReviews } from "@/lib/api/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("reviews");
}

export default async function ReviewsPage() {
  const [rating, reviews, products] = await Promise.all([
    getRatingSummary(),
    getReviews(),
    getProducts(),
  ]);
  const reviewable = products
    .filter((p) => p.status === "ACTIVE")
    .map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <>
      <PageBanner
        title="Reviews & Collaborations"
        tone="light"
        lead="Real words from the people who wear Velastia every day."
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
      />

      <div className="container-vel py-12">
        {/* Summary */}
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7 text-center">
            {rating.total > 0 ? (
              <>
                <p className="font-display text-[3.4rem] font-semibold leading-none text-plum-800">
                  {rating.average.toFixed(1)}
                </p>
                <StarRating value={rating.average} size={18} className="mt-2 w-full justify-center" />
                <p className="mt-2 text-[0.72rem] text-ink-soft">
                  Based on {rating.total.toLocaleString("en-IN")}{" "}
                  {rating.total === 1 ? "review" : "reviews"}
                </p>
              </>
            ) : (
              <p className="py-6 text-sm text-ink-soft">No reviews yet.</p>
            )}
          </div>

          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7">
            {rating.total > 0 && <RatingBars rating={rating} className="space-y-2.5" />}
            <WriteReview products={reviewable} />
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="flex flex-col rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5"
              >
                <div>
                  <p className="text-[0.82rem] font-medium text-plum-800">{r.authorName}</p>
                  {r.isVerified && <p className="text-[0.62rem] text-success">Verified Buyer</p>}
                </div>
                <StarRating value={r.rating} size={13} className="mt-3" />
                <blockquote className="mt-2.5 text-[0.85rem] leading-relaxed text-ink-soft">
                  {r.body}
                </blockquote>
                <p className="mt-auto pt-4 text-[0.68rem] text-ink-soft">
                  on{" "}
                  <Link href={`/product/${r.product.slug}`} className="text-gold-700 hover:text-gold-600">
                    {r.product.name}
                  </Link>{" "}
                  ·{" "}
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-12 text-center text-sm text-ink-soft">
            Be the first to review a Velastia product.
          </p>
        )}
      </div>

      <TrustStrip />
    </>
  );
}
