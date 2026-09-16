import type { Metadata } from "next";
import Image from "next/image";
import PageBanner from "@/components/ui/PageBanner";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import TrustStrip from "@/components/ui/TrustStrip";
import { TESTIMONIALS, LONG_TESTIMONIALS, RATING_SUMMARY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What Velastia customers say — 4.9 out of 5 from thousands of reviews.",
};

export default function ReviewsPage() {
  const all = [...TESTIMONIALS, ...LONG_TESTIMONIALS];

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
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7 text-center">
            <p className="font-display text-[3.4rem] font-semibold leading-none text-plum-800">
              {RATING_SUMMARY.average}
            </p>
            <StarRating value={RATING_SUMMARY.average} size={18} className="mt-2 w-full justify-center" />
            <p className="mt-2 text-[0.72rem] text-ink-soft">
              Based on {RATING_SUMMARY.total.toLocaleString("en-IN")}+ reviews
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-7">
            <ul className="space-y-2.5">
              {RATING_SUMMARY.breakdown.map((b) => (
                <li key={b.stars} className="flex items-center gap-3 text-[0.72rem] text-ink-soft">
                  <span className="w-3 text-right">{b.stars}</span>
                  <span className="text-gold-500">★</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-300">
                    <span className="block h-full rounded-full bg-gold-500" style={{ width: `${b.pct}%` }} />
                  </span>
                  <span className="w-9 text-right">{b.pct}%</span>
                </li>
              ))}
            </ul>
            <Button className="mt-6">Write a Review</Button>
          </div>
        </div>

        {/* Reviews */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((t, i) => (
            <li
              key={`${t.name}-${i}`}
              className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt=""
                  width={38}
                  height={38}
                  className="size-[38px] rounded-full object-cover"
                />
                <div>
                  <p className="text-[0.82rem] font-medium text-plum-800">{t.name}</p>
                  {t.verified && <p className="text-[0.62rem] text-success">Verified Buyer</p>}
                </div>
              </div>
              <StarRating value={t.rating} size={13} className="mt-3" />
              <blockquote className="mt-2.5 text-[0.85rem] leading-relaxed text-ink-soft">
                {t.quote}
              </blockquote>
            </li>
          ))}
        </ul>
      </div>

      <TrustStrip />
    </>
  );
}
