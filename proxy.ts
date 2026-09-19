import { NextResponse, type NextRequest } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const PROXY_SECRET = process.env.PROXY_SECRET;

/**
 * Browser-side calls (cart pricing, checkout, forms, sign-in, order tracking)
 * go to this site's own /api/v1 and are forwarded from here to the Velastia
 * API — same origin for the shopper, so the API needs no CORS entry and the
 * account cookie stays first-party.
 *
 * Online, the API would otherwise see this server as the sender of every
 * request, so every shopper would share one set of rate limits. With
 * PROXY_SECRET set (the same value as on the API), the visitor's real IP
 * address is passed along, and the API trusts it only alongside the secret.
 */
export function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  // Never pass on a browser's own attempt at these.
  headers.delete("x-velastia-client-ip");
  headers.delete("x-velastia-proxy-secret");

  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (PROXY_SECRET && ip) {
    headers.set("x-velastia-client-ip", ip);
    headers.set("x-velastia-proxy-secret", PROXY_SECRET);
  }

  const target = new URL(req.nextUrl.pathname + req.nextUrl.search, API_URL);
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  matcher: "/api/v1/:path*",
};
