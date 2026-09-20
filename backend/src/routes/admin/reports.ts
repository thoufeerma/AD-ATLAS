import { Router } from "express";
import { prisma } from "../../db.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { delta, monthsAgo, REVENUE } from "../../lib/revenue.js";

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
