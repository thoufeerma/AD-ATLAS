import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Sparkline from "@/components/charts/Sparkline";
import { cn } from "@/lib/utils";

const SLOT_COLORS = {
  1: "var(--color-series-1)",
  2: "var(--color-series-2)",
  3: "var(--color-series-3)",
} as const;

export default function StatCard({
  label,
  value,
  delta,
  series,
  slot = 1,
  note = "vs last 30 days",
}: {
  label: string;
  value: string;
  delta?: number;
  series?: number[];
  slot?: 1 | 2 | 3;
  note?: string;
}) {
  const color = SLOT_COLORS[slot];
  const up = (delta ?? 0) > 0;
  const flat = delta === 0 || delta === undefined;

  return (
    <article className="rounded-[var(--radius-card)] border border-hairline bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.78rem] text-ink-2">{label}</p>
        {delta !== undefined && (
          /* Direction is carried by the arrow and the signed number, not by
             colour alone. */
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[0.7rem] font-medium",
              flat ? "text-muted" : up ? "text-[#006300]" : "text-critical",
            )}
          >
            {flat ? (
              <Minus className="size-3" />
            ) : up ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      {/* Hero figure: proportional figures, system sans — never tabular-nums */}
      <p className="mt-2 text-[1.6rem] font-semibold leading-none tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1.5 text-[0.68rem] text-muted">{note}</p>

      {series && (
        <div className="mt-3">
          <Sparkline
            data={series}
            color={color}
            label={`${label} trend, ${note}`}
            width={260}
            height={44}
          />
        </div>
      )}
    </article>
  );
}
