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
export function rateLimit({
  name,
  max,
  windowMs,
  onlyFailures,
}: {
  name: string;
  max: number;
  windowMs: number;
  /**
   * Count only the requests that came back empty-handed (4xx). For lookups
   * where guessing is the attack — an order number, say — a customer
   * refreshing their own order is never punished, while someone working
   * through numbers runs out of attempts.
   */
  onlyFailures?: boolean;
}) {
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
    const fresh = !entry || entry.resetAt < now;
    const count = fresh ? 1 : entry.count + 1;

    if (count > max) {
      res.setHeader("Retry-After", Math.ceil(((entry?.resetAt ?? now) - now) / 1000));
      return next(tooMany(`Too many ${name} requests — please wait a few minutes and try again`));
    }

    if (onlyFailures) {
      // Charged once the answer is known: a miss counts, a hit doesn't.
      res.on("finish", () => {
        if (res.statusCode < 400) return;
        const at = Date.now();
        const current = hits.get(key);
        if (!current || current.resetAt < at) hits.set(key, { count: 1, resetAt: at + windowMs });
        else current.count += 1;
      });
    } else if (fresh) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count = count;
    }
    next();
  };
}

/**
 * Looking up someone else's order: Track Order, the returns panel and the
 * invoice pages. They're all guarded by something the guesser doesn't know —
 * an email address, or a signed link — so only the wrong guesses are counted.
 */
export const lookupLimit = rateLimit({ name: "lookup", max: 20, windowMs: 10 * 60_000, onlyFailures: true });
