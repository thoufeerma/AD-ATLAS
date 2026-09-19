"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field } from "@/components/auth/AuthPanel";
import { api, ApiError } from "@/lib/api/client";
import { setSignedIn, type Me } from "@/lib/account";

export default function ResetPassword() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    try {
      setSignedIn(await api<Me>("POST", "/account/password/reset", { token, password }));
      router.replace("/account");
    } catch (err) {
      setError(err instanceof ApiError && err.fields.password ? err.fields.password : (err as Error).message);
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="container-vel py-16 text-center">
        <AlertCircle className="mx-auto size-12 text-gold-500" strokeWidth={1.4} />
        <p className="mt-4 text-sm text-ink-soft">This link is incomplete. Open it straight from the email, or</p>
        <Link href="/account/forgot" className="mt-2 inline-block text-[0.85rem] text-gold-700 hover:text-gold-600">
          ask for a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="container-vel flex justify-center py-14">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <h2 className="font-display text-2xl text-plum-800">Choose a new password</h2>
        <p className="mt-1 text-[0.8rem] text-ink-soft">
          At least 8 characters. You&apos;ll be signed in straight after.
        </p>
        <div className="mt-6 space-y-4">
          <Field id="reset-password" label="New Password" Icon={Lock} type="password" autoComplete="new-password" value={password} onChange={setPassword} />
          <Field id="reset-confirm" label="Confirm Password" Icon={Lock} type="password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
        </div>
        {error && (
          <p role="alert" className="mt-4 flex flex-wrap items-start gap-2 text-[0.75rem] text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
            {/expired|already used/i.test(error) && (
              <Link href="/account/forgot" className="underline">
                Get a new link
              </Link>
            )}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
          {busy ? "Saving…" : "Set Password"}
        </Button>
      </form>
    </div>
  );
}
