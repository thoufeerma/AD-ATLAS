import type { Quote } from "@/lib/api/types";
import { cn, inrPaise } from "@/lib/utils";

/**
 * Totals exactly as the API priced them. Shown dimmed while a newer quote is
 * on its way; before the first quote arrives the figures read "…".
 */
export default function QuoteSummary({
  quote,
  stale,
  totalLabel,
  showSavings = false,
}: {
  quote: Quote | undefined;
  stale: boolean;
  totalLabel: string;
  showSavings?: boolean;
}) {
  const money = (paise: number | undefined) => (paise == null ? "…" : inrPaise(paise));
  const discount = quote?.discountPaise ?? 0;

  return (
    <div className={cn("transition-opacity", stale && "opacity-50")} aria-busy={stale || !quote}>
      <dl className="mt-5 space-y-3 text-sm">
        <Row
          label={`Subtotal (${quote?.itemCount ?? "…"} ${quote?.itemCount === 1 ? "Item" : "Items"})`}
          value={money(quote?.subtotalPaise)}
        />
        {discount > 0 && (
          <Row
            label={quote?.coupon ? `Discount (${quote.coupon.code})` : "Discount"}
            value={`- ${inrPaise(discount)}`}
            tone="success"
          />
        )}
        <Row
          label="Shipping"
          value={quote == null ? "…" : quote.shippingPaise === 0 ? "FREE" : inrPaise(quote.shippingPaise)}
          tone={quote?.shippingPaise === 0 ? "success" : undefined}
        />
        {showSavings && discount > 0 && (
          <div className="border-t border-gold-200/70 pt-3">
            <Row label="You Save" value={inrPaise(discount)} tone="success" />
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-end justify-between border-t border-gold-200/70 pt-4">
        <div>
          <p className="text-sm font-medium text-plum-800">{totalLabel}</p>
          <p className="text-[0.65rem] text-ink-soft">Inclusive of all taxes</p>
        </div>
        <p className="font-display text-2xl font-semibold text-plum-800">{money(quote?.totalPaise)}</p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={tone === "success" ? "font-medium text-success" : "text-plum-800"}>{value}</dd>
    </div>
  );
}
