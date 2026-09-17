"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import { humanize, type OrderStatus } from "@/lib/api/types";

/**
 * Mirrors the API's transition table so the menu only offers moves that will
 * succeed. The API still enforces it — this is for the admin's convenience,
 * not the rule itself.
 */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const CONFIRM: Partial<Record<OrderStatus, string>> = {
  CANCELLED: "Cancel this order? Its items go back into stock. This can't be undone.",
  REFUNDED: "Mark this order as refunded? This can't be undone.",
};

export default function StatusControl({
  number,
  status,
}: {
  number: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const options = NEXT[status];
  const [next, setNext] = useState<OrderStatus | "">(options[0] ?? "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (options.length === 0) {
    return (
      <p className="text-[0.8rem] text-ink-2">
        This order is <strong className="font-medium text-ink">{humanize(status)}</strong> — it
        can&apos;t move to another status.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!next) return;
    const warning = CONFIRM[next];
    if (warning && !window.confirm(warning)) return;

    setPending(true);
    setError(null);
    try {
      await api("PATCH", `/admin/orders/${encodeURIComponent(number)}/status`, {
        status: next,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update the order. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
        <div>
          <label htmlFor="next-status" className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
            Move to
          </label>
          <select
            id="next-status"
            value={next}
            onChange={(e) => setNext(e.target.value as OrderStatus)}
            className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none"
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-note" className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
            Note <span className="font-normal text-muted">(optional, shown on the timeline)</span>
          </label>
          <input
            id="status-note"
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Shipped via Delhivery, AWB 1234567890"
            className="w-full rounded-lg border border-hairline bg-card px-3 py-2.5 text-[0.8rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-2 text-[0.76rem] text-critical">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !next}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[0.78rem] font-medium text-white transition-colors disabled:opacity-50 ${
          next === "CANCELLED" || next === "REFUNDED"
            ? "bg-critical hover:bg-[#b83232]"
            : "bg-series-1 hover:bg-[#5c3cc4]"
        }`}
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Updating…" : `Mark as ${next ? humanize(next) : "…"}`}
      </button>
    </form>
  );
}
