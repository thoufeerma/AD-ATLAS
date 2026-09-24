"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ExternalLink, Loader2, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api/client";

/**
 * Who is carrying the parcel and under what number. Typed in when the order
 * ships, corrected here afterwards — and written by a courier's own system
 * later, without anything that reads it having to change.
 */
export default function TrackingCard({
  number,
  courierName,
  trackingNumber,
  trackingUrl,
  weightGrams,
}: {
  number: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  weightGrams: number | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [courier, setCourier] = useState(courierName ?? "");
  const [awb, setAwb] = useState(trackingNumber ?? "");
  const [url, setUrl] = useState(trackingUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("PATCH", `/admin/orders/${encodeURIComponent(number)}/tracking`, {
        courierName: courier.trim() || null,
        trackingNumber: awb.trim() || null,
        trackingUrl: url.trim() || null,
      });
      setSaved(true);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const weight = weightGrams ? (weightGrams >= 1000 ? `${(weightGrams / 1000).toFixed(2)} kg` : `${weightGrams} g`) : null;

  if (!editing) {
    return (
      <div className="space-y-3">
        {trackingNumber ? (
          <p className="flex items-start gap-2.5 text-[0.78rem] text-ink-2">
            <Truck className="mt-0.5 size-4 shrink-0 text-series-1" />
            <span>
              <span className="block font-medium text-ink">{courierName || "Courier"}</span>
              <span className="tnum block">{trackingNumber}</span>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-0.5 inline-flex items-center gap-1 text-[0.72rem] text-series-1 hover:underline"
                >
                  <ExternalLink className="size-3" /> Follow on their site
                </a>
              )}
            </span>
          </p>
        ) : (
          <p className="text-[0.76rem] leading-relaxed text-ink-2">
            No tracking yet. Add it when you hand the parcel over — it goes into the customer&apos;s email and
            onto Track Order.
          </p>
        )}
        <p className="text-[0.7rem] text-muted">
          {weight ? `Packed weight about ${weight}, from the products in it.` : "No product weights recorded, so the parcel weight is unknown."}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
            {trackingNumber ? "Edit tracking" : "Add tracking"}
          </Button>
          {saved && (
            <span role="status" className="flex items-center gap-1.5 text-[0.72rem] text-good">
              <Check className="size-3.5" /> Saved
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <Field label="Courier" value={courier} onChange={setCourier} placeholder="Delhivery" />
      <Field label="Tracking number" value={awb} onChange={setAwb} placeholder="1234567890" />
      <Field label="Tracking link" value={url} onChange={setUrl} placeholder="https://…" />
      {error && (
        <p role="alert" className="flex items-center gap-2 text-[0.74rem] text-critical">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {busy ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-[0.78rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
      />
    </label>
  );
}
