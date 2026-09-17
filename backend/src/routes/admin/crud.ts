import { Router } from "express";
import type { z } from "zod";
import type { AdminRole } from "../../generated/prisma/client.js";
import { param, parse, parsePatch } from "../../lib/http.js";
import { allow } from "../../middleware/auth.js";
import { logActivity } from "../../lib/activity.js";

/**
 * List / create / update / delete for simple CMS resources that have no
 * special rules. Each resource passes its own typed Prisma calls, so nothing
 * here needs to know about any particular model.
 */
export function crudRouter<S extends z.ZodObject, Row extends { id: string }>(opts: {
  entity: string;
  roles: AdminRole[];
  schema: S;
  label: (row: Row) => string;
  list: () => Promise<Row[]>;
  create: (data: z.infer<S>) => Promise<Row>;
  update: (id: string, data: Partial<z.infer<S>>) => Promise<Row>;
  remove: (id: string) => Promise<unknown>;
}) {
  const router = Router();
  const gate = allow(...opts.roles);

  router.get("/", gate, async (_req, res) => {
    res.json({ data: await opts.list() });
  });

  router.post("/", gate, async (req, res) => {
    const row = await opts.create(parse(opts.schema, req.body));
    await logActivity(req, `Created ${opts.entity.toLowerCase()} ${opts.label(row)}`, opts.entity, row.id);
    res.status(201).json({ data: row });
  });

  router.patch("/:id", gate, async (req, res) => {
    const data = parsePatch(opts.schema, req.body);
    const row = await opts.update(param(req, "id"), data);
    await logActivity(req, `Updated ${opts.entity.toLowerCase()} ${opts.label(row)}`, opts.entity, row.id);
    res.json({ data: row });
  });

  router.delete("/:id", gate, async (req, res) => {
    await opts.remove(param(req, "id"));
    await logActivity(req, `Deleted ${opts.entity.toLowerCase()}`, opts.entity, param(req, "id"));
    res.status(204).end();
  });

  return router;
}
