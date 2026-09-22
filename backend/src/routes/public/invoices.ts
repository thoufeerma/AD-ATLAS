import { Router } from "express";
import { prisma } from "../../db.js";
import { param } from "../../lib/http.js";
import { invoiceView, readInvoiceLink } from "../../lib/invoices.js";
import { creditNoteView } from "../../lib/creditNotes.js";
import { invoiceProblemPage, renderCreditNote, renderInvoice, sendInvoiceHtml } from "../../lib/invoiceHtml.js";

/**
 * A customer's GST invoice and credit notes, as printable pages. Reached
 * through the signed link that Track Order and the account's order history
 * hand out, so the link itself is the proof of ownership (see lib/invoices.ts).
 */
export const invoicesRouter = Router();

const EXPIRED = invoiceProblemPage(
  "This link has expired",
  "Invoice links work for a day. Open it again from Track Order or from your account's order history.",
);

/** The order id the request's signed link was made for, or null. */
async function linkedOrder(query: unknown) {
  const t = (query as { t?: unknown }).t;
  return typeof t === "string" && t ? readInvoiceLink(t) : null;
}

invoicesRouter.get("/orders/:number/invoice", async (req, res) => {
  const orderId = await linkedOrder(req.query);
  if (!orderId) {
    sendInvoiceHtml(res, 403, EXPIRED);
    return;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  // The link names one order; it can't be pointed at another number.
  const view = order && order.number === param(req, "number") ? invoiceView(order) : null;
  if (!view) {
    sendInvoiceHtml(res, 404, invoiceProblemPage("Invoice not found", "There's no invoice for this order yet."));
    return;
  }
  sendInvoiceHtml(res, 200, renderInvoice(view));
});

invoicesRouter.get("/orders/:number/credit-notes/:id", async (req, res) => {
  const orderId = await linkedOrder(req.query);
  if (!orderId) {
    sendInvoiceHtml(res, 403, EXPIRED);
    return;
  }
  const note = await prisma.creditNote.findUnique({
    where: { id: param(req, "id") },
    include: { order: { include: { items: true } }, returnRequest: { select: { number: true } } },
  });
  // Only a credit note of the order the link was made for.
  const view =
    note && note.orderId === orderId && note.order.number === param(req, "number")
      ? creditNoteView(note.order, note)
      : null;
  if (!view) {
    sendInvoiceHtml(res, 404, invoiceProblemPage("Credit note not found", "There's no such credit note for this order."));
    return;
  }
  sendInvoiceHtml(res, 200, renderCreditNote(view));
});
