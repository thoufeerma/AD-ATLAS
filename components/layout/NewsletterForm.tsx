"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api/client";
import { looksLikeEmail } from "@/lib/utils";

export default function NewsletterForm() {
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
    <form onSubmit={submit} noValidate className="w-full max-w-sm">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <div className="flex">
        <input
          id="footer-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "footer-email-error" : undefined}
          placeholder="Enter your email"
          className="w-full min-w-0 rounded-l-sm border border-r-0 border-gold-500/35 bg-plum-900/60 px-3.5 py-2 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="label-caps shrink-0 rounded-r-sm bg-gold-600 px-4 py-2 text-white transition-colors hover:bg-gold-500 disabled:opacity-60"
        >
          {state === "sending" ? "..." : "SUBSCRIBE"}
        </button>
      </div>
      {error && (
        <p id="footer-email-error" className="mt-2 text-[0.72rem] text-blush-200">
          {error}
        </p>
      )}
    </form>
  );
}
