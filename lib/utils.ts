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

/** Same as `inr`, from integer paise — the unit the API uses for all money. */
export function inrPaise(paise: number) {
  return inr(paise / 100);
}

/** First product image, or the brand placeholder while a product has none. */
export function productImage(product: { images: { url: string }[] }) {
  return product.images[0]?.url ?? "/products/matte-lipstick.png";
}

/** "+91 98765 43210" → "tel:+919876543210" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** "+91 98765 43210" → "https://wa.me/919876543210" */
export function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/** Loose email shape check for forms; the API does the strict one. */
export const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
