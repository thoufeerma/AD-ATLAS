import { NextResponse, type NextRequest } from "next/server";

/**
 * OPTIMISTIC route guard — a cheap first filter, not the security boundary.
 *
 * It only checks whether a session cookie is *present*. It cannot tell if the
 * cookie is valid (the signing secret lives in the backend). The real check is
 * the API: `requireAdmin()` in the (panel) layout asks it on every request, and
 * every API route enforces the session and the role independently.
 */

const SESSION_COOKIE = "vel_admin";
const API_URL = process.env.API_URL ?? "http://localhost:4000";
const PROXY_SECRET = process.env.PROXY_SECRET;

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname.startsWith("/api/v1/")) return forwardToApi(req);

  const hasSession = req.cookies.has(SESSION_COOKIE);

  if (pathname === "/login") {
    // The API rejected this cookie (expired, revoked, or the admin was
    // deactivated). Clear it and show the login form — redirecting back to "/"
    // here would loop forever between the panel and the login page.
    if (searchParams.get("reason") === "expired") {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }
    // Already signed in: skip the login form.
    if (hasSession) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL("/login", req.url);
    // Remember where they were headed, so signing in returns them there.
    if (pathname !== "/") login.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

/**
 * The browser only ever talks to this app's own origin: /api/v1/* is
 * forwarded to the backend, so the httpOnly session cookie the API sets is
 * first-party to the admin — no CORS, no third-party cookies, and server
 * components can read it to make authenticated calls.
 *
 * Online, the API would see this server as the sender of every request, so
 * the login throttle would lump everyone together. With PROXY_SECRET set (the
 * same value as on the API) the real IP address is passed along with it.
 */
function forwardToApi(req: NextRequest) {
  const headers = new Headers(req.headers);
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
  // The API forwarding, plus every page — not Next internals or static files.
  matcher: ["/api/v1/:path*", "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
