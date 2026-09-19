/**
 * Browser-side calls to the Velastia API. They go to this site's own
 * /api/v1, which next.config.ts forwards to the API.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    /** Field-level messages the API chose to send, keyed by field name. */
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

export async function api<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  init?: { signal?: AbortSignal },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: init?.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "We couldn't reach the store. Check your connection and try again.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const details: { path?: string; message?: string }[] = Array.isArray(json?.error?.details)
      ? json.error.details
      : [];
    throw new ApiError(
      res.status,
      json?.error?.code ?? "UNKNOWN",
      friendly(res.status, json?.error?.message),
      Object.fromEntries(details.filter((d) => d.path && d.message).map((d) => [d.path!, d.message!])),
    );
  }
  return json.data as T;
}

/** A field-level message from the API (e.g. `password`), if it sent one. */
export function fieldError(err: unknown, field: string) {
  if (!(err instanceof ApiError)) return undefined;
  return err.fields[field];
}

function friendly(status: number, message?: string) {
  if (status >= 500 || status === 0 || !message) {
    return "Something went wrong on our side. Please try again in a moment.";
  }
  // Forms validate in the browser first with friendlier wording; this only
  // shows if the two ever disagree, and Zod's raw messages aren't for shoppers.
  if (message === "Validation failed") return "Please check your details and try again.";
  return message;
}
