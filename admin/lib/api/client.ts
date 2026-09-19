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
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  return handle<T>(res, path);
}

/**
 * Uploads one image to the Media Library. Sent as the raw file (not a form),
 * with its name in a header; the API decodes, checks and re-encodes it.
 */
export async function uploadImage<T = unknown>(original: File): Promise<T> {
  const file = await shrinkIfLarge(original);
  const res = await fetch("/api/v1/admin/media", {
    method: "POST",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-file-name": encodeURIComponent(file.name),
    },
    body: file,
    credentials: "same-origin",
  });
  return handle<T>(res, "/admin/media");
}

/** Online, uploads pass through the admin's host, which refuses bodies much over 4 MB. */
const SHRINK_ABOVE_BYTES = 4 * 1024 * 1024;
/** The API resizes to this anyway, so shrinking first loses nothing. */
const MAX_SIDE = 2400;

/**
 * Scales a large photo down in the browser before it's sent. If the browser
 * can't decode or re-encode it, the original goes as it is and the API
 * explains any problem.
 */
async function shrinkIfLarge(file: File): Promise<File> {
  if (file.size <= SHRINK_ABOVE_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string) => new Promise<Blob | null>((done) => canvas.toBlob(done, type, 0.9));
    let blob = await encode("image/webp");
    // Browsers that can't write WebP hand back a PNG; JPEG is smaller for photos
    // (but would lose a PNG's transparency, so PNGs are left alone).
    if (blob?.type !== "image/webp" && file.type !== "image/png") blob = await encode("image/jpeg");
    if (!blob || !/^image\/(webp|jpeg)$/.test(blob.type) || blob.size >= file.size) return file;

    const ext = blob.type === "image/webp" ? ".webp" : ".jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ext, { type: blob.type });
  } catch {
    return file;
  }
}

async function handle<T>(res: Response, path: string): Promise<T> {
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
