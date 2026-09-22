"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";
import type { TaxDetails } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/** "2627" for April 2026 to March 2027, in IST like the API. */
function financialYear(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60_000);
  const start = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
  return `${String(start % 100).padStart(2, "0")}${String((start + 1) % 100).padStart(2, "0")}`;
}

const inputCls = (error?: string) =>
  cn(
    "w-full rounded-lg border bg-card px-3.5 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:outline-none",
    error ? "border-critical" : "border-hairline focus:border-series-1",
  );

export default function TaxForm({ initial, legalEntity }: { initial: TaxDetails; legalEntity: string }) {
  const router = useRouter();
  const [values, setValues] = useState({
    gstin: initial.gstin ?? "",
    legalName: initial.legalName || legalEntity,
    address: initial.address,
    invoicePrefix: initial.invoicePrefix,
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setSaved(false);
  };

  const turningOff = Boolean(initial.gstin) && values.gstin.trim() === "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (turningOff && !window.confirm("Clear the GSTIN? New orders won't get invoices until you add it back. Invoices already issued stay as they are.")) {
      return;
    }
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await api("PUT", "/admin/settings/tax", {
        ...values,
        gstin: values.gstin.trim() || null,
      });
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

  const prefix = values.invoicePrefix.trim().toUpperCase() || "VL";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">GSTIN</span>
        <input
          value={values.gstin}
          onChange={set("gstin")}
          placeholder="e.g. 29ABCDE1234F1ZW"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          className={cn(inputCls(fields.gstin), "tnum uppercase placeholder:normal-case")}
        />
        {fields.gstin ? (
          <span className="mt-1 block text-[0.7rem] text-critical">{fields.gstin}</span>
        ) : initial.state && values.gstin.trim().toUpperCase() === initial.gstin ? (
          <span className="mt-1 block text-[0.68rem] text-muted">
            Registered in {initial.state.name} ({initial.state.code}). Deliveries there are charged CGST +
            SGST; everywhere else, IGST.
          </span>
        ) : (
          <span className="mt-1 block text-[0.68rem] text-muted">
            15 characters, from your GST registration certificate. Leave empty to switch invoices off.
          </span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Legal Name</span>
        <input value={values.legalName} onChange={set("legalName")} maxLength={120} className={inputCls(fields.legalName)} />
        {fields.legalName ? (
          <span className="mt-1 block text-[0.7rem] text-critical">{fields.legalName}</span>
        ) : (
          <span className="mt-1 block text-[0.68rem] text-muted">Exactly as on the registration certificate.</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Registered Business Address</span>
        <textarea
          value={values.address}
          onChange={set("address")}
          rows={3}
          maxLength={300}
          placeholder={"Street, area\nCity, State – PIN"}
          className={inputCls(fields.address)}
        />
        {fields.address ? (
          <span className="mt-1 block text-[0.7rem] text-critical">{fields.address}</span>
        ) : (
          <span className="mt-1 block text-[0.68rem] text-muted">Your principal place of business on the GST registration.</span>
        )}
      </label>

      <label className="block max-w-[14rem]">
        <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">Invoice Number Prefix</span>
        <input
          value={values.invoicePrefix}
          onChange={set("invoicePrefix")}
          maxLength={4}
          autoCapitalize="characters"
          className={cn(inputCls(fields.invoicePrefix), "uppercase")}
        />
        {fields.invoicePrefix ? (
          <span className="mt-1 block text-[0.7rem] text-critical">{fields.invoicePrefix}</span>
        ) : (
          <span className="tnum mt-1 block text-[0.68rem] text-muted">
            Numbers read {prefix}/{financialYear()}/00001
          </span>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={busy}>
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? "Saving…" : "Save"}
        </Button>
        {error ? (
          <span role="alert" className="flex items-center gap-1.5 text-[0.72rem] text-critical">
            <AlertCircle className="size-3.5" /> {error}
          </span>
        ) : saved ? (
          <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
            <Check className="size-3.5" /> Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
