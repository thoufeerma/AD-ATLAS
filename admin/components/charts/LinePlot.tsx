"use client";

import { useId, useRef, useState } from "react";
import { inrShort, num } from "@/lib/utils";

/** Named formatters, so the prop stays serializable across the
 *  server → client boundary (a function cannot be passed). */
export type FormatAs = "rupees" | "count";

const FORMATTERS: Record<FormatAs, (n: number) => string> = {
  rupees: (n) => (n === 0 ? "0" : `₹${inrShort(n)}`),
  count: (n) => num(Math.round(n)),
};

type Props = {
  labels: string[];
  data: number[];
  color: string;
  /** Which named formatter to use for y ticks and the tooltip. */
  formatAs: FormatAs;
  /** Accessible name — a single series carries no legend, so the title names it. */
  name: string;
  height?: number;
  area?: boolean;
};

const TICKS = 4;

/**
 * One measure, one axis. Two measures of different units get two of these
 * stacked as small multiples — never a second y-scale on the same plot.
 *
 * The plot is drawn in a unit viewBox stretched to the container
 * (`preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"`, so the
 * 2px stroke stays 2px however wide the card gets). Axis labels and the hover
 * marker are HTML, not SVG text — otherwise they would scale with the viewBox
 * and shrink to a few unreadable pixels in a narrow card.
 *
 * Marks follow the data-viz spec: 2px stroke, solid hairline gridlines (never
 * dashed), markers only on hover, and a crosshair + tooltip layer.
 */
export default function LinePlot({
  labels,
  data,
  color,
  formatAs,
  name,
  height = 180,
  area = true,
}: Props) {
  const format = FORMATTERS[formatAs];
  const gradientId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...data);
  // All-zero data (a new store) would make the scale 0 and every y position
  // NaN. Fall back to a unit step so the plot draws a flat baseline instead.
  const step = max > 0 ? niceStep(max / TICKS) : 1;
  const top = step * TICKS;

  // Unit space: x 0→100 across the points, y 0→100 with 0 at the bottom.
  const ux = (i: number) => (i / (data.length - 1)) * 100;
  const uy = (v: number) => 100 - (v / top) * 100;

  const line = data.map((v, i) => `${i === 0 ? "M" : "L"} ${ux(i)} ${uy(v)}`).join(" ");
  const fill = `${line} L 100 100 L 0 100 Z`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const i = Math.round(ratio * (data.length - 1));
    setHover(i >= 0 && i < data.length ? i : null);
  }

  const ticks = Array.from({ length: TICKS + 1 }, (_, t) => (top / TICKS) * t);

  return (
    <figure className="w-full">
      <div className="flex gap-2">
        {/* y axis — HTML so it stays legible at any card width */}
        <div className="relative w-11 shrink-0" style={{ height }}>
          {ticks.map((v) => (
            <span
              key={v}
              className="tnum absolute right-0 -translate-y-1/2 text-[10px] leading-none text-muted"
              style={{ top: `${uy(v)}%` }}
            >
              {format(v)}
            </span>
          ))}
        </div>

        <div
          ref={plotRef}
          className="relative min-w-0 flex-1"
          style={{ height }}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label={`${name} by month`}
        >
          {/* gridlines */}
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute inset-x-0 h-px bg-grid"
              style={{ top: `${uy(v)}%` }}
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && <path d={fill} fill={`url(#${gradientId})`} />}
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* crosshair + marker, drawn as HTML so the dot stays circular */}
          {hover !== null && (
            <>
              <span
                className="pointer-events-none absolute inset-y-0 w-px bg-axis"
                style={{ left: `${ux(hover)}%` }}
              />
              <span
                className="pointer-events-none absolute size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card"
                style={{
                  left: `${ux(hover)}%`,
                  top: `${uy(data[hover])}%`,
                  backgroundColor: color,
                }}
              />
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-hairline bg-card px-2.5 py-1.5 shadow-lg"
                style={{
                  left: `${ux(hover)}%`,
                  top: `calc(${uy(data[hover])}% - 12px)`,
                }}
              >
                <p className="text-[0.62rem] leading-none text-muted">{labels[hover]}</p>
                <p className="tnum mt-1 text-[0.78rem] font-semibold leading-none text-ink">
                  {format(data[hover])}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* x axis */}
      <div className="mt-1.5 flex pl-13">
        {labels.map((l, i) => (
          <span
            key={l}
            className={`text-[10px] leading-none text-muted ${
              i === 0 ? "text-left" : i === labels.length - 1 ? "text-right" : "text-center"
            }`}
            style={{ flex: "1 1 0" }}
          >
            {l}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** Rounds a raw step up to 1/2/5 × 10ⁿ so axis ticks land on readable numbers. */
function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  const snapped = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return snapped * mag;
}
