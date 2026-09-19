"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const MIN = 12;

/**
 * Change your own password. The API checks the same rules and is the
 * authority; these checks just answer sooner. On success every other session
 * on the account is signed out, and this one continues.
 */
export default function ChangePasswordForm({
  email,
  submitLabel = "Change Password",
}: {
  email: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const checks = [
    { ok: next.length >= MIN, label: `At least ${MIN} characters` },
    { ok: !!next && !(local.length >= 4 && next.toLowerCase().includes(local)), label: "Doesn't contain your email" },
    { ok: !!next && next !== current, label: "Different from your current password" },
    { ok: !!confirm && next === confirm, label: "Both new passwords match" },
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    if (!current) {
      setFields({ currentPassword: "Enter your current password." });
      return;
    }
    if (!checks.every((c) => c.ok)) {
      setError("The new password doesn't meet the rules below yet.");
      return;
    }
    setBusy(true);
    try {
      await api("POST", "/admin/auth/password", { currentPassword: current, newPassword: next });
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(Object.keys(err.fields).length ? null : err.message);
      } else {
        setError("Couldn't change your password. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const input = (bad: boolean) =>
    cn(
      "w-full rounded-lg border bg-card px-3.5 py-2.5 pr-10 text-[0.8rem] text-ink focus:outline-none",
      bad ? "border-critical" : "border-hairline focus:border-series-1",
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-lg bg-good/10 px-3.5 py-2.5 text-[0.76rem] text-good">
          <Check className="size-4 shrink-0" /> Password changed. Any other devices signed in to this
          account have been signed out.
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {/* Lets password managers file the change against the right account. */}
      <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />

      <Field label="Current password" error={fields.currentPassword}>
        <input
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={input(!!fields.currentPassword)}
        />
      </Field>
      <Field label="New password" error={fields.newPassword}>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={input(!!fields.newPassword)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide passwords" : "Show passwords"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>
      <Field label="Confirm new password">
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={input(false)}
        />
      </Field>

      <ul className="space-y-1" aria-label="Password rules">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-2 text-[0.72rem]", c.ok ? "text-good" : "text-muted")}>
            <Check className={cn("size-3.5", c.ok ? "opacity-100" : "opacity-30")} /> {c.label}
          </li>
        ))}
      </ul>
      <p className="text-[0.68rem] text-muted">
        A long phrase of a few unrelated words is easiest to remember and hardest to guess.
      </p>

      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="size-3.5 animate-spin" />}
        {busy ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>}
    </label>
  );
}
