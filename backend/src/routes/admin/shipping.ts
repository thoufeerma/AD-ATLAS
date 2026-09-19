import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db.js";
import { conflict, notFound, param, parse, parsePatch } from "../../lib/http.js";
import { logActivity } from "../../lib/activity.js";
import { allow, ROLES } from "../../middleware/auth.js";
import { formatInr } from "../../lib/money.js";

/**
 * Shipping methods offered at checkout. The enabled ones are shown to the
 * shopper in this order, and the first is the default (it's also the one the
 * storefront's "free shipping above…" messages and policy tokens describe).
 *
 * Orders keep a snapshot of the method's name and delivery estimate, so
 * editing or deleting a method never changes past orders.
 */
export const adminShippingRouter = Router();
adminShippingRouter.use(allow(...ROLES.catalog)); // super admin only

const Method = z.object({
  name: z.string().trim().min(2).max(60),
  eta: z.string().trim().min(2).max(60),
  pricePaise: z.number().int().min(0).max(1_000_000),
  /** Free once the post-discount subtotal reaches this; null = never free. */
  freeAbovePaise: z.number().int().min(0).max(100_000_000).nullable(),
  isEnabled: z.boolean(),
});

const list = () =>
  prisma.shippingMethod.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });

adminShippingRouter.get("/", async (_req, res) => {
  res.json({ data: await list() });
});

adminShippingRouter.post("/", async (req, res) => {
  const body = parse(Method, req.body);
  const last = await prisma.shippingMethod.aggregate({ _max: { sortOrder: true } });
  const method = await prisma.shippingMethod.create({
    data: { ...body, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  await logActivity(req, `Added shipping method ${method.name} (${describe(method)})`, "ShippingMethod", method.id);
  res.status(201).json({ data: method });
});

adminShippingRouter.patch("/:id", async (req, res) => {
  const id = param(req, "id");
  const data = parsePatch(Method, req.body);
  const before = await prisma.shippingMethod.findUnique({ where: { id } });
  if (!before) throw notFound("Shipping method");
  if (data.isEnabled === false && before.isEnabled) await ensureAnotherEnabled(id);

  const method = await prisma.shippingMethod.update({ where: { id }, data });
  await logActivity(req, `Updated shipping method ${method.name} (${describe(method)})`, "ShippingMethod", id);
  res.json({ data: method });
});

adminShippingRouter.delete("/:id", async (req, res) => {
  const id = param(req, "id");
  const method = await prisma.shippingMethod.findUnique({ where: { id } });
  if (!method) throw notFound("Shipping method");
  if (method.isEnabled) await ensureAnotherEnabled(id);
  await prisma.shippingMethod.delete({ where: { id } });
  await logActivity(req, `Deleted shipping method ${method.name}`, "ShippingMethod", id);
  res.status(204).end();
});

/** Sets the checkout order: the ids of every method, first = default. */
adminShippingRouter.put("/order", async (req, res) => {
  const { ids } = parse(z.object({ ids: z.array(z.string()).min(1).max(50) }), req.body);
  const existing = await prisma.shippingMethod.findMany({ select: { id: true } });
  const known = new Set(existing.map((m) => m.id));
  if (ids.length !== known.size || !ids.every((id) => known.has(id)) || new Set(ids).size !== ids.length) {
    throw conflict("The list of methods changed — reload and try again");
  }
  await prisma.$transaction(
    ids.map((id, i) => prisma.shippingMethod.update({ where: { id }, data: { sortOrder: i + 1 } })),
  );
  await logActivity(req, "Reordered shipping methods", "ShippingMethod");
  res.json({ data: await list() });
});

/** Checkout needs at least one way to deliver. */
async function ensureAnotherEnabled(exceptId: string) {
  const others = await prisma.shippingMethod.count({ where: { isEnabled: true, id: { not: exceptId } } });
  if (others === 0) {
    throw conflict("This is the only shipping method on — turn another one on first, or checkout would have no way to deliver");
  }
}

function describe(m: { pricePaise: number; freeAbovePaise: number | null; isEnabled: boolean }) {
  const price = m.pricePaise === 0 ? "free" : formatInr(m.pricePaise);
  const free = m.freeAbovePaise != null && m.pricePaise > 0 ? `, free above ${formatInr(m.freeAbovePaise)}` : "";
  return `${price}${free}${m.isEnabled ? "" : ", off"}`;
}
