"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import { INDIAN_STATES, type PickupAddress } from "@/lib/api/types";
import { cn, same } from "@/lib/utils";

/**
 * Where parcels are collected from. A courier needs it to book a pickup and to
 * print the sender half of a label, and it's the address a return comes back
 * to — so it's kept here rather than inside any one courier's account.
 */
export default function PickupForm({ initial }: { initial: PickupAddress }) {
  const router = useRouter();
  const [values, setValues] = useState({ ...initial, defaultParcelGrams: String(initial.defaultParcelGrams) });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const body = { ...values, defaultParcelGrams: Number(values.defaultParcelGrams || 0) };
  const dirty = !same(body, initial);
  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await api("PUT", "/admin/settings/pickup", body);
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(Object.keys(err.fields).length ? "Fix the highlighted fields." : err.message);
      } else {
        setError("Couldn't save. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Pickup Address">
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="rounded-lg bg-plane px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-ink-2">
          Where a courier collects parcels, and the sender address on labels. Customers don&apos;t see it —
          the address on the storefront comes from Settings → Store.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Name" value={values.contactName} error={fields.contactName} onChange={set("contactName")} placeholder="Who the courier asks for" />
          <Field label="Phone" value={values.phone} error={fields.phone} onChange={set("phone")} placeholder="98765 43210" />
        </div>
        <Field label="Address" value={values.line1} error={fields.line1} onChange={set("line1")} placeholder="Unit, building, street" />
        <Field label="Area, Landmark" value={values.line2} error={fields.line2} onChange={set("line2")} placeholder="Optional" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" value={values.city} error={fields.city} onChange={set("city")} placeholder="Mumbai" />
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">State</span>
            <select
              value={values.state}
              onChange={(e) => set("state")(e.target.value)}
              className={inputCls(fields.state)}
            >
              <option value="">Choose a state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <Field label="Pincode" value={values.pincode} error={fields.pincode} onChange={set("pincode")} placeholder="400053" />
        </div>
        <Field
          label="Default Parcel Weight (grams)"
          hint="Used when the products in an order haven't been weighed."
          value={values.defaultParcelGrams}
          error={fields.defaultParcelGrams}
          onChange={(v) => set("defaultParcelGrams")(v.replace(/[^0-9]/g, ""))}
        />

        <div className="flex flex-wrap items-center gap-3 pt-1">
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
      </form>
    </Card>
  );
}

const inputCls = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical" : "border-hairline focus:border-series-1",
  );

function Field({
  label,
  hint,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls(error)}
      />
      {error ? (
        <span className="mt-1 block text-[0.7rem] text-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[0.68rem] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
