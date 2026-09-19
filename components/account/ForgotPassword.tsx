"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field } from "@/components/auth/AuthPanel";
import { api } from "@/lib/api/client";
import { looksLikeEmail } from "@/lib/utils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!looksLikeEmail(email)) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setState("sending");
    setError("");
    try {
      await api("POST", "/account/password/forgot", { email: email.trim() });
      setState("sent");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  }

  return (
    <div className="container-vel flex justify-center py-14">
      <div className="w-full max-w-sm">
        {state === "sent" ? (
          <div role="status" className="text-center">
            <MailCheck className="mx-auto size-12 text-gold-600" strokeWidth={1.4} />
            <h2 className="mt-4 font-display text-2xl text-plum-800">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              If there&apos;s an account for <strong className="text-plum-800">{email.trim()}</strong>,
              we&apos;ve sent it a link to choose a new password. The link works for one hour.
            </p>
            <Link href="/login" className="mt-6 inline-block text-[0.8rem] text-gold-700 hover:text-gold-600">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 className="font-display text-2xl text-plum-800">Forgot your password?</h2>
            <p className="mt-1 text-[0.8rem] text-ink-soft">
              Enter your email and we&apos;ll send you a link to choose a new one.
            </p>
            <div className="mt-6">
              <Field
                id="forgot-email"
                label="Email Address"
                Icon={Mail}
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                error={error || undefined}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" size="lg" className="mt-5 w-full" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send Reset Link"}
            </Button>
            <p className="mt-4 text-center text-[0.75rem] text-ink-soft">
              Remembered it?{" "}
              <Link href="/login" className="text-gold-700 hover:text-gold-600">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
