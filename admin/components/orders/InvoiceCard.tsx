"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ExternalLink, FileText, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/api/types";

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * The order's GST invoice: open it, or create it early to print for the
 * parcel. Marking the order shipped creates it anyway.
 */
export default function InvoiceCard({
  number,
  status,
  invoiceNumber,
  invoicedAt,
  configured,
}: {
  number: string;
  status: OrderStatus;
  invoiceNumber: string | null;
  invoicedAt: string | null;
  configured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const href = `/api/v1/admin/orders/${encodeURIComponent(number)}/invoice`;

  if (invoiceNumber) {
    return (
      <div className="space-y-3">
        <p className="flex items-start gap-2.5 text-[0.78rem] text-ink-2">
          <FileText className="mt-0.5 size-4 shrink-0 text-series-1" />
          <span>
            <span className="tnum block font-medium text-ink">{invoiceNumber}</span>
            {invoicedAt && <span className="block text-[0.72rem] text-muted">Issued {day(invoicedAt)}</span>}
          </span>
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-[0.74rem] font-medium text-ink hover:border-series-1 hover:text-series-1"
        >
          <ExternalLink className="size-3.5" /> Open to print or save as PDF
        </a>
        {status === "CANCELLED" && (
          <p className="text-[0.7rem] leading-relaxed text-muted">
            The order was cancelled after this invoice was issued. It stays in the GST summary, marked
            cancelled, so your accountant can cancel it or raise a credit note.
          </p>
        )}
      </div>
    );
  }

  if (!configured) {
    return (
      <p className="text-[0.76rem] leading-relaxed text-ink-2">
        Invoices start once your GST details are saved under{" "}
        <Link href="/settings/tax" className="font-medium text-series-1 hover:underline">
          Tax Settings
        </Link>
        .
      </p>
    );
  }

  if (status === "PENDING" || status === "CANCELLED") {
    return (
      <p className="text-[0.76rem] text-ink-2">
        {status === "PENDING" ? "No invoice until the order is confirmed." : "Cancelled before it was invoiced."}
      </p>
    );
  }

  async function create() {
    setBusy(true);
    setError(null);
    try {
      await api("POST", `/admin/orders/${encodeURIComponent(number)}/invoice`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[0.76rem] leading-relaxed text-ink-2">
        Created automatically when the order is marked shipped. Create it now if you want to print it
        for the parcel.
      </p>
      <Button size="sm" variant="outline" onClick={create} disabled={busy}>
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
        {busy ? "Creating…" : "Create invoice"}
      </Button>
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-[0.72rem] text-critical">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
