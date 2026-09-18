import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹ with Indian digit grouping. Paise always print as two digits (₹818.10). */
export function inr(n: number) {
  const hasPaise = Math.round(n * 100) % 100 !== 0;
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/** Compact Indian notation used on axis ticks: 50K, 1L, 2L. */
export function inrShort(n: number) {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(n % 10_000_000 ? 1 : 0)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(n % 100_000 ? 1 : 0)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function num(n: number) {
  return n.toLocaleString("en-IN");
}

export function pct(n: number, dp = 1) {
  return `${n.toFixed(dp)}%`;
}

/**
 * Deep equality that ignores key order — JSON stored in Postgres (JSONB)
 * comes back with its keys reordered, so plain JSON.stringify would disagree.
 */
export function same(a: unknown, b: unknown): boolean {
  const norm = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(norm)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, norm((v as Record<string, unknown>)[k])]),
          )
        : v;
  return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}
