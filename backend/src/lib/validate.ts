import { z } from "zod";
import { findState } from "./gst.js";

/** Indian mobile: accepts "+91 98765 43210", stores "9876543210". */
export const IndianMobile = z
  .string()
  .transform((s) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"));

export const Pincode = z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode");

/**
 * An Indian state or union territory, stored under its proper name ("tamilnadu"
 * and "TN" both become "Tamil Nadu"). Invoices depend on it: delivery inside
 * the seller's own state is taxed as CGST + SGST, anywhere else as IGST.
 */
export const IndianState = z.string().transform((s, ctx) => {
  const state = findState(s);
  if (!state) {
    ctx.addIssue({ code: "custom", message: "Choose your state from the list" });
    return z.NEVER;
  }
  return state.name;
});

/** A delivery address, as entered at checkout or saved to an account. */
export const AddressFields = z.object({
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).nullish(),
  city: z.string().trim().min(2).max(80),
  state: IndianState,
  pincode: Pincode,
});
