import type { CreditNote, CreditNoteReason, Order, OrderItem, Prisma } from "../generated/prisma/client.js";
import { allocate, split, type TaxLine } from "./gst.js";
import { invoiceView, nextNumber } from "./invoices.js";

/**
 * GST credit notes: taking back part or all of an invoice when money goes
 * back to the customer. Issued automatically, inside the same transaction as
 * the change that causes it:
 *
 *   - a return marked refunded → the returned items, for the amount refunded
 *   - an invoiced order cancelled, or refunded as a whole → whatever of the
 *     invoice hasn't already been credited
 *
 * An order without an invoice gets none (there's nothing to reduce). Lines
 * are stored as issued, and the tax is reversed at the rates and in the form
 * (CGST + SGST or IGST) the invoice charged it.
 */

export type CreditLine = {
  /** The invoice line it reduces: an order line's id, or "delivery". */
  key: string;
  description: string;
  detail: string | null;
  hsnCode: string;
  /** Items taken back; null when only value is credited (delivery, goodwill). */
  quantity: number | null;
  rateBps: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
};

type Amounts = { totalPaise: number; taxablePaise: number; cgstPaise: number; sgstPaise: number; igstPaise: number };
const ZERO: Amounts = { totalPaise: 0, taxablePaise: 0, cgstPaise: 0, sgstPaise: 0, igstPaise: 0 };

type Remaining = { line: TaxLine; left: Amounts; quantity: number };

/** Each invoice line, less what earlier credit notes already took back. */
function remainingOf(lines: TaxLine[], earlier: Pick<CreditNote, "lines">[]) {
  const credited = new Map<string, Amounts & { quantity: number }>();
  for (const note of earlier) {
    for (const l of note.lines as CreditLine[]) {
      const c = credited.get(l.key) ?? { ...ZERO, quantity: 0 };
      c.totalPaise += l.totalPaise;
      c.taxablePaise += l.taxablePaise;
      c.cgstPaise += l.cgstPaise;
      c.sgstPaise += l.sgstPaise;
      c.igstPaise += l.igstPaise;
      c.quantity += l.quantity ?? 0;
      credited.set(l.key, c);
    }
  }
  return new Map<string, Remaining>(
    lines.map((line) => {
      const c = credited.get(line.key) ?? { ...ZERO, quantity: 0 };
      return [
        line.key,
        {
          line,
          quantity: (line.quantity ?? 0) - c.quantity,
          left: {
            totalPaise: line.totalPaise - c.totalPaise,
            taxablePaise: line.taxablePaise - c.taxablePaise,
            cgstPaise: line.cgstPaise - c.cgstPaise,
            sgstPaise: line.sgstPaise - c.sgstPaise,
            igstPaise: line.igstPaise - c.igstPaise,
          },
        },
      ];
    }),
  );
}

/**
 * Credits `amount` (GST included) of one invoice line. Taking all that's left
 * of it reverses exactly what's left, so a fully credited invoice nets to
 * zero to the paisa; a part is split afresh at the line's rate.
 */
function creditOf(
  r: Remaining,
  amount: number,
  quantity: number | null,
  interState: boolean,
  /** False when this note already credits part of the line elsewhere. */
  exactIfAll = true,
): CreditLine {
  const parts =
    exactIfAll && amount >= r.left.totalPaise
      ? r.left
      : { totalPaise: amount, ...split(amount, r.line.rateBps, interState) };
  return {
    key: r.line.key,
    description: r.line.description,
    detail: r.line.detail,
    hsnCode: r.line.hsnCode,
    quantity,
    rateBps: r.line.rateBps,
    taxablePaise: parts.taxablePaise,
    cgstPaise: parts.cgstPaise,
    sgstPaise: parts.sgstPaise,
    igstPaise: parts.igstPaise,
    totalPaise: parts.totalPaise,
  };
}

type OrderForCredit = Order & { items: OrderItem[]; creditNotes: Pick<CreditNote, "lines">[] };

/**
 * The lines for a returned-and-refunded request. The refund goes first to the
 * returned items, up to what was paid for them; anything more (the team
 * refunding delivery, or a goodwill top-up) goes to the delivery charge and
 * then to the rest of the order. Never more than the invoice has left.
 */
function returnLines(
  rem: Map<string, Remaining>,
  items: { orderItemId: string; quantity: number }[],
  refundPaise: number,
  interState: boolean,
) {
  const returned = items
    .map((i) => ({ r: rem.get(i.orderItemId), quantity: i.quantity }))
    .filter((x): x is { r: Remaining; quantity: number } => Boolean(x.r) && x.r!.left.totalPaise > 0)
    .map((x) => ({
      ...x,
      // What was paid for these units, after the order's discount.
      cap: Math.min(
        x.r.left.totalPaise,
        Math.round((x.r.line.totalPaise * x.quantity) / (x.r.line.quantity ?? x.quantity)),
      ),
    }));

  const onItems = allocate(
    Math.min(refundPaise, returned.reduce((n, x) => n + x.cap, 0)),
    returned.map((x) => x.cap),
  );
  const lines = returned.map((x, n) => creditOf(x.r, onItems[n]!, x.quantity, interState));
  let extra = refundPaise - onItems.reduce((a, b) => a + b, 0);

  const delivery = rem.get("delivery");
  if (extra > 0 && delivery && delivery.left.totalPaise > 0) {
    const take = Math.min(extra, delivery.left.totalPaise);
    lines.push(creditOf(delivery, take, null, interState));
    extra -= take;
  }

  if (extra > 0) {
    const taken = new Map(returned.map((x, n) => [x.r.line.key, onItems[n]!]));
    const others = [...rem.values()]
      .filter((r) => r.line.key !== "delivery")
      .map((r) => ({ r, room: r.left.totalPaise - (taken.get(r.line.key) ?? 0) }))
      .filter((o) => o.room > 0);
    const shares = allocate(
      Math.min(extra, others.reduce((n, o) => n + o.room, 0)),
      others.map((o) => o.room),
    );
    others.forEach((o, n) => {
      const untouched = !taken.get(o.r.line.key);
      if (shares[n]! > 0) lines.push(creditOf(o.r, shares[n]!, null, interState, untouched));
    });
  }
  return lines;
}

/**
 * Issues a credit note against the order's invoice, inside the caller's
 * transaction. Returns null when there's nothing to credit: no invoice, a
 * zero refund, or an invoice already credited in full.
 */
export async function issueCreditNote(
  tx: Prisma.TransactionClient,
  order: OrderForCredit,
  reason: CreditNoteReason,
  ret?: { id: string; refundPaise: number; items: { orderItemId: string; quantity: number }[] },
) {
  const view = invoiceView(order);
  if (!view) return null;
  const rem = remainingOf(view.lines, order.creditNotes);

  const lines =
    reason === "RETURN" && ret
      ? returnLines(rem, ret.items, ret.refundPaise, view.interState)
      : [...rem.values()]
          .filter((r) => r.left.totalPaise > 0)
          .map((r) => creditOf(r, r.left.totalPaise, r.line.quantity == null ? null : r.quantity, view.interState));

  const kept = lines.filter((l) => l.totalPaise > 0);
  if (kept.length === 0) return null;

  const now = new Date();
  const { fy, serial } = await nextNumber(tx, "CN", now);
  const sum = (pick: (l: CreditLine) => number) => kept.reduce((n, l) => n + pick(l), 0);
  return tx.creditNote.create({
    data: {
      number: `CN/${fy}/${serial}`,
      reason,
      orderId: order.id,
      returnId: ret?.id ?? null,
      lines: kept,
      taxablePaise: sum((l) => l.taxablePaise),
      cgstPaise: sum((l) => l.cgstPaise),
      sgstPaise: sum((l) => l.sgstPaise),
      igstPaise: sum((l) => l.igstPaise),
      totalPaise: sum((l) => l.totalPaise),
      issuedAt: now,
    },
  });
}

/* ── Reading a credit note ── */

export type CreditNoteView = ReturnType<typeof creditNoteView>;

/** A credit note with the invoice it reduces, for printing. Null if the order has no invoice. */
export function creditNoteView(
  order: Order & { items: OrderItem[] },
  note: CreditNote & { returnRequest?: { number: string } | null },
) {
  const invoice = invoiceView(order);
  if (!invoice) return null;
  return {
    note: { ...note, lines: note.lines as CreditLine[] },
    invoice,
    returnNumber: note.returnRequest?.number ?? null,
  };
}
