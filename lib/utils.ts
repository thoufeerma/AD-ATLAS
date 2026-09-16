import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian-format currency, e.g. 4830 -> "Rs 4,830". Renders as the rupee glyph. */
export function inr(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}
