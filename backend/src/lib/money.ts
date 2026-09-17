/**
 * All money in this codebase is integer paise. These are the only places that
 * convert to and from rupees, so rounding happens in exactly one spot.
 */

export const toPaise = (rupees: number) => Math.round(rupees * 100);

export const toRupees = (paise: number) => paise / 100;

/**
 * Display string for an amount in paise. Never rounds to the rupee: whole
 * amounts print bare (₹799), anything with paise shows two digits (₹818.10).
 */
export const formatInr = (paise: number) =>
  "₹" +
  (paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

/** Percentage of an amount, where the rate is in basis points (1000 = 10%). */
export const applyBps = (paise: number, bps: number) => Math.round((paise * bps) / 10_000);

/**
 * GST already contained in a tax-inclusive amount.
 * For 18% inclusive: tax = amount × 1800 / 11800.
 */
export const inclusiveTax = (paise: number, bps: number) =>
  Math.round((paise * bps) / (10_000 + bps));
