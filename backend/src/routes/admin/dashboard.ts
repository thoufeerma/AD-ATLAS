import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { parse } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";

export const adminDashboardRouter = Router();

const DAY = 24 * 60 * 60 * 1000;

/** Orders that represent real, kept revenue. */
const REVENUE: Prisma.OrderWhereInput = {
  status: { notIn: ["PENDING", "CANCELLED", "REFUNDED"] },
};

/** Percentage change, or null when there is no prior period to compare to. */
const delta = (current: number, previous: number) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;

adminDashboardRouter.get("/", allow(...ROLES.dashboard), async (_req, res) => {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);
  const yearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    cur,
    prev,
    curCustomers,
    prevCustomers,
    monthly,
    topItems,
    recentOrders,
    activeProducts,
    counts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { ...REVENUE, placedAt: { gte: d30 } },
      _sum: { subtotalPaise: true, totalPaise: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { ...REVENUE, placedAt: { gte: d60, lt: d30 } },
      _sum: { subtotalPaise: true, totalPaise: true },
      _count: { _all: true },
    }),
    prisma.customer.count({ where: { createdAt: { gte: d30 } } }),
    prisma.customer.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    // Twelve calendar months, zero-filled, in a single grouped query.
    prisma.$queryRaw<{ month: Date; sales: bigint; orders: bigint }[]>`
      SELECT date_trunc('month', m) AS month,
             COALESCE(SUM(o."totalPaise"), 0) AS sales,
             COUNT(o.id) AS orders
      FROM generate_series(${yearAgo}::timestamp, date_trunc('month', now()), interval '1 month') AS m
      LEFT JOIN orders o
        ON date_trunc('month', o."placedAt") = date_trunc('month', m)
       AND o.status NOT IN ('PENDING', 'CANCELLED', 'REFUNDED')
      GROUP BY 1
      ORDER BY 1`,
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { productId: { not: null }, order: REVENUE },
      _sum: { lineTotalPaise: true, quantity: true },
      orderBy: { _sum: { lineTotalPaise: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 5,
      select: { number: true, shipName: true, totalPaise: true, status: true, placedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, stock: true, lowStockThreshold: true },
    }),
    Promise.all([
      prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.category.count(),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.customer.count(),
    ]),
  ]);

  const [productCount, categoryCount, reviewCount, pendingReviews, activeCoupons, customerCount] =
    counts;

  // Customer mix as three non-overlapping groups, by count of kept orders.
  const perCustomer = await prisma.order.groupBy({
    by: ["customerId"],
    where: { ...REVENUE, customerId: { not: null } },
    _count: { _all: true },
  });
  const repeat = perCustomer.filter((c) => c._count._all >= 2).length;
  const oneTime = perCustomer.filter((c) => c._count._all === 1).length;
  const customerSegments = {
    repeat,
    oneTime,
    noPurchase: Math.max(customerCount - repeat - oneTime, 0),
  };

  const sales = cur._sum.subtotalPaise ?? 0;
  const revenue = cur._sum.totalPaise ?? 0;
  const orders = cur._count._all;

  res.json({
    data: {
      kpis: {
        totalSalesPaise: { value: sales, delta: delta(sales, prev._sum.subtotalPaise ?? 0) },
        orders: { value: orders, delta: delta(orders, prev._count._all) },
        newCustomers: { value: curCustomers, delta: delta(curCustomers, prevCustomers) },
        revenuePaise: { value: revenue, delta: delta(revenue, prev._sum.totalPaise ?? 0) },
        averageOrderValuePaise: orders ? Math.round(revenue / orders) : 0,
      },
      // BigInt from raw SQL isn't JSON-serialisable; totals fit safely in a Number.
      salesByMonth: monthly.map((m) => ({
        month: m.month.toISOString().slice(0, 7),
        salesPaise: Number(m.sales),
        orders: Number(m.orders),
      })),
      topProducts: topItems.map((t) => ({
        productId: t.productId,
        name: t.productName,
        revenuePaise: t._sum.lineTotalPaise ?? 0,
        unitsSold: t._sum.quantity ?? 0,
      })),
      recentOrders,
      lowStock: activeProducts
        .filter((p) => p.stock <= p.lowStockThreshold)
        .sort((a, b) => a.stock - b.stock)
        .map(({ id, name, stock }) => ({ id, name, stock })),
      counters: {
        products: productCount,
        categories: categoryCount,
        reviews: reviewCount,
        pendingReviews,
        activeCoupons,
        customers: customerCount,
      },
      customerSegments,
    },
  });
});

/* ── Activity log ─────────────────────────────────────────────────────── */

export const adminActivityRouter = Router();

adminActivityRouter.get("/", allow(), async (req, res) => {
  const q = parse(
    z.object({
      entityType: z.string().optional(),
      take: z.coerce.number().int().min(1).max(200).default(100),
    }),
    req.query,
  );
  const rows = await prisma.activityLog.findMany({
    where: q.entityType ? { entityType: q.entityType } : {},
    orderBy: { createdAt: "desc" },
    take: q.take,
    include: { adminUser: { select: { name: true, email: true } } },
  });
  res.json({ data: rows });
});
