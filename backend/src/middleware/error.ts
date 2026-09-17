import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http.js";
import { isProd } from "../env.js";

/**
 * One place that turns thrown errors into responses. Express 5 forwards
 * rejected promises from async handlers here automatically.
 *
 * Every response has the same shape: { error: { code, message, details? } }.
 * Unexpected errors are logged in full but never leak internals to the client.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Malformed JSON body" } });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = uniqueField(err.meta);
      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: field ? `A record with that ${field} already exists` : "Duplicate value",
          ...(field ? { details: { field } } : {}),
        },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found" } });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "This record is still referenced by other data" },
      });
      return;
    }
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: "Something went wrong",
      ...(isProd ? {} : { details: err instanceof Error ? err.message : String(err) }),
    },
  });
}

/**
 * Which field a unique-constraint violation was on.
 *
 * Prisma 7 with a driver adapter no longer fills `meta.target`; the detail is
 * under `meta.driverAdapterError.cause.constraint`, as either a `fields` list
 * or an index name like `categories_slug_key`. The old location is kept as a
 * fallback.
 */
function uniqueField(meta: Record<string, unknown> | undefined): string | null {
  const cause = (meta?.driverAdapterError as { cause?: Record<string, unknown> } | undefined)
    ?.cause;
  const constraint = cause?.constraint as { fields?: string[]; index?: string } | undefined;

  if (constraint?.fields?.length) return constraint.fields.join(" and ");

  if (constraint?.index) {
    const table = typeof cause?.table === "string" ? cause.table : "";
    const field = constraint.index
      .replace(new RegExp(`^${table}_`), "")
      .replace(/_key$/, "");
    if (field) return field.split("_").join(" and ");
  }

  const target = meta?.target;
  if (Array.isArray(target) && target.length) return target.join(" and ");
  return null;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
  });
}
