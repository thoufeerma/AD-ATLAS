/**
 * Browser-side API calls. Same-origin (`/api/v1/*` is rewritten to the
 * backend), so the httpOnly session cookie travels automatically and is never
 * visible to page scripts.
 */

export type FieldError = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }

  /** Field-level validation messages, keyed by field path. */
  get fields(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(
      (this.details as FieldError[]).map((d) => [d.path, d.message]),
    );
  }
}

export async function api<T = unknown>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });

  // Session expired mid-use: send them to sign in again, then back here.
  if (res.status === 401 && !path.startsWith("/admin/auth/login")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    // A full page load on purpose, not router.push: proxy.ts must see this
    // request to clear the dead cookie, and every piece of in-memory client
    // state from the expired session should be dropped with it.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?reason=expired&next=${next}`);
    return new Promise<T>(() => {}); // navigation is underway
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.error?.code ?? "UNKNOWN",
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.details,
    );
  }
  return json.data as T;
}
