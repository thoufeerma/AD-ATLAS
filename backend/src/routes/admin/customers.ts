import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../db.js";
import { notFound, param, parse } from "../../lib/http.js";
import { allow, ROLES } from "../../middleware/auth.js";

export const adminCustomersRouter = Router();

const ListQuery = z.object({
  q: z.string().trim().optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

/** Revenue only counts orders that actually brought money in. */
const COUNTED: Prisma.OrderWhereInput = { status: { notIn: ["CANCELLED", "REFUNDED", "PENDING"] } };

adminCustomersRouter.get("/", allow(...ROLES.ordersRead), async (req, res) => {
  const q = parse(ListQuery, req.query);
  const where: Prisma.CustomerWhereInput = q.q
    ? {
        OR: [
          { name: { contains: q.q, mode: "insensitive" } },
          { email: { contains: q.q, mode: "insensitive" } },
          { phone: { contains: q.q } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: q.take,
      skip: q.skip,
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    }),
    prisma.customer.count({ where }),
  ]);

  const stats = await prisma.order.groupBy({
    by: ["customerId"],
    where: { customerId: { in: customers.map((c) => c.id) }, ...COUNTED },
    _count: { _all: true },
    _sum: { totalPaise: true },
    _max: { placedAt: true },
  });
  const byId = new Map(stats.map((s) => [s.customerId, s]));

  res.json({
    data: customers.map((c) => {
      const s = byId.get(c.id);
      return {
        ...c,
        orderCount: s?._count._all ?? 0,
        lifetimeValuePaise: s?._sum.totalPaise ?? 0,
        lastOrderAt: s?._max.placedAt ?? null,
      };
    }),
    meta: { total, take: q.take, skip: q.skip },
  });
});

adminCustomersRouter.get("/:id", allow(...ROLES.ordersRead), async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: param(req, "id") },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { placedAt: "desc" },
        select: { number: true, status: true, totalPaise: true, placedAt: true },
      },
    },
  });
  if (!customer) throw notFound("Customer");
  res.json({ data: customer });
});
