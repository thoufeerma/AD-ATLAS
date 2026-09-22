"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, PackageCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api/client";
import {
  RETURN_NEXT,
  RETURN_REASON_LABEL,
  RETURN_STATUS_LABEL,
  type ReturnRequest,
  type ReturnStatus,
} from "@/lib/api/types";
import { inr } from "@/lib/utils";

const TONE: Record<ReturnStatus, "warning" | "good" | "info" | "critical" | "neutral"> = {
  REQUESTED: "warning",
  APPROVED: "info",
  RECEIVED: "good",
  REFUNDED: "neutral",
  REJECTED: "critical",
};

/** What each button does, in the team's words. */
const ACTION: Record<ReturnStatus, string> = {
  APPROVED: "Approve",
  REJECTED: "Reject",
  RECEIVED: "Mark received",
  REFUNDED: "Mark refunded",
  REQUESTED: "Reopen",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function ReturnsList({ requests, emptyMessage }: { requests: ReturnRequest[]; emptyMessage: string }) {
  if (requests.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-10 text-center text-[0.8rem] text-ink-2">
        {emptyMessage}
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.number}>
          <ReturnCard request={r} />
        </li>
      ))}
    </ul>
  );
}

function ReturnCard({ request: r }: { request: ReturnRequest }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState((r.suggestedRefundPaise / 100).toString());
  const [busy, setBusy] = useState<ReturnStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const next = RETURN_NEXT[r.status];

  async function move(status: ReturnStatus) {
    setBusy(status);
    setError(null);
    try {
      await api("PATCH", `/admin/returns/${r.number}`, {
        status,
        ...(note.trim() ? { staffNote: note.trim() } : {}),
        ...(status === "REFUNDED" ? { refundPaise: Math.round(Number(amount) * 100) } : {}),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save that — try again.");
      setBusy(null);
    }
  }

  const refundInvalid = !Number.isFinite(Number(amount)) || Number(amount) < 0;

  return (
    <article className="rounded-[var(--radius-card)] border border-hairline bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[0.88rem] font-medium text-ink">{r.number}</h3>
            <Badge tone={TONE[r.status]} dot={false}>
              {RETURN_STATUS_LABEL[r.status]}
            </Badge>
            <span className="text-[0.72rem] text-muted">{RETURN_REASON_LABEL[r.reason]}</span>
          </div>
          <p className="mt-1 text-[0.72rem] text-ink-2">
            {r.order.shipName} ·{" "}
            <a href={`mailto:${r.order.email}`} className="hover:text-series-1">
              {r.order.email}
            </a>{" "}
            · {r.order.shipPhone}
          </p>
          <p className="mt-0.5 text-[0.68rem] text-muted">
            Asked {when(r.requestedAt)} ·{" "}
            <Link href={`/orders/${r.order.number}`} className="hover:text-series-1">
              Order #{r.order.number}
            </Link>{" "}
            ({inr(r.order.totalPaise / 100)}
            {r.order.paymentMethod === "COD" ? ", cash on delivery" : ""})
          </p>
        </div>
        <p className="tnum shrink-0 text-right text-[0.82rem] font-medium text-ink">
          {inr((r.refundPaise ?? r.suggestedRefundPaise) / 100)}
          <span className="block text-[0.66rem] font-normal text-muted">
            {r.refundPaise != null ? "refunded" : "if refunded in full"}
          </span>
          {r.creditNote && (
            <a
              href={`/api/v1/admin/orders/${encodeURIComponent(r.order.number)}/credit-notes/${r.creditNote.id}`}
              target="_blank"
              rel="noopener"
              className="mt-0.5 block text-[0.66rem] font-normal text-series-1 hover:underline"
            >
              Credit note {r.creditNote.number}
            </a>
          )}
        </p>
      </div>

      <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
        {r.items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 py-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.78rem] text-ink">
                {i.name}
                {i.shade ? ` — ${i.shade}` : ""}
              </span>
              <span className="block text-[0.66rem] text-muted">{i.sku}</span>
            </span>
            <span className="tnum text-[0.72rem] text-ink-2">
              {i.quantity} of {i.orderedQuantity}
            </span>
            <span className="tnum w-20 text-right text-[0.76rem] text-ink-2">
              {inr((i.unitPricePaise * i.quantity) / 100)}
            </span>
          </li>
        ))}
      </ul>

      {r.note && (
        <p className="mt-3 rounded-lg bg-plane p-3 text-[0.75rem] leading-relaxed text-ink-2">“{r.note}”</p>
      )}
      {r.staffNote && (
        <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
          <span className="font-medium text-ink-2">Your note:</span> {r.staffNote}
        </p>
      )}

      {next.length > 0 ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
              Note to the customer <span className="font-normal text-muted">(sent with the email)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="e.g. Our courier will collect the parcel on Tuesday."
              className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-[0.78rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
            />
          </label>

          {next.includes("REFUNDED") && (
            <label className="flex items-center gap-2">
              <span className="text-[0.7rem] font-medium text-ink-2">Refund amount ₹</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="tnum w-32 rounded-lg border border-hairline bg-card px-3 py-1.5 text-[0.78rem] text-ink focus:border-series-1 focus:outline-none"
              />
              <span className="text-[0.68rem] text-muted">
                items come to {inr(r.suggestedRefundPaise / 100)}
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-2">
            {next.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => move(status)}
                disabled={busy !== null || (status === "REFUNDED" && refundInvalid)}
                className={
                  status === "REJECTED"
                    ? "inline-flex items-center gap-1.5 rounded-lg border border-critical/30 bg-critical/5 px-3 py-1.5 text-[0.74rem] font-medium text-critical hover:bg-critical/10 disabled:opacity-45"
                    : "inline-flex items-center gap-1.5 rounded-lg bg-series-1 px-3 py-1.5 text-[0.74rem] font-medium text-white hover:bg-[#5c3cc4] disabled:opacity-45"
                }
              >
                {busy === status ? <Loader2 className="size-3.5 animate-spin" /> : <PackageCheck className="size-3.5" />}
                {ACTION[status]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[0.72rem] text-muted">
          Closed {r.resolvedAt ? when(r.resolvedAt) : ""}.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-[0.72rem] text-critical">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </article>
  );
}
