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

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
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

export const config = {
  // Everything except the API rewrite, Next internals and static files.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
