"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import type { PaymentSettings } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

const CHANNELS: { key: keyof Omit<PaymentSettings, "gateway">; label: string; note: string; online: boolean }[] = [
  { key: "cod", label: "Cash on Delivery", note: "Paid to the courier when the order arrives", online: false },
  { key: "upi", label: "UPI", note: "Google Pay, PhonePe, Paytm and the rest", online: true },
  { key: "card", label: "Credit / Debit Card", note: "Visa, Mastercard, RuPay, Amex", online: true },
  { key: "netbanking", label: "Net Banking", note: "All major Indian banks", online: true },
  { key: "wallet", label: "Wallets", note: "Paytm, Amazon Pay, Mobikwik", online: true },
];

export default function PaymentsForm({ initial, editable }: { initial: PaymentSettings; editable: boolean }) {
  const router = useRouter();
  const { gateway } = initial;
  const [values, setValues] = useState({
    cod: initial.cod,
    upi: initial.upi,
    card: initial.card,
    netbanking: initial.netbanking,
    wallet: initial.wallet,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = !same(values, {
    cod: initial.cod,
    upi: initial.upi,
    card: initial.card,
    netbanking: initial.netbanking,
    wallet: initial.wallet,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("PUT", "/admin/settings/payments", values);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <Card title="Ways to Pay" bodyClassName="p-0">
        <ul className="divide-y divide-hairline">
          {CHANNELS.map((c) => {
            const blocked = c.online && !gateway.connected;
            return (
              <li key={c.key} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{c.label}</p>
                  <p className="mt-0.5 text-[0.7rem] text-muted">
                    {blocked ? "Needs Razorpay connected — see beside" : c.note}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-[0.72rem] text-ink-2">
                  <input
                    type="checkbox"
                    checked={values[c.key]}
                    disabled={!editable || blocked}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, [c.key]: e.target.checked }));
                      setSaved(false);
                    }}
                    className="size-4 accent-series-1"
                  />
                  {values[c.key] && !blocked ? "Offered" : "Off"}
                </label>
              </li>
            );
          })}
        </ul>
        {editable && (
          <div className="flex flex-wrap items-center gap-3 border-t border-hairline px-5 py-4">
            <Button type="submit" size="sm" disabled={busy || !dirty}>
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {busy ? "Saving…" : "Save Changes"}
            </Button>
            {error ? (
              <span role="alert" className="flex items-center gap-1.5 text-[0.72rem] text-critical">
                <AlertCircle className="size-3.5" /> {error}
              </span>
            ) : saved && !dirty ? (
              <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
                <Check className="size-3.5" /> Saved — live on the store within a minute
              </span>
            ) : null}
          </div>
        )}
        <p className="border-t border-hairline px-5 py-3 text-[0.7rem] leading-relaxed text-muted">
          Switching a method off hides it at checkout straight away. Orders already placed with it are
          unaffected.
        </p>
      </Card>

      <Card title="Razorpay">
        <dl className="space-y-3 text-[0.78rem]">
          <Row label="Status">
            {gateway.mode === "simulated" ? (
              <span className="text-[#8a5d00]">Simulated (development only)</span>
            ) : gateway.connected ? (
              <span className="text-[#006300]">Connected · {gateway.mode} mode</span>
            ) : (
              <span className="text-ink-2">Not connected</span>
            )}
          </Row>
          {gateway.keyId && gateway.mode !== "simulated" && <Row label="Key">{gateway.keyId}</Row>}
          {gateway.connected && (
            <Row label="Webhook">
              <span className={gateway.webhookReady ? "text-ink" : "text-[#8a5d00]"}>
                {gateway.webhookReady ? "Signed and ready" : "No secret set"}
              </span>
            </Row>
          )}
        </dl>

        <div className="mt-4 space-y-3 rounded-lg bg-plane px-3.5 py-3 text-[0.72rem] leading-relaxed text-ink-2">
          {gateway.mode === "live" ? (
            <p>
              Live keys are in use, so payments here are real money. Refunds from the Returns screen go
              back through Razorpay automatically.
            </p>
          ) : (
            <>
              <p>
                To take online payments, add these to the API&apos;s environment (Render → Environment) and
                redeploy:
              </p>
              <ul className="space-y-1">
                {["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"].map((name) => (
                  <li key={name}>
                    <code className="rounded bg-card px-1 py-0.5 text-[0.7rem]">{name}</code>
                  </li>
                ))}
              </ul>
              <p>
                The first two come from Razorpay&apos;s API keys page. The third is yours to choose when you
                add a webhook there, pointing at{" "}
                <code className="rounded bg-card px-1 py-0.5 text-[0.7rem]">
                  your-api-address/api/v1/webhooks/razorpay
                </code>{" "}
                with the payment events. It lets a payment be recorded even if the customer closes the tab.
              </p>
              <p className={cn(gateway.mode === "simulated" && "text-[#8a5d00]")}>
                {gateway.mode === "simulated"
                  ? "On this development machine there are no keys, so the API stands in for the gateway: online payments succeed without money moving. That never happens on the live site."
                  : "Keys never go in this screen or the database — only in the environment."}
              </p>
            </>
          )}
        </div>
      </Card>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{children}</dd>
    </div>
  );
}
