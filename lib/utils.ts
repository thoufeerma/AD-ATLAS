import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian-format currency, e.g. 4830 -> "Rs 4,830". Renders as the rupee glyph. */
export function inr(amount: number) {
  // Whole rupees print bare (₹799); anything with paise always shows two
  // digits (₹818.10, never ₹818.1). Amounts are never rounded to the rupee.
  const hasPaise = Math.round(amount * 100) % 100 !== 0;
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}
