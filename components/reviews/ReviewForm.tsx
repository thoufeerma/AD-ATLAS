"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { cn, looksLikeEmail } from "@/lib/utils";

/**
 * Review submission. Reviews go to the admin's Reviews screen as "pending" and
 * only appear on the site once published there. Pass `productSlug` to review a
 * known product, or `products` to let the shopper pick one.
 */
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
  const [body, setBody] = useState("");
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
        body: body.trim(),
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
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

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={sending}>
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
