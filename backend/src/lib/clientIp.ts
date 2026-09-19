import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { env } from "../env.js";

/**
 * The visitor's IP address, for rate limits and login throttling.
 *
 * Online, browsers never call the API directly: the store and the admin
 * forward /api/v1 from their own servers, so `req.ip` would be the website's
 * server for every visitor. Their proxy sends the real address in
 * X-Velastia-Client-IP together with PROXY_SECRET, and the header is only
 * believed when the secret matches — anyone calling the API directly can't
 * choose their own address. Locally (no secret set) this is just `req.ip`.
 */
export function clientIp(req: Request): string {
  const forwarded = req.get("x-velastia-client-ip");
  if (forwarded && secretMatches(req.get("x-velastia-proxy-secret"))) return forwarded.slice(0, 64);
  return req.ip ?? "unknown";
}

function secretMatches(given: string | undefined) {
  if (!given || !env.PROXY_SECRET) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(env.PROXY_SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}
