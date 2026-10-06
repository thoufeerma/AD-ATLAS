"use client";

import { useState } from "react";
import { Check, ImagePlus, Star, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { cn, looksLikeEmail } from "@/lib/utils";

/**
 * Review submission. Reviews go to the admin's Reviews screen as "pending" and
 * only appear on the site once published there. Pass `productSlug` to review a
 * known product, or `products` to let the shopper pick one. Shoppers can add a
 * title and up to three photos; each photo is uploaded as soon as it's picked.
 */

const MAX_PHOTOS = 3;

/**
 * Shrink a phone photo before sending it (the API re-encodes it anyway).
 * Formats the browser can't draw, such as HEIC on most browsers, go as they are.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

async function uploadPhoto(file: File) {
  const body = await shrink(file);
  const res = await fetch("/api/v1/reviews/photos", {
    method: "POST",
    headers: { "content-type": body.type || "application/octet-stream" },
    body,
  }).catch(() => null);
  const json = await res?.json().catch(() => null);
  if (!res?.ok) {
    throw new ApiError(res?.status ?? 0, "UPLOAD", json?.error?.message ?? "That photo couldn't be uploaded. Please try another.");
  }
  return (json.data as { url: string }).url;
}
export default function ReviewForm({
  productSlug,
  products,
  tone = "light",
}: {
  productSlug?: string;
  products?: { slug: string; name: string }[];
  tone?: "light" | "cream";
}) {
  const [slug, setSlug] = useState(productSlug ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = !slug
      ? "Choose the product you're reviewing."
      : rating === 0
        ? "Choose a star rating."
        : name.trim().length < 2
          ? "Enter your name."
          : !looksLikeEmail(email)
            ? "Enter a valid email address."
            : body.trim().length < 10
              ? "Tell us a little more — at least 10 characters."
              : "";
    if (problem) {
      setError(problem);
      return;
    }

    setSending(true);
    setError("");
    try {
      await api("POST", "/reviews", {
        productSlug: slug,
        name: name.trim(),
        email: email.trim(),
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        images: photos,
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function addPhotos(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (picked.length === 0) return;
    setError("");
    setUploading((n) => n + picked.length);
    await Promise.all(
      picked.map(async (file) => {
        try {
          const url = await uploadPhoto(file);
          setPhotos((p) => (p.length < MAX_PHOTOS ? [...p, url] : p));
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  if (done) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-[var(--radius-card)] bg-blush-100 p-5">
        <Check className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-sm font-medium text-plum-800">Thank you for your review!</p>
          <p className="mt-0.5 text-[0.75rem] text-ink-soft">
            It will appear here once our team has checked it.
          </p>
        </div>
      </div>
    );
  }

  const field =
    "w-full rounded-sm border border-gold-200 px-3.5 py-2.5 text-sm text-plum-800 placeholder:text-ink-soft/50 focus:border-gold-500 focus:outline-none " +
    (tone === "cream" ? "bg-cream-100" : "bg-cream-50");
  const shown = hover || rating;

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      {products && !productSlug && (
        <div className="sm:col-span-2">
          <label htmlFor="rv-product" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
            Product
          </label>
          <select id="rv-product" value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
            <option value="">Choose a product…</option>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset className="sm:col-span-2">
        <legend className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">Your Rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              className="p-0.5"
            >
              <Star
                className={cn("size-6", n <= shown ? "text-gold-500" : "text-gold-200")}
                fill={n <= shown ? "currentColor" : "none"}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="rv-name" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
          Name (shown with your review)
        </label>
        <input
          id="rv-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={60}
          className={field}
        />
      </div>
      <div>
        <label htmlFor="rv-email" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
          Email (never shown)
        </label>
        <input
          id="rv-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={field}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="rv-title" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
          Title (optional)
        </label>
        <input
          id="rv-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Sum it up, e.g. The perfect everyday shade!"
          className={field}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="rv-body" className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">
          Your Review
        </label>
        <textarea
          id="rv-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder="What did you love? How did it wear?"
          className={field}
        />
      </div>

      <div className="sm:col-span-2">
        <p className="label-caps mb-1.5 block text-[0.6rem] text-gold-700">Photos (optional, up to {MAX_PHOTOS})</p>
        <div className="flex flex-wrap gap-2.5">
          {photos.map((url) => (
            <div key={url} className="relative size-20 overflow-hidden rounded-sm border border-gold-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- a just-uploaded preview */}
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                aria-label="Remove photo"
                className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-plum-900/75 text-cream-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div key={`up-${i}`} className="grid size-20 animate-pulse place-items-center rounded-sm border border-gold-200 bg-cream-200 text-[0.65rem] text-ink-soft">
              Uploading…
            </div>
          ))}
          {photos.length + uploading < MAX_PHOTOS && (
            <label className="grid size-20 cursor-pointer place-items-center rounded-sm border border-dashed border-gold-400 text-gold-700 hover:bg-cream-100">
              <ImagePlus className="size-5" />
              <span className="sr-only">Add photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  void addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={sending || uploading > 0}>
          {sending ? "Sending…" : "Submit Review"}
        </Button>
        {error && (
          <p role="alert" className="text-[0.75rem] text-danger">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
