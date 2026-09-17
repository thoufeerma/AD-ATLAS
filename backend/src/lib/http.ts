import type { Request } from "express";
import type { z } from "zod";

/** An error that maps to a specific HTTP response. Anything else becomes a 500. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, "BAD_REQUEST", message, details);
export const unauthorized = (message = "Authentication required") =>
  new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "You do not have permission to do that") =>
  new HttpError(403, "FORBIDDEN", message);
export const notFound = (what = "Resource") =>
  new HttpError(404, "NOT_FOUND", `${what} not found`);
export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, "CONFLICT", message, details);
export const tooMany = (message: string) => new HttpError(429, "TOO_MANY_REQUESTS", message);

/**
 * Validates a PATCH body. Use this for every partial update — NOT
 * `parse(schema.partial(), body)`.
 *
 * Zod's `.partial()` makes fields optional but still applies `.default()`
 * values to absent keys. On an update that is destructive: a request changing
 * only a product's price would come back with `stock: 0`, `shades: []` and
 * `images: []`, wiping data the admin never touched. So after validating, only
 * keys actually present in the request body are kept.
 */
export function parsePatch<S extends z.ZodObject>(
  schema: S,
  data: unknown,
): Partial<z.infer<S>> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw badRequest("Expected a JSON object");
  }
  const parsed = parse(schema.partial(), data) as Record<string, unknown>;
  const sent = new Set(Object.keys(data));
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => sent.has(key)),
  ) as Partial<z.infer<S>>;
}

/**
 * A route parameter as a plain string. Express 5 types params as
 * `string | string[]` (wildcard segments can repeat), so this narrows it and
 * rejects anything that isn't a single non-empty value.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw badRequest(`Invalid route parameter: ${name}`);
  }
  return value;
}

/**
 * Validates untrusted input. Called inside handlers rather than as middleware:
 * Express 5 makes `req.query` a read-only getter, so parsed values can't be
 * written back onto the request, and this keeps the result fully typed.
 */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest(
      "Validation failed",
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  return result.data;
}
