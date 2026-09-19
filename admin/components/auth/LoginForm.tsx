"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";

export default function LoginForm({ next, expired }: { next: string; expired: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(
    expired ? "Your session has ended. Please sign in again." : null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api("POST", "/admin/auth/login", { email, password });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setPending(false);
      if (err instanceof ApiError) {
        setError(
          err.status === 400 ? "Enter a valid email address and your password." : err.message,
        );
      } else {
        setError("Can't reach the server. Check that the API is running and try again.");
      }
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-plane px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo.png" alt="Velastia" width={178} height={60} priority className="h-[60px] w-auto" />
          <h1 className="mt-4 text-[1.35rem] font-semibold tracking-tight text-ink">
            Velastia Admin
          </h1>
          <p className="mt-1 text-[0.8rem] text-ink-2">Sign in to manage the store</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[var(--radius-card)] border border-hairline bg-card p-6 shadow-sm sm:p-7"
          noValidate
        >
          {error && (
            <p
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-critical/25 bg-critical/5 px-3 py-2.5 text-[0.78rem] text-critical"
            >
              <AlertCircle className="mt-px size-4 shrink-0" />
              {error}
            </p>
          )}

          <label htmlFor="email" className="mb-1.5 block text-[0.72rem] font-medium text-ink-2">
            Email
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-hairline px-3.5 focus-within:border-series-1">
            <Mail className="size-4 shrink-0 text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent py-2.5 text-[0.85rem] text-ink placeholder:text-muted focus:outline-none"
              placeholder="you@velastia.com"
            />
          </div>

          <label htmlFor="password" className="mb-1.5 block text-[0.72rem] font-medium text-ink-2">
            Password
          </label>
          <div className="flex items-center gap-2.5 rounded-lg border border-hairline px-3.5 focus-within:border-series-1">
            <Lock className="size-4 shrink-0 text-muted" />
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent py-2.5 text-[0.85rem] text-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="text-muted hover:text-ink"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={pending || !email || !password}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar py-2.5 text-[0.85rem] font-medium text-pill transition-colors hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.7rem] text-muted">
          Access is limited to Velastia staff. Attempts are logged.
        </p>
      </div>
    </main>
  );
}
