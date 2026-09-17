import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Admin } from "./types";

/**
 * DATA ACCESS LAYER — server side.
 *
 * Every authenticated read in the admin goes through here. It forwards the
 * admin's session cookie to the API server-to-server, and turns a 401 into a
 * redirect to the login page. The API is the real authority: this app cannot
 * verify the session token itself (the signing secret lives only in the
 * backend), so it asks.
 */

const API_URL = process.env.API_URL ?? "http://localhost:4000";
export const SESSION_COOKIE = "vel_admin";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    // Only the session cookie is forwarded — never the browser's other cookies.
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
    cache: "no-store",
  });

  if (res.status === 401) {
    // `reason=expired` tells proxy.ts to clear the stale cookie instead of
    // bouncing back here, which would otherwise loop.
    redirect("/login?reason=expired");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `API request failed (${res.status})`,
    );
  }
  return body.data as T;
}

export const apiGet = request;

/**
 * The signed-in admin, verified by the API. Memoised per render, so calling it
 * from a layout and a page costs one request.
 */
export const requireAdmin = cache(async (): Promise<Admin> => {
  return request<Admin>("/admin/auth/me");
});
