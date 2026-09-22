import { Router } from "express";
import { prisma } from "../../db.js";
import { param } from "../../lib/http.js";
import { invoiceView, readInvoiceLink } from "../../lib/invoices.js";
import { invoiceProblemPage, renderInvoice, sendInvoiceHtml } from "../../lib/invoiceHtml.js";

/**
 * A customer's GST invoice, as a printable page. Reached through the signed
 * link that Track Order and the account's order history hand out, so the
 * link itself is the proof of ownership (see lib/invoices.ts).
 */
export const invoicesRouter = Router();

invoicesRouter.get("/orders/:number/invoice", async (req, res) => {
  const token = typeof req.query.t === "string" ? req.query.t : "";
  const orderId = token ? await readInvoiceLink(token) : null;
  if (!orderId) {
    sendInvoiceHtml(
      res,
      403,
      invoiceProblemPage(
        "This invoice link has expired",
        "Invoice links work for a day. Open the invoice again from Track Order or from your account's order history.",
      ),
    );
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
