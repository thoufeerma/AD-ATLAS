"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type Slice = {
  label: string;
  value: number;
  /** Share of the whole, 0–100. */
  pct: number;
  color: string;
};

/**
 * Part-to-whole at a glance, capped at 6 segments. Segments are separated by a
 * 2px surface gap rather than a drawn border, and every value is direct-labelled
 * in the legend — so the donut never carries meaning by colour alone.
 */
export default function Donut({
  slices,
  centreValue,
  centreLabel,
  size = 180,
  thickness = 26,
}: {
  slices: Slice[];
  centreValue: string;
  centreLabel: string;
  size?: number;
  thickness?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const GAP = 3; // px of surface between segments

  // Cumulative start offsets computed up front, so nothing is reassigned
  // during render.
  const offsets = slices.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + (slices[i - 1].pct / 100) * c);
    return acc;
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="presentation">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {slices.map((s, i) => {
              const len = (s.pct / 100) * c;
              const dash = Math.max(len - GAP, 1);
              return (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={hover === s.label ? thickness + 4 : thickness}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offsets[i]}
                  onMouseEnter={() => setHover(s.label)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer transition-[stroke-width]"
                />
              );
            })}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <p className="text-[1.35rem] font-semibold leading-none text-ink">{centreValue}</p>
          <p className="mt-1 text-[0.65rem] text-muted">{centreLabel}</p>
        </div>
      </div>

      <ul className="min-w-[9rem] space-y-2.5">
        {slices.map((s) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(s.label)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-1.5 py-1 text-[0.72rem] transition-colors",
              hover === s.label && "bg-plane",
            )}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 text-ink-2">{s.label}</span>
            <span className="tnum font-medium text-ink">
              {s.value.toLocaleString("en-IN")}
            </span>
            <span className="tnum w-12 text-right text-muted">({s.pct}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
