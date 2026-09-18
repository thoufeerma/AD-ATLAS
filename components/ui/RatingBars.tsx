import type { RatingSummary } from "@/lib/api/types";

/** Per-star share of published reviews. Shared with the product and reviews pages. */
export default function RatingBars({ rating, className }: { rating: RatingSummary; className?: string }) {
  return (
    <ul className={className ?? "mt-5 space-y-1.5"}>
      {rating.breakdown.map((b) => (
        <li key={b.stars} className="flex items-center gap-2 text-[0.65rem] text-ink-soft">
          <span className="w-2 text-right">{b.stars}</span>
          <span className="text-gold-500" aria-hidden>★</span>
          <span
            className="h-1 flex-1 overflow-hidden rounded-full bg-cream-300"
            role="img"
            aria-label={`${b.stars} star: ${b.count} ${b.count === 1 ? "review" : "reviews"}`}
          >
            <span className="block h-full rounded-full bg-gold-500" style={{ width: `${b.pct}%` }} />
          </span>
          <span className="w-7 text-right">{b.pct}%</span>
        </li>
      ))}
    </ul>
  );
}
