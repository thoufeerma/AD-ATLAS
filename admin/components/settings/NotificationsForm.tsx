"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, CircleCheck, CircleDashed, Loader2, Lock, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { EMAIL_STATUS_LABEL, type EmailStatus, type NotificationSettings, type SiteSettings } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

const TOGGLES: { key: keyof Omit<NotificationSettings, "alertRecipients">; label: string; note: string }[] = [
  { key: "orderConfirmation", label: "Order confirmation", note: "To the customer as soon as they place an order." },
  {
    key: "shippingUpdates",
    label: "Order updates",
    note: "To the customer when their order ships, is out for delivery, delivered, cancelled or refunded — with any note you add.",
  },
  { key: "alertNewOrder", label: "New-order alert", note: "To the team below for every new order." },
  { key: "alertNewMessage", label: "Message alert", note: "To the team below for contact messages and collab applications." },
  {
    key: "returnUpdates",
    label: "Return updates",
    note: "To the customer when a return is approved, turned down, received or refunded.",
  },
  {
    key: "alertReturnRequest",
    label: "Return alert",
    note: "To the team below when a customer asks to send something back.",
  },
];

export default function NotificationsForm({
  settings,
  editable,
  myEmail,
}: {
  settings: SiteSettings;
  editable: boolean;
  myEmail: string;
}) {
  const initial = settings.notifications;
  const [values, setValues] = useState(initial);
  const [recipients, setRecipients] = useState(initial.alertRecipients.join("\n"));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const body = {
    ...values,
    alertRecipients: recipients
      .split(/[\n,]/)
      .map((r) => r.trim())
      .filter(Boolean),
  };
  const dirty = !same(body, initial);
  const alertsOn = body.alertNewOrder || body.alertNewMessage || body.alertReturnRequest;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await api("PUT", "/admin/settings/notifications", body);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && Object.keys(err.fields).some((k) => k.startsWith("alertRecipients"))
          ? "Check the team addresses — one per line, each a valid email, no repeats (up to 10)."
          : err instanceof Error
            ? err.message
            : "Couldn't save. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <Card title="Which emails go out">
        <form onSubmit={save} className="space-y-5">
          {!editable && (
            <p className="flex items-center gap-2 rounded-lg bg-plane px-3.5 py-2.5 text-[0.7rem] text-ink-2">
              <Lock className="size-3.5 shrink-0" /> Only Super Administrators can change these.
            </p>
          )}
          <ul className="space-y-3.5">
            {TOGGLES.map((t) => (
              <li key={t.key}>
                <label className={cn("flex gap-3", editable && "cursor-pointer")}>
                  <input
                    type="checkbox"
                    checked={values[t.key]}
                    disabled={!editable}
                    onChange={(e) => setValues((v) => ({ ...v, [t.key]: e.target.checked }))}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--color-series-1)]"
                  />
                  <span>
                    <span className="block text-[0.82rem] font-medium text-ink">{t.label}</span>
                    <span className="block text-[0.72rem] leading-relaxed text-ink-2">{t.note}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Team addresses for alerts</span>
            <textarea
              rows={3}
              value={recipients}
              disabled={!editable}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder={myEmail}
              className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none disabled:bg-plane"
            />
            <span className="mt-1 block text-[0.68rem] text-muted">One per line, up to 10.</span>
            {alertsOn && body.alertRecipients.length === 0 && (
              <span className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-[#8a5d00]">
                <AlertCircle className="size-3.5" /> Alerts are on but nobody will get them — add at least one address.
              </span>
            )}
          </label>

          {editable && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="sm" disabled={busy || !dirty}>
                {busy && <Loader2 className="size-3.5 animate-spin" />}
                {busy ? "Saving…" : "Save"}
              </Button>
              {error ? (
                <span role="alert" className="flex items-center gap-1.5 text-[0.72rem] text-critical">
                  <AlertCircle className="size-3.5" /> {error}
                </span>
              ) : saved && !dirty ? (
                <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
                  <Check className="size-3.5" /> Saved
                </span>
              ) : null}
            </div>
          )}
        </form>
      </Card>

      <div className="space-y-5">
        <EmailService settings={settings} />
        {editable && <TestEmail defaultTo={myEmail} />}
      </div>
    </div>
  );
}

function EmailService({ settings }: { settings: SiteSettings }) {
  const { connected, from } = settings.email;
  return (
    <Card title="Email service">
      {connected ? (
        <p className="flex gap-2.5 text-[0.78rem] leading-relaxed text-ink-2">
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-good" />
          <span>
            <span className="font-medium text-ink">Connected (Resend).</span> Emails are sent from{" "}
            <span className="text-ink">{from}</span>.
          </span>
        </p>
      ) : (
        <div className="space-y-3 text-[0.76rem] leading-relaxed text-ink-2">
          <p className="flex gap-2.5">
            <CircleDashed className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              <span className="font-medium text-ink">Not connected yet.</span> Nothing is emailed:
              every message is kept in the{" "}
              <Link href="/emails" className="text-series-1 hover:underline">
                Email Log
              </Link>{" "}
              instead, so you can see exactly what customers will receive.
            </span>
          </p>
          <ol className="list-decimal space-y-1 pl-9 text-[0.72rem]">
            <li>Create a free account at resend.com.</li>
            <li>Add and verify your domain (e.g. velastia.com).</li>
            <li>Create an API key.</li>
            <li>
              In <code>backend/.env</code> set <code>RESEND_API_KEY</code> and{" "}
              <code>EMAIL_FROM</code> (e.g. <code>Velastia &lt;orders@velastia.com&gt;</code>), then
              restart the API.
            </li>
          </ol>
        </div>
      )}
    </Card>
  );
}

function TestEmail({ defaultTo }: { defaultTo: string }) {
  const [to, setTo] = useState(defaultTo);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<EmailStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const out = await api<{ status: EmailStatus }>("POST", "/admin/emails/test", { to: to.trim() });
      setResult(out.status);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 400 ? "Enter a valid email address." : "Couldn't send. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Send a test email">
      <form onSubmit={send} className="space-y-3">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" variant="outline" disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Send test
          </Button>
          {result && (
            <span role="status" className="text-[0.72rem] text-ink-2">
              {EMAIL_STATUS_LABEL[result]}
              {result === "SENT" ? " — check the inbox." : result === "CAPTURED" ? " — kept in the " : " — see the "}
              {result !== "SENT" && (
                <Link href="/emails" className="text-series-1 hover:underline">
                  Email Log
                </Link>
              )}
              {result !== "SENT" && "."}
            </span>
          )}
          {error && (
            <span role="alert" className="text-[0.72rem] text-critical">
              {error}
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
