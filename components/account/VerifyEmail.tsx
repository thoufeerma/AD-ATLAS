"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { refreshAccount } from "@/lib/account";

// One request per token per page load — React runs effects twice in
// development, and a one-time link must not be spent by the first run.
const inflight = new Map<string, Promise<unknown>>();

export default function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<{ status: "working" | "done" | "failed"; message?: string }>({
    status: token ? "working" : "failed",
    message: token ? undefined : "This link is incomplete. Open it straight from the email.",
  });

  useEffect(() => {
    if (!token) return;
    if (!inflight.has(token)) inflight.set(token, api("POST", "/account/verify", { token }));
    inflight
      .get(token)!
      .then(() => {
        setState({ status: "done" });
        void refreshAccount();
      })
      .catch((err) => setState({ status: "failed", message: (err as Error).message }));
  }, [token]);

  return (
    <div className="container-vel flex min-h-[45vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        {state.status === "working" && <Loader2 className="mx-auto size-10 animate-spin text-gold-500" />}
        {state.status === "done" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-success" strokeWidth={1.4} />
            <h2 className="mt-4 font-display text-2xl text-plum-800">Email confirmed</h2>
            <p className="mt-2 text-sm text-ink-soft">Your order history is now in your account.</p>
            <Button href="/account" className="mt-6">
              Go to My Account
            </Button>
          </>
        )}
        {state.status === "failed" && (
          <>
            <AlertCircle className="mx-auto size-12 text-gold-500" strokeWidth={1.4} />
            <h2 className="mt-4 font-display text-2xl text-plum-800">We couldn&apos;t confirm that link</h2>
            <p className="mt-2 text-sm text-ink-soft">{state.message}</p>
            <Button href="/account" className="mt-6">
              Go to My Account
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
