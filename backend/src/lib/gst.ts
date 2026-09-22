/**
 * GST: Indian states and their GST codes, GSTIN checks, financial years, and
 * how an order's tax-inclusive prices split into taxable value and CGST + SGST
 * (delivery inside the seller's own state) or IGST (any other state).
 *
 * Pure functions only — no database — so the seed and tests can use them.
 *
 * `taxLines` decides what past invoices print: they are re-rendered from the
 * order's snapshots each time they're opened. Change its rounding or
 * allocation and every old invoice changes with it.
 */

export type GstState = { code: string; name: string };

/** States and union territories with their GST state codes. */
const STATES: (GstState & { aliases: string[] })[] = [
  { code: "01", name: "Jammu and Kashmir", aliases: ["JK", "J&K"] },
  { code: "02", name: "Himachal Pradesh", aliases: ["HP"] },
  { code: "03", name: "Punjab", aliases: ["PB"] },
  { code: "04", name: "Chandigarh", aliases: ["CH"] },
  { code: "05", name: "Uttarakhand", aliases: ["UK", "Uttaranchal"] },
  { code: "06", name: "Haryana", aliases: ["HR"] },
  { code: "07", name: "Delhi", aliases: ["DL", "New Delhi", "NCT of Delhi"] },
  { code: "08", name: "Rajasthan", aliases: ["RJ"] },
  { code: "09", name: "Uttar Pradesh", aliases: ["UP"] },
  { code: "10", name: "Bihar", aliases: ["BR"] },
  { code: "11", name: "Sikkim", aliases: ["SK"] },
  { code: "12", name: "Arunachal Pradesh", aliases: ["AR"] },
  { code: "13", name: "Nagaland", aliases: ["NL"] },
  { code: "14", name: "Manipur", aliases: ["MN"] },
  { code: "15", name: "Mizoram", aliases: ["MZ"] },
  { code: "16", name: "Tripura", aliases: ["TR"] },
  { code: "17", name: "Meghalaya", aliases: ["ML"] },
  { code: "18", name: "Assam", aliases: ["AS"] },
  { code: "19", name: "West Bengal", aliases: ["WB"] },
  { code: "20", name: "Jharkhand", aliases: ["JH"] },
  { code: "21", name: "Odisha", aliases: ["OD", "Orissa"] },
  { code: "22", name: "Chhattisgarh", aliases: ["CG", "Chattisgarh"] },
  { code: "23", name: "Madhya Pradesh", aliases: ["MP"] },
  { code: "24", name: "Gujarat", aliases: ["GJ"] },
  {
    code: "26",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    aliases: ["DNHDD", "Dadra and Nagar Haveli", "Daman and Diu"],
  },
  { code: "27", name: "Maharashtra", aliases: ["MH"] },
  { code: "29", name: "Karnataka", aliases: ["KA"] },
  { code: "30", name: "Goa", aliases: ["GA"] },
  { code: "31", name: "Lakshadweep", aliases: ["LD"] },
  { code: "32", name: "Kerala", aliases: ["KL"] },
  { code: "33", name: "Tamil Nadu", aliases: ["TN"] },
  { code: "34", name: "Puducherry", aliases: ["PY", "Pondicherry"] },
  { code: "35", name: "Andaman and Nicobar Islands", aliases: ["AN", "Andaman and Nicobar"] },
  { code: "36", name: "Telangana", aliases: ["TS", "TG"] },
  { code: "37", name: "Andhra Pradesh", aliases: ["AP"] },
  { code: "38", name: "Ladakh", aliases: ["LA"] },
];

export const STATE_NAMES = STATES.map((s) => s.name);

const squash = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");

const BY_KEY = new Map<string, GstState>();
for (const s of STATES) {
  for (const key of [s.name, ...s.aliases]) BY_KEY.set(squash(key), { code: s.code, name: s.name });
}
const BY_CODE = new Map(STATES.map((s) => [s.code, { code: s.code, name: s.name }]));

/**
 * The state someone typed, however they spelt it ("Tamilnadu", "TN",
 * "Orissa"), or null if it isn't one.
 */
export function findState(text: string | null | undefined): GstState | null {
  if (!text) return null;
  return BY_KEY.get(squash(text)) ?? null;
}

/* ── GSTIN ── */

const GSTIN_SHAPE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The 15th character of a GSTIN is a check digit over the first 14. */
function checkChar(first14: string) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const product = CHARS.indexOf(first14[i]!) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return CHARS[(36 - (sum % 36)) % 36]!;
}

/** Why a GSTIN can't be right, or null if it looks genuine. */
export function gstinProblem(gstin: string): string | null {
  if (gstin.length !== 15) return "A GSTIN is 15 characters, e.g. 29ABCDE1234F1ZW";
  if (!GSTIN_SHAPE.test(gstin)) return "That isn't the shape of a GSTIN, e.g. 29ABCDE1234F1ZW";
  if (!BY_CODE.has(gstin.slice(0, 2))) return "The first two digits should be your state's GST code";
  if (checkChar(gstin.slice(0, 14)) !== gstin[14]) {
    return "The last character doesn't match — check the GSTIN for a typo";
  }
  return null;
}

/** The state a GSTIN is registered in: its first two digits. */
export const stateForGstin = (gstin: string) => BY_CODE.get(gstin.slice(0, 2)) ?? null;

/* ── Dates ── India runs on IST, whatever the server's clock says. */

const IST_MS = 330 * 60_000;

/** "2627" for April 2026 to March 2027. */
export function financialYear(at: Date) {
  const ist = new Date(at.getTime() + IST_MS);
  const start = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  const yy = (y: number) => String(y % 100).padStart(2, "0");
  return `${yy(start)}${yy(start + 1)}`;
}

/** "2026-09" → the instants that calendar month starts and ends in IST. */
export function istMonth(month: string) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return {
    from: new Date(Date.UTC(y, m - 1, 1) - IST_MS),
    to: new Date(Date.UTC(y, m, 1) - IST_MS),
  };
}

/** The IST calendar month an instant falls in, as "2026-09". */
export const istMonthOf = (at: Date) => new Date(at.getTime() + IST_MS).toISOString().slice(0, 7);

/* ── Splitting tax-inclusive prices ── */

export type TaxLineInput = {
  /** The order line's id, when there is one (credit notes refer back to it). */
  id?: string;
  productName: string;
  shadeName: string | null;
  sku: string;
  hsnCode: string;
  gstRateBps: number;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
};

export type TaxLine = {
  /** The order line's id, or "delivery". */
  key: string;
  description: string;
  detail: string | null;
  hsnCode: string;
  /** Null for the delivery row. */
  quantity: number | null;
  unitPricePaise: number | null;
  /** What was charged before the order's discount, GST included. */
  grossPaise: number;
  /** This line's share of the order discount. */
  discountPaise: number;
  taxablePaise: number;
  rateBps: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  /** grossPaise − discountPaise: what the customer paid for this line. */
  totalPaise: number;
};

export type TaxTotals = {
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  taxPaise: number;
  totalPaise: number;
};

/**
 * Shares `amount` out in proportion to `weights`, to the paisa: each gets its
 * rounded-down share, and the paise left over go to the largest remainders.
 */
export function allocate(amount: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (amount <= 0 || sum <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (amount * w) / sum);
  const out = exact.map(Math.floor);
  const byRemainder = exact
    .map((x, i) => ({ i, rest: x - Math.floor(x) }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i);
  let left = amount - out.reduce((a, b) => a + b, 0);
  for (let k = 0; left > 0; k++, left--) out[byRemainder[k % byRemainder.length]!.i]! += 1;
  return out;
}

/**
 * The GST inside a tax-inclusive amount. Within the seller's state it's half
 * CGST and half SGST — worked out as one half and doubled, so the two are
 * always equal — and in any other state it's all IGST.
 */
export function split(grossPaise: number, rateBps: number, interState: boolean) {
  if (interState) {
    const igst = Math.round((grossPaise * rateBps) / (10_000 + rateBps));
    return { taxablePaise: grossPaise - igst, cgstPaise: 0, sgstPaise: 0, igstPaise: igst };
  }
  const half = Math.round((grossPaise * rateBps) / 2 / (10_000 + rateBps));
  return { taxablePaise: grossPaise - 2 * half, cgstPaise: half, sgstPaise: half, igstPaise: 0 };
}

/**
 * An order as invoice lines. The coupon discount is shared across the items
 * in proportion to their value (it came off the item subtotal), and delivery
 * is taxed as part of the goods: at the rate, and under the HSN code, of the
 * highest-rated item.
 */
export function taxLines(
  order: { items: TaxLineInput[]; discountPaise: number; shippingPaise: number; shippingMethod: string | null },
  interState: boolean,
): { lines: TaxLine[]; totals: TaxTotals } {
  const items = inOrder(order.items);
  const discounts = allocate(
    order.discountPaise,
    items.map((i) => i.lineTotalPaise),
  );

  const lines: TaxLine[] = items.map((item, n) => {
    const discountPaise = discounts[n]!;
    const totalPaise = item.lineTotalPaise - discountPaise;
    return {
      key: item.id ?? String(n),
      description: item.productName,
      detail: [item.shadeName && `Shade: ${item.shadeName}`, `SKU ${item.sku}`].filter(Boolean).join(" · "),
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      grossPaise: item.lineTotalPaise,
      discountPaise,
      rateBps: item.gstRateBps,
      totalPaise,
      ...split(totalPaise, item.gstRateBps, interState),
    };
  });

  if (order.shippingPaise > 0 && items.length > 0) {
    const principal = [...items].sort(
      (a, b) => b.gstRateBps - a.gstRateBps || b.lineTotalPaise - a.lineTotalPaise,
    )[0]!;
    lines.push({
      key: "delivery",
      description: "Delivery charges",
      detail: order.shippingMethod,
      hsnCode: principal.hsnCode,
      quantity: null,
      unitPricePaise: null,
      grossPaise: order.shippingPaise,
      discountPaise: 0,
      rateBps: principal.gstRateBps,
      totalPaise: order.shippingPaise,
      ...split(order.shippingPaise, principal.gstRateBps, interState),
    });
  }

  const sum = (pick: (l: TaxLine) => number) => lines.reduce((n, l) => n + pick(l), 0);
  const totals = {
    taxablePaise: sum((l) => l.taxablePaise),
    cgstPaise: sum((l) => l.cgstPaise),
    sgstPaise: sum((l) => l.sgstPaise),
    igstPaise: sum((l) => l.igstPaise),
    taxPaise: sum((l) => l.cgstPaise + l.sgstPaise + l.igstPaise),
    totalPaise: sum((l) => l.totalPaise),
  };
  return { lines, totals };
}

/**
 * Order lines in a fixed order (by id, which follows the cart), so the paisa
 * left over when a discount is shared always lands on the same line.
 */
function inOrder<T extends { id?: string }>(items: T[]) {
  return items.every((i) => i.id) ? [...items].sort((a, b) => (a.id! < b.id! ? -1 : a.id! > b.id! ? 1 : 0)) : items;
}

/**
 * What each order line actually cost the customer once the order's discount
 * is shared out — the fair default for a refund. Keyed by order line id.
 */
export function paidPerLine(order: { items: { id: string; lineTotalPaise: number }[]; discountPaise: number }) {
  const items = inOrder(order.items);
  const shares = allocate(order.discountPaise, items.map((i) => i.lineTotalPaise));
  return new Map(items.map((i, n) => [i.id, i.lineTotalPaise - shares[n]!]));
}

/* ── Amount in words, Indian style (lakh, crore) ── */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const upTo99 = (n: number) =>
  n < 20 ? ONES[n]! : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;

function words(n: number): string {
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor(n / 100_000) % 100;
  const thousand = Math.floor(n / 1000) % 100;
  const hundred = Math.floor(n / 100) % 10;
  const rest = n % 100;
  if (crore) parts.push(`${words(crore)} Crore`);
  if (lakh) parts.push(`${upTo99(lakh)} Lakh`);
  if (thousand) parts.push(`${upTo99(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(upTo99(rest));
  return parts.join(" ");
}

/** 249050 → "Rupees Two Thousand Four Hundred Ninety and Fifty Paise Only". */
export function rupeesInWords(paise: number) {
  const rupees = Math.floor(paise / 100);
  const p = paise % 100;
  return `Rupees ${words(rupees)}${p ? ` and ${upTo99(p)} Paise` : ""} Only`;
}
