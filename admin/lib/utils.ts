import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹ with Indian digit grouping. */
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
