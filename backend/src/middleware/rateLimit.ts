import type { NextFunction, Request, Response } from "express";
import { tooMany } from "../lib/http.js";
import { clientIp } from "../lib/clientIp.js";

/**
 * Fixed-window limit per client IP, for the public endpoints anyone can POST
 * to without signing in (orders, reviews, contact, newsletter, collabs).
 *
 * In-memory, like the login throttle: enough to stop a script flooding one
 * instance. Swap for a shared store (Redis) once the API runs on several.
 */
export function rateLimit({ name, max, windowMs }: { name: string; max: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Drop expired windows now and then so the map can't grow without bound.
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt < now) hits.delete(key);
  }, windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = clientIp(req);
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return next(tooMany(`Too many ${name} requests — please wait a few minutes and try again`));
    }
    next();
  };
}
