"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api/client";
import { looksLikeEmail } from "@/lib/utils";

/**
 * The footer sign-up. `button`: a separate gold SUBSCRIBE button (homepage
 * footer); `arrow`: one outlined box with an arrow inside it (shop footer).
 */
export default function NewsletterForm({ variant = "button" }: { variant?: "button" | "arrow" }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!looksLikeEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setState("sending");
    setError("");
    try {
      await api("POST", "/newsletter", { email: email.trim(), source: "footer" });
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-cream-200/85">
        <Check className="mt-0.5 size-4 shrink-0 text-gold-400" />
        You&apos;re on the list. Thank you for subscribing!
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-[29rem]">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      {variant === "arrow" ? (
        <div className="flex items-center rounded-md border border-cream-200/45 focus-within:border-gold-400">
          <input
            id="footer-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "footer-email-error" : undefined}
            placeholder="Enter your email"
            className="w-full min-w-0 bg-transparent px-4 py-3 text-[0.95rem] text-cream-100 placeholder:text-cream-200/80 focus:outline-none"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            aria-label="Subscribe"
            className="grid shrink-0 place-items-center px-4 text-cream-50 transition-colors hover:text-gold-300 disabled:opacity-60"
          >
            <ArrowRight className="size-6" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
      <div className="flex gap-3">
        <input
          id="footer-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "footer-email-error" : undefined}
          placeholder="Enter your email"
          className="w-full min-w-0 rounded-md border border-cream-200/40 bg-transparent px-4 py-2.5 text-[0.95rem] text-cream-100 placeholder:text-cream-200/70 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 rounded-md bg-gold-500 px-5 py-2.5 text-[0.95rem] font-medium uppercase text-white transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          {state === "sending" ? "..." : "SUBSCRIBE"}
        </button>
      </div>
      )}
      {error && (
        <p id="footer-email-error" className="mt-2 text-[0.72rem] text-blush-200">
          {error}
        </p>
      )}
    </form>
  );
}
