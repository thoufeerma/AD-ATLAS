import { createHash } from "node:crypto";
import type { Response } from "express";
import type { CreditNoteReason, Order } from "../generated/prisma/client.js";
import { env } from "../env.js";
import { formatInr } from "./money.js";
import { rupeesInWords, type GstState } from "./gst.js";
import type { InvoiceSeller, InvoiceView } from "./invoices.js";
import type { CreditNoteView } from "./creditNotes.js";

/**
 * The printable tax invoice and credit note: self-contained HTML pages, laid
 * out for A4. The shopper or the team opens one in a new tab and prints it, or
 * saves it as a PDF from the print dialog. Served with its own strict CSP — the only
 * script allowed is the print button's, pinned by hash.
 */

const esc = (s: string | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escLines = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

/** ₹1,234.50 with the paise always shown, as accounts expect. */
const money = (paise: number) =>
  "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (bps: number) => `${bps / 100}%`;

const day = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

const PAYMENT: Record<string, string> = {
  COD: "Cash on delivery",
  UPI: "UPI",
  CARD: "Card",
  NETBANKING: "Net banking",
  WALLET: "Wallet",
};

const PRINT_SCRIPT = `document.getElementById("print").addEventListener("click",function(){window.print()});`;
const PRINT_HASH = createHash("sha256").update(PRINT_SCRIPT).digest("base64");
const STORE_ORIGIN = new URL(env.STORE_URL).origin;

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#f4eff1;color:#2a122b;font:12px/1.45 Arial,Helvetica,sans-serif}
.bar{max-width:210mm;margin:0 auto;padding:14px 0;display:flex;justify-content:space-between;align-items:center;gap:12px}
.bar p{margin:0;color:#6b5a63}
.bar button{background:#2a122b;color:#fff;border:0;border-radius:4px;padding:9px 16px;font:600 12px Arial,Helvetica,sans-serif;cursor:pointer}
.page{max-width:210mm;margin:0 auto 32px;background:#fff;padding:14mm;box-shadow:0 1px 4px rgba(42,18,43,.12)}
.top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}
.top img{height:44px;width:auto}
.title{text-align:right}
.title h1{margin:0;font-size:20px;letter-spacing:.08em}
.title p{margin:2px 0 0;color:#6b5a63}
.notice{margin:14px 0 0;padding:8px 12px;border-radius:4px;background:#fbeaea;color:#8a1c1c;font-weight:600}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px;padding-top:14px;border-top:2px solid #2a122b}
h2{margin:0 0 4px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6b5a63}
.parties p{margin:0}
.strong{font-weight:700}
dl{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin:0}
dt{color:#6b5a63}
dd{margin:0}
table{width:100%;border-collapse:collapse}
.lines{margin-top:18px;overflow-x:auto}
.lines table{min-width:640px}
th{font-size:9.5px;text-transform:uppercase;letter-spacing:.04em;color:#6b5a63;text-align:right;padding:6px 5px;border-bottom:1px solid #2a122b;vertical-align:bottom}
td{text-align:right;padding:7px 5px;border-bottom:1px solid #e8dde2;vertical-align:top;white-space:nowrap}
th:nth-child(-n+3),td:nth-child(-n+3){text-align:left}
td.item{white-space:normal;min-width:150px}
td.item small{display:block;color:#6b5a63}
tfoot td{font-weight:700;border-bottom:2px solid #2a122b}
.sums{display:flex;justify-content:space-between;gap:24px;margin-top:14px}
.words{max-width:60%}
.sums table{width:auto;margin:0;min-width:240px}
.sums td{border:0;padding:3px 0 3px 18px}
.sums td:first-child{text-align:left;color:#6b5a63;padding-left:0}
.sums tr.total td{border-top:1px solid #2a122b;font-weight:700;font-size:13px;padding-top:6px;color:#2a122b}
.foot{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:28px;padding-top:14px;border-top:1px solid #e8dde2;color:#6b5a63;font-size:11px}
.sign{text-align:right;color:#2a122b}
.sign p{margin:0}
.sign .line{margin-top:34px;padding-top:4px;border-top:1px solid #2a122b;color:#6b5a63}
@page{size:A4;margin:10mm}
@media print{body{background:#fff}.bar{display:none}.page{box-shadow:none;margin:0;max-width:none;padding:0}.lines{overflow:visible}}
@media (max-width:760px){.bar{padding:12px 16px}.page{padding:16px;margin-bottom:0}.parties{grid-template-columns:1fr}.sums{flex-direction:column}.words{max-width:none}table{font-size:11px}.top img{height:34px}}
`;

type DocLine = {
  description: string;
  detail: string | null;
  hsnCode: string;
  quantity: number | null;
  unitPricePaise?: number | null;
  grossPaise?: number;
  discountPaise?: number;
  taxablePaise: number;
  rateBps: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
};

type Totals = { taxablePaise: number; cgstPaise: number; sgstPaise: number; igstPaise: number; totalPaise: number };

/** What an invoice and a credit note share: the parties, the lines and the sums. */
type Doc = {
  title: "TAX INVOICE" | "CREDIT NOTE";
  number: string;
  /** Rows for the box beside the seller, e.g. invoice number and date. */
  facts: [string, string][];
  seller: InvoiceSeller;
  order: Order;
  placeOfSupply: GstState | null;
  interState: boolean;
  lines: DocLine[];
  totals: Totals;
  /** Gross and discount columns: on the invoice, not on a credit note. */
  showGross: boolean;
  totalLabel: string;
  notice: string | null;
  note: string | null;
  footer: string;
};

function renderDoc(d: Doc) {
  const { seller, order: o, lines, totals, interState, placeOfSupply } = d;
  const taxHead = interState ? `<th>IGST</th>` : `<th>CGST</th><th>SGST</th>`;
  const taxCells = (l: Pick<DocLine, "rateBps" | "cgstPaise" | "sgstPaise" | "igstPaise">) =>
    interState
      ? `<td>${money(l.igstPaise)}<br><small>${pct(l.rateBps)}</small></td>`
      : `<td>${money(l.cgstPaise)}<br><small>${pct(l.rateBps / 2)}</small></td><td>${money(l.sgstPaise)}<br><small>${pct(l.rateBps / 2)}</small></td>`;
  const grossHead = d.showGross ? `<th>Gross</th><th>Discount</th>` : "";
  const grossCells = (l: DocLine) =>
    d.showGross
      ? `<td>${money(l.grossPaise ?? l.totalPaise)}</td><td>${l.discountPaise ? `−${money(l.discountPaise)}` : "—"}</td>`
      : "";

  const rows = lines
    .map(
      (l, i) => `<tr>
<td>${i + 1}</td>
<td class="item">${esc(l.description)}${l.detail ? `<small>${esc(l.detail)}</small>` : ""}${
        l.quantity != null && l.unitPricePaise != null
          ? `<small>${l.quantity} × ${esc(formatInr(l.unitPricePaise))} (incl. GST)</small>`
          : ""
      }</td>
<td>${esc(l.hsnCode)}</td>
<td>${l.quantity ?? ""}</td>
${grossCells(l)}
<td>${money(l.taxablePaise)}</td>
${taxCells(l)}
<td>${money(l.totalPaise)}</td>
</tr>`,
    )
    .join("\n");

  const quantity = lines.reduce((n, l) => n + (l.quantity ?? 0), 0);
  const discount = lines.reduce((n, l) => n + (l.discountPaise ?? 0), 0);
  const gross = lines.reduce((n, l) => n + (l.grossPaise ?? l.totalPaise), 0);
  const grossTotals = d.showGross ? `<td>${money(gross)}</td><td>${discount ? `−${money(discount)}` : "—"}</td>` : "";
  const taxTotals = interState
    ? `<td>${money(totals.igstPaise)}</td>`
    : `<td>${money(totals.cgstPaise)}</td><td>${money(totals.sgstPaise)}</td>`;
  const sums = interState
    ? `<tr><td>IGST</td><td>${money(totals.igstPaise)}</td></tr>`
    : `<tr><td>CGST</td><td>${money(totals.cgstPaise)}</td></tr><tr><td>SGST</td><td>${money(totals.sgstPaise)}</td></tr>`;

  const shipTo = [o.shipLine1, o.shipLine2, `${o.shipCity}, ${o.shipState} – ${o.shipPincode}`, o.shipCountry]
    .filter(Boolean)
    .map((line) => esc(line))
    .join("<br>");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${d.title === "CREDIT NOTE" ? "Credit note" : "Invoice"} ${esc(d.number)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="bar"><p>${d.title === "CREDIT NOTE" ? "Credit note" : "Tax invoice"} ${esc(d.number)}</p><button id="print" type="button">Print or save as PDF</button></div>
<main class="page">
  <div class="top">
    <img src="${esc(env.STORE_URL)}/brand/logo.png" alt="${esc(seller.tradeName)}">
    <div class="title">
      <h1>${d.title}</h1>
      <p>Original for recipient</p>
    </div>
  </div>
  ${d.notice ? `<p class="notice">${esc(d.notice)}</p>` : ""}

  <section class="parties">
    <div>
      <h2>Sold by</h2>
      <p class="strong">${esc(seller.legalName)}</p>
      <p>${escLines(seller.address)}</p>
      <p>GSTIN <span class="strong">${esc(seller.gstin)}</span></p>
      <p>State: ${esc(seller.stateName)} (${esc(seller.stateCode)})</p>
      ${seller.email || seller.phone ? `<p>${[seller.email, seller.phone].filter(Boolean).map(esc).join(" · ")}</p>` : ""}
    </div>
    <div>
      <dl>
${d.facts.map(([k, v], i) => `        <dt>${esc(k)}</dt><dd${i === 0 ? ' class="strong"' : ""}>${esc(v)}</dd>`).join("\n")}
      </dl>
    </div>
    <div>
      <h2>Billed and shipped to</h2>
      <p class="strong">${esc(o.shipName)}</p>
      <p>${shipTo}</p>
      <p>Phone +91 ${esc(o.shipPhone)}</p>
    </div>
    <div>
      <dl>
        <dt>Place of supply</dt><dd>${esc(placeOfSupply?.name ?? o.shipState)}${placeOfSupply ? ` (${placeOfSupply.code})` : ""}</dd>
        <dt>Supply</dt><dd>${interState ? "Inter-state (IGST)" : "Intra-state (CGST + SGST)"}</dd>
        <dt>Reverse charge</dt><dd>No</dd>
      </dl>
    </div>
  </section>

  <div class="lines">
  <table>
    <thead>
      <tr><th>#</th><th>Item</th><th>HSN</th><th>Qty</th>${grossHead}<th>Taxable value</th>${taxHead}<th>Total</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
    <tfoot>
      <tr><td></td><td>Total</td><td></td><td>${quantity || ""}</td>${grossTotals}<td>${money(totals.taxablePaise)}</td>${taxTotals}<td>${money(totals.totalPaise)}</td></tr>
    </tfoot>
  </table>
  </div>

  <div class="sums">
    <div class="words">
      <h2>Amount in words</h2>
      <p>${esc(rupeesInWords(totals.totalPaise))}</p>
      ${d.note ? `<p style="margin-top:8px;color:#6b5a63">${esc(d.note)}</p>` : ""}
    </div>
    <table>
      <tr><td>Taxable value</td><td>${money(totals.taxablePaise)}</td></tr>
      ${sums}
      <tr class="total"><td>${esc(d.totalLabel)}</td><td>${money(totals.totalPaise)}</td></tr>
    </table>
  </div>

  <div class="foot">
    <p>${esc(d.footer)}</p>
    <div class="sign">
      <p>For ${esc(seller.legalName)}</p>
      <p class="line">Authorised signatory</p>
    </div>
  </div>
</main>
<script>${PRINT_SCRIPT}</script>
</body>
</html>`;
}

const paymentLine = (o: Order) => {
  const status =
    o.paymentStatus === "PAID"
      ? "paid"
      : o.paymentStatus === "REFUNDED"
        ? "refunded"
        : o.paymentMethod === "COD"
          ? "not yet collected"
          : "awaiting payment";
  return `${PAYMENT[o.paymentMethod ?? ""] ?? "—"} · ${status}`;
};

export function renderInvoice(v: NonNullable<InvoiceView>) {
  const o = v.order;
  return renderDoc({
    title: "TAX INVOICE",
    number: v.number,
    facts: [
      ["Invoice no.", v.number],
      ["Invoice date", day(v.issuedAt)],
      ["Order no.", o.number],
      ["Order date", day(o.placedAt)],
      ["Payment", paymentLine(o)],
    ],
    seller: v.seller,
    order: o,
    placeOfSupply: v.placeOfSupply,
    interState: v.interState,
    lines: v.lines,
    totals: v.totals,
    showGross: true,
    totalLabel: "Invoice total",
    notice:
      o.status === "CANCELLED"
        ? "This order was cancelled after the invoice was issued; see the credit note."
        : o.status === "REFUNDED"
          ? "This order was refunded; see the credit note."
          : null,
    note: o.couponCode ? `Coupon ${o.couponCode} applied; its discount is shared across the items above.` : null,
    footer: "Prices include GST. This is a computer-generated invoice.",
  });
}

const CREDIT_REASON: Record<CreditNoteReason, string> = {
  RETURN: "Goods returned",
  CANCELLATION: "Order cancelled",
  REFUND: "Order refunded",
};

export function renderCreditNote(v: NonNullable<CreditNoteView>) {
  const { note, invoice } = v;
  return renderDoc({
    title: "CREDIT NOTE",
    number: note.number,
    facts: [
      ["Credit note no.", note.number],
      ["Date", day(note.issuedAt)],
      ["Against invoice", invoice.number],
      ["Invoice date", day(invoice.issuedAt)],
      ["Order no.", invoice.order.number],
      ["Reason", v.returnNumber ? `${CREDIT_REASON[note.reason]} (return ${v.returnNumber})` : CREDIT_REASON[note.reason]],
    ],
    seller: invoice.seller,
    order: invoice.order,
    placeOfSupply: invoice.placeOfSupply,
    interState: invoice.interState,
    lines: note.lines,
    totals: note,
    showGross: false,
    totalLabel: "Credit note total",
    notice: null,
    note: `Reduces invoice ${invoice.number} by this amount, with the GST charged on it.`,
    footer: "This is a computer-generated credit note.",
  });
}

/** A short page for a link that no longer works, in the invoice's own style. */
export function invoiceProblemPage(title: string, message: string) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title><style>${CSS}</style></head>
<body><main class="page" style="margin-top:32px"><h1 style="margin:0 0 8px;font-size:18px">${esc(title)}</h1><p style="margin:0;color:#6b5a63">${esc(message)}</p></main></body></html>`;
}

/** Sends an invoice page with headers that keep it private and script-free. */
export function sendInvoiceHtml(res: Response, status: number, html: string) {
  res
    .status(status)
    .set({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      // The address carries the key: never hand it to another site.
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": [
        "default-src 'none'",
        "style-src 'unsafe-inline'",
        `img-src ${STORE_ORIGIN} data:`,
        `script-src 'sha256-${PRINT_HASH}'`,
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
      ].join("; "),
    })
    .send(html);
}
