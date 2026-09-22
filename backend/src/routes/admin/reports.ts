import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { parse } from "../../lib/http.js";
import { delta, monthsAgo, REVENUE } from "../../lib/revenue.js";
import { istMonth, istMonthOf, stateForGstin } from "../../lib/gst.js";
import { invoiceView, taxSettings } from "../../lib/invoices.js";
import { creditNoteView } from "../../lib/creditNotes.js";

/**
 * Sales, product and customer reports, all read from the orders the store has
 * actually taken. Each report covers the last 12 calendar months and compares
 * with the 12 before it, so a new store shows zeroes rather than invented
 * figures; comparisons are null until there is a prior period to compare to.
 */
export const adminReportsRouter = Router();

const MONTHS = 12;

/** Totals for one window of orders. */
async function totals(from: Date, to?: Date) {
  const where = { ...REVENUE, placedAt: to ? { gte: from, lt: to } : { gte: from } };
  const [orders, items] = await Promise.all([
    prisma.order.aggregate({ where, _sum: { totalPaise: true, discountPaise: true }, _count: { _all: true } }),
    prisma.orderItem.aggregate({ where: { order: where }, _sum: { quantity: true } }),
  ]);
  const revenuePaise = orders._sum.totalPaise ?? 0;
  const count = orders._count._all;
  return {
    revenuePaise,
    orders: count,
    unitsSold: items._sum.quantity ?? 0,
    discountPaise: orders._sum.discountPaise ?? 0,
    aovPaise: count === 0 ? 0 : Math.round(revenuePaise / count),
  };
}

adminReportsRouter.get("/sales", allow(...ROLES.dashboard), async (_req, res) => {
  const start = monthsAgo(MONTHS - 1);
  const priorStart = monthsAgo(MONTHS * 2 - 1);

  const [current, previous, monthly] = await Promise.all([
    totals(start),
    totals(priorStart, start),
    // Zero-filled calendar months, so a quiet month is a gap in the line
    // rather than a missing point.
    prisma.$queryRaw<{ month: Date; revenue: bigint; orders: bigint }[]>`
      SELECT date_trunc('month', m) AS month,
             COALESCE(SUM(o."totalPaise"), 0) AS revenue,
             COUNT(o.id) AS orders
      FROM generate_series(
             date_trunc('month', now()) - make_interval(months => ${MONTHS - 1}),
             date_trunc('month', now()),
             interval '1 month') AS m
      LEFT JOIN orders o
        ON date_trunc('month', o."placedAt") = date_trunc('month', m)
       AND o.status NOT IN ('PENDING', 'CANCELLED', 'REFUNDED')
      GROUP BY 1
      ORDER BY 1`,
  ]);

  const months = monthly.map((r) => ({
    month: r.month.toISOString().slice(0, 7),
    revenuePaise: Number(r.revenue),
    orders: Number(r.orders),
  }));
  const best = months.reduce<(typeof months)[number] | null>(
    (top, m) => (m.revenuePaise > 0 && (!top || m.revenuePaise > top.revenuePaise) ? m : top),
    null,
  );

  res.json({
    data: {
      months,
      best,
      totals: current,
      change: {
        revenue: delta(current.revenuePaise, previous.revenuePaise),
        orders: delta(current.orders, previous.orders),
        aov: delta(current.aovPaise, previous.aovPaise),
      },
    },
  });
});

adminReportsRouter.get("/products", allow(...ROLES.dashboard), async (_req, res) => {
  const where = { ...REVENUE, placedAt: { gte: monthsAgo(MONTHS - 1) } };

  const [sold, products] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null }, order: where },
      _sum: { lineTotalPaise: true, quantity: true },
    }),
    prisma.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: {
        id: true,
        name: true,
        sku: true,
        pricePaise: true,
        status: true,
        stock: true,
        category: { select: { slug: true, name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const sales = new Map(sold.map((s) => [s.productId!, s]));
  const rows = products.map((p) => {
    const s = sales.get(p.id);
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      pricePaise: p.pricePaise,
      status: p.status,
      stock: p.stock,
      category: p.category,
      revenuePaise: s?._sum.lineTotalPaise ?? 0,
      unitsSold: s?._sum.quantity ?? 0,
    };
  });

  const byCategory = new Map<string, { slug: string; name: string; revenuePaise: number; unitsSold: number }>();
  for (const r of rows) {
    const c = byCategory.get(r.category.slug) ?? { ...r.category, revenuePaise: 0, unitsSold: 0 };
    c.revenuePaise += r.revenuePaise;
    c.unitsSold += r.unitsSold;
    byCategory.set(r.category.slug, c);
  }

  res.json({
    data: {
      top: [...rows].sort((a, b) => b.revenuePaise - a.revenuePaise).filter((r) => r.revenuePaise > 0).slice(0, 10),
      byCategory: [...byCategory.values()].sort((a, b) => b.revenuePaise - a.revenuePaise),
      // Products on sale that nobody has bought in the period — the ones worth
      // a second look, so archived and draft products are left out.
      neverSold: rows.filter((r) => r.unitsSold === 0),
      totals: {
        products: rows.length,
        sellingProducts: rows.filter((r) => r.unitsSold > 0).length,
        unitsSold: rows.reduce((n, r) => n + r.unitsSold, 0),
        revenuePaise: rows.reduce((n, r) => n + r.revenuePaise, 0),
      },
    },
  });
});

adminReportsRouter.get("/customers", allow(...ROLES.ordersRead), async (_req, res) => {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const prevMonthStart = monthsAgo(1);

  const [people, spendByCustomer, newByMonth, accounts, newThisMonth, newLastMonth] = await Promise.all([
    prisma.customer.findMany({ select: { id: true, name: true, email: true, passwordHash: true } }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { ...REVENUE, customerId: { not: null } },
      _sum: { totalPaise: true },
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ month: Date; people: bigint }[]>`
      SELECT date_trunc('month', m) AS month, COUNT(c.id) AS people
      FROM generate_series(
             date_trunc('month', now()) - make_interval(months => ${MONTHS - 1}),
             date_trunc('month', now()),
             interval '1 month') AS m
      LEFT JOIN customers c ON date_trunc('month', c."createdAt") = date_trunc('month', m)
      GROUP BY 1
      ORDER BY 1`,
    prisma.customer.count({ where: { passwordHash: { not: null } } }),
    prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.customer.count({ where: { createdAt: { gte: prevMonthStart, lt: monthStart } } }),
  ]);

  const spend = new Map(spendByCustomer.map((s) => [s.customerId!, s]));
  const withOrders = people
    .map((p) => ({
      name: p.name,
      email: p.email,
      hasAccount: p.passwordHash !== null,
      orders: spend.get(p.id)?._count._all ?? 0,
      spentPaise: spend.get(p.id)?._sum.totalPaise ?? 0,
    }))
    .sort((a, b) => b.spentPaise - a.spentPaise);

  const buyers = withOrders.filter((c) => c.orders > 0);
  const repeat = buyers.filter((c) => c.orders > 1);

  res.json({
    data: {
      totals: {
        customers: people.length,
        accounts,
        buyers: buyers.length,
        newThisMonth,
        repeatRatePct: buyers.length === 0 ? 0 : Math.round((repeat.length / buyers.length) * 1000) / 10,
        avgLifetimePaise: buyers.length === 0 ? 0 : Math.round(buyers.reduce((n, c) => n + c.spentPaise, 0) / buyers.length),
      },
      change: { newThisMonth: delta(newThisMonth, newLastMonth) },
      // Everyone who has an email on file, grouped by how often they've bought.
      segments: [
        { label: "Yet to order", count: withOrders.length - buyers.length },
        { label: "One order", count: buyers.length - repeat.length },
        { label: "Two to four", count: repeat.filter((c) => c.orders < 5).length },
        { label: "Five or more", count: repeat.filter((c) => c.orders >= 5).length },
      ],
      newByMonth: newByMonth.map((r) => ({ month: r.month.toISOString().slice(0, 7), count: Number(r.people) })),
      top: buyers.slice(0, 10),
    },
  });
});

/* ── GST summary ──────────────────────────────────────────────────────── */

const GstQuery = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use a month like 2026-09")
    .optional(),
});

type Sums = { taxablePaise: number; cgstPaise: number; sgstPaise: number; igstPaise: number; totalPaise: number };
const zero = (): Sums => ({ taxablePaise: 0, cgstPaise: 0, sgstPaise: 0, igstPaise: 0, totalPaise: 0 });
/** Adds (sign 1) or takes away (sign -1) one document's or line's amounts. */
const add = (into: Sums, from: Sums, sign = 1) => {
  into.taxablePaise += sign * from.taxablePaise;
  into.cgstPaise += sign * from.cgstPaise;
  into.sgstPaise += sign * from.sgstPaise;
  into.igstPaise += sign * from.igstPaise;
  into.totalPaise += sign * from.totalPaise;
};
const amounts = (s: Sums): Sums => ({
  taxablePaise: s.taxablePaise,
  cgstPaise: s.cgstPaise,
  sgstPaise: s.sgstPaise,
  igstPaise: s.igstPaise,
  totalPaise: s.totalPaise,
});

/**
 * The month's invoices and credit notes the way GST returns ask for them:
 * both registers, and totals by place of supply and rate, and by HSN code,
 * with credit notes taken off. Months run in IST, by document date.
 */
adminReportsRouter.get("/gst", allow(...ROLES.ordersRead), async (req, res) => {
  const q = parse(GstQuery, req.query);
  const thisMonth = istMonthOf(new Date());
  const month = q.month ?? thisMonth;
  const { from, to } = istMonth(month);

  const [orders, notes, tax, first] = await Promise.all([
    prisma.order.findMany({
      where: { invoicedAt: { gte: from, lt: to } },
      include: { items: true },
      orderBy: { invoicedAt: "asc" },
    }),
    prisma.creditNote.findMany({
      where: { issuedAt: { gte: from, lt: to } },
      include: { order: { include: { items: true } }, returnRequest: { select: { number: true } } },
      orderBy: { issuedAt: "asc" },
    }),
    taxSettings(),
    prisma.order.findFirst({
      where: { invoicedAt: { not: null } },
      orderBy: { invoicedAt: "asc" },
      select: { invoicedAt: true },
    }),
  ]);

  // The months there's anything to show, newest first, for the picker.
  const months: string[] = [];
  const oldest = first?.invoicedAt ? istMonthOf(first.invoicedAt) : thisMonth;
  for (let [y, m] = thisMonth.split("-").map(Number) as [number, number]; months.length < 36; ) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    months.push(key);
    if (key <= oldest) break;
    [y, m] = m === 1 ? [y - 1, 12] : [y, m - 1];
  }

  const byState = new Map<string, Sums & { state: string; stateCode: string | null; rateBps: number }>();
  const byHsn = new Map<string, Sums & { hsnCode: string; rateBps: number; quantity: number }>();
  const tally = (
    state: { name: string; code: string | null },
    line: Sums & { hsnCode: string; rateBps: number; quantity: number | null },
    sign: 1 | -1,
  ) => {
    const sKey = `${state.code ?? state.name}|${line.rateBps}`;
    const s = byState.get(sKey) ?? { ...zero(), state: state.name, stateCode: state.code, rateBps: line.rateBps };
    add(s, line, sign);
    byState.set(sKey, s);

    const hKey = `${line.hsnCode}|${line.rateBps}`;
    const h = byHsn.get(hKey) ?? { ...zero(), hsnCode: line.hsnCode, rateBps: line.rateBps, quantity: 0 };
    add(h, line, sign);
    h.quantity += sign * (line.quantity ?? 0);
    byHsn.set(hKey, h);
  };

  const invoiced = { ...zero(), count: 0 };
  const invoices = [];
  for (const order of orders) {
    const v = invoiceView(order);
    if (!v) continue;
    const state = { name: v.placeOfSupply?.name ?? order.shipState, code: v.placeOfSupply?.code ?? null };
    invoices.push({
      number: v.number,
      issuedAt: v.issuedAt,
      orderNumber: order.number,
      customer: order.shipName,
      state: state.name,
      stateCode: state.code,
      status: order.status,
      ...amounts(v.totals),
    });
    invoiced.count += 1;
    add(invoiced, v.totals);
    for (const line of v.lines) tally(state, line, 1);
  }

  const credited = { ...zero(), count: 0 };
  const creditNotes = [];
  for (const note of notes) {
    const v = creditNoteView(note.order, note);
    if (!v) continue;
    const state = {
      name: v.invoice.placeOfSupply?.name ?? note.order.shipState,
      code: v.invoice.placeOfSupply?.code ?? null,
    };
    creditNotes.push({
      id: note.id,
      number: note.number,
      issuedAt: note.issuedAt,
      reason: note.reason,
      returnNumber: v.returnNumber,
      invoiceNumber: v.invoice.number,
      orderNumber: note.order.number,
      customer: note.order.shipName,
      state: state.name,
      stateCode: state.code,
      ...amounts(note),
    });
    credited.count += 1;
    add(credited, note);
    for (const line of v.note.lines) tally(state, line, -1);
  }

  const net = zero();
  add(net, invoiced);
  add(net, credited, -1);

  res.json({
    data: {
      month,
      months,
      seller: tax.gstin ? { gstin: tax.gstin, legalName: tax.legalName, state: stateForGstin(tax.gstin) } : null,
      totals: { invoices: invoiced, creditNotes: credited, net },
      invoices,
      creditNotes,
      // Net of credit notes, which is how they're reported for sales to consumers.
      byState: [...byState.values()]
        .filter((s) => s.totalPaise !== 0)
        .sort((a, b) => a.state.localeCompare(b.state) || a.rateBps - b.rateBps),
      byHsn: [...byHsn.values()]
        .filter((h) => h.totalPaise !== 0 || h.quantity !== 0)
        .sort((a, b) => a.hsnCode.localeCompare(b.hsnCode) || a.rateBps - b.rateBps),
    },
  });
});
