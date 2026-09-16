"use client";

import { useState } from "react";
import { Table2, LineChart as LineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Every chart ships a table-view twin — the WCAG-clean equivalent, so no value
 * is reachable only by hovering, and colour is never the sole encoding.
 */
export default function ChartFrame({
  title,
  subtitle,
  legend,
  controls,
  table,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Rendered for 2+ series. A single series needs no legend — the title names it. */
  legend?: { label: string; color: string }[];
  controls?: React.ReactNode;
  table: { columns: string[]; rows: (string | number)[][] };
  children: React.ReactNode;
  className?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-hairline bg-card",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
        <div>
          <h2 className="text-[0.92rem] font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[0.72rem] text-ink-2">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {controls}
          <div className="flex rounded-lg border border-hairline p-0.5">
            <button
              onClick={() => setView("chart")}
              aria-pressed={view === "chart"}
              aria-label="Chart view"
              className={cn(
                "grid size-7 place-items-center rounded-md transition-colors",
                view === "chart" ? "bg-plane text-ink" : "text-muted hover:text-ink",
              )}
            >
              <LineIcon className="size-3.5" />
            </button>
            <button
              onClick={() => setView("table")}
              aria-pressed={view === "table"}
              aria-label="Table view"
              className={cn(
                "grid size-7 place-items-center rounded-md transition-colors",
                view === "table" ? "bg-plane text-ink" : "text-muted hover:text-ink",
              )}
            >
              <Table2 className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {legend && legend.length > 1 && view === "chart" && (
        <ul className="flex flex-wrap gap-4 px-5 pt-4">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5 text-[0.72rem] text-ink-2">
              <span
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>
      )}

      <div className="p-5">
        {view === "chart" ? (
          children
        ) : (
          <div className="max-h-[320px] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-hairline">
                  {table.columns.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={cn(
                        "px-3 py-2.5 text-[0.66rem] font-semibold uppercase tracking-wider text-muted",
                        i > 0 && "text-right",
                      )}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={String(row[0])} className="border-b border-hairline last:border-0">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={cn(
                          "px-3 py-2.5 text-[0.78rem] text-ink",
                          i > 0 && "tnum text-right",
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
