"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  /** Cell renderer. Omit to print `row[key]` as text. */
  cell?: (row: T) => React.ReactNode;
  /** Value used for sorting and search. Defaults to `row[key]`. */
  value?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
  sortable?: boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Chips rendered above the table, e.g. status filters. */
  filters?: { label: string; test: (row: T) => boolean }[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
};

const raw = <T,>(row: T, col: Column<T>): string | number => {
  if (col.value) return col.value(row);
  const v = (row as Record<string, unknown>)[col.key];
  return typeof v === "number" ? v : String(v ?? "");
};

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  filters,
  searchPlaceholder = "Search…",
  emptyMessage = "Nothing here yet.",
  onRowClick,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const filtered = useMemo(() => {
    let list = rows;

    if (filters && active > 0) {
      list = list.filter(filters[active - 1].test);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((row) =>
        columns.some((c) => String(raw(row, c)).toLowerCase().includes(q)),
      );
    }

    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        list = [...list].sort((a, b) => {
          const av = raw(a, col);
          const bv = raw(b, col);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }

    return list;
  }, [rows, columns, filters, active, query, sort]);

  function toggleSort(key: string) {
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-hairline bg-card">
      {/* One filter row above the table, never per-column */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        {filters ? (
          <div className="flex flex-wrap gap-1.5">
            {["All", ...filters.map((f) => f.label)].map((label, i) => (
              <button
                key={label}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.72rem] font-medium transition-colors",
                  i === active
                    ? "bg-series-1 text-white"
                    : "bg-plane text-ink-2 hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}

        <label className="relative">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-56 rounded-lg border border-hairline bg-plane py-2 pl-8.5 pr-3 text-[0.76rem] text-ink placeholder:text-muted focus:border-series-1 focus:bg-card focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-muted",
                    c.align === "right" && "text-right",
                    c.className,
                  )}
                >
                  {c.sortable === false ? (
                    c.header
                  ) : (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key &&
                        (sort.dir === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        ))}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <Inbox className="mx-auto size-7 text-muted" />
                  <p className="mt-3 text-[0.82rem] text-ink-2">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-hairline last:border-0",
                    onRowClick && "cursor-pointer hover:bg-plane",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3.5 text-[0.8rem] text-ink",
                        c.align === "right" && "text-right tnum",
                        c.className,
                      )}
                    >
                      {c.cell ? c.cell(row) : String(raw(row, c))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-hairline px-4 py-3 text-[0.72rem] text-ink-2">
        <span>
          Showing <span className="tnum">{filtered.length}</span> of{" "}
          <span className="tnum">{rows.length}</span>
        </span>
        <span className="text-muted">Pagination arrives with the API</span>
      </footer>
    </div>
  );
}
