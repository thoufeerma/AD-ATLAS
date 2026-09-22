"use client";

import { useEffect, useState } from "react";
import { Loader2, PackageCheck, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api/client";
import { inrPaise, cn } from "@/lib/utils";

/** What the API tells us about returning one order. */
type ReturnInfo = {
  accepted: boolean;
  windowDays: number;
  instructions: string;
  canRequest: boolean;
  reason: string | null;
  closesAt: string | null;
  items: { id: string; name: string; shade: string | null; quantity: number; returnable: number; unitPricePaise: number }[];
  requests: {
    number: string;
    status: "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";
    reason: string;
    requestedAt: string;
    staffNote: string | null;
    refundPaise: number | null;
  }[];
};

const REASONS = [
  { id: "DAMAGED", label: "It arrived damaged" },
  { id: "WRONG_ITEM", label: "The wrong item was sent" },
  { id: "NOT_AS_DESCRIBED", label: "It isn't as described" },
  { id: "REACTION", label: "It caused a reaction" },
  { id: "CHANGED_MIND", label: "I changed my mind" },
  { id: "OTHER", label: "Something else" },
] as const;

const STATUS_LINE: Record<ReturnInfo["requests"][number]["status"], string> = {
  REQUESTED: "We've got your request and will be in touch shortly.",
  APPROVED: "Approved — send the items back and we'll take it from there.",
  REJECTED: "We couldn't accept this return.",
  RECEIVED: "Your parcel is back with us and being checked.",
  REFUNDED: "Refunded. Bank transfers take 3–5 working days to appear.",
};

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Asking to send part of an order back. Used from the account's order history
 * and from Track Order, where the email address stands in for signing in.
 */
export default function ReturnPanel({ orderNumber, email }: { orderNumber: string; email?: string }) {
  const [info, setInfo] = useState<ReturnInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<(typeof REASONS)[number]["id"]>("DAMAGED");
  const [note, setNote] = useState("");

  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  const path = `/orders/${encodeURIComponent(orderNumber)}/returns`;

  useEffect(() => {
    const ac = new AbortController();
    api<ReturnInfo>("GET", path + query, undefined, { signal: ac.signal })
      .then(setInfo)
      .catch(() => setInfo(null));
    return () => ac.abort();
  }, [path, query]);

  if (!info || (!info.accepted && info.requests.length === 0)) return null;

  const chosen = Object.entries(picked).filter(([, qty]) => qty > 0);
  const refund = chosen.reduce(
    (n, [id, qty]) => n + (info.items.find((i) => i.id === id)?.unitPricePaise ?? 0) * qty,
    0,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (chosen.length === 0) {
      setError("Choose at least one item to send back.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await api(
        "POST",
        path,
        {
          ...(email ? { email } : {}),
          reason,
          ...(note.trim() ? { note: note.trim() } : {}),
          items: chosen.map(([id, quantity]) => ({ orderItemId: id, quantity })),
        },
      );
      const fresh = await api<ReturnInfo>("GET", path + query);
      setInfo(fresh);
      setOpen(false);
      setPicked({});
      setNote("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-50 p-4">
      {info.requests.length > 0 && (
        <ul className="space-y-2.5">
          {info.requests.map((r) => (
            <li key={r.number} className="text-[0.75rem] leading-relaxed">
              <p className="text-plum-800">
                <PackageCheck className="mr-1.5 inline size-3.5 text-gold-600" />
                Return <strong className="font-medium">{r.number}</strong> · asked {day(r.requestedAt)}
              </p>
              <p className="mt-0.5 text-ink-soft">
                {STATUS_LINE[r.status]}
                {r.refundPaise != null && ` (${inrPaise(r.refundPaise)})`}
              </p>
              {r.staffNote && <p className="mt-0.5 text-ink-soft">“{r.staffNote}”</p>}
            </li>
          ))}
        </ul>
      )}

      {info.canRequest ? (
        open ? (
          <form onSubmit={submit} noValidate className="mt-3 space-y-3">
            <p className="text-[0.72rem] leading-relaxed text-ink-soft">{info.instructions}</p>

            <fieldset>
              <legend className="label-caps mb-1.5 text-[0.6rem] text-plum-800">What to send back</legend>
              <ul className="space-y-1.5">
                {info.items
                  .filter((i) => i.returnable > 0)
                  .map((i) => (
                    <li key={i.id} className="flex items-center gap-2.5 text-[0.75rem]">
                      <input
                        id={`ret-${i.id}`}
                        type="checkbox"
                        checked={(picked[i.id] ?? 0) > 0}
                        onChange={(e) =>
                          setPicked((p) => ({ ...p, [i.id]: e.target.checked ? i.returnable : 0 }))
                        }
                        className="size-3.5 accent-plum-800"
                      />
                      <label htmlFor={`ret-${i.id}`} className="flex-1 text-plum-800">
                        {i.name}
                        {i.shade ? ` · ${i.shade}` : ""}
                        <span className="text-ink-soft"> — {inrPaise(i.unitPricePaise)} each</span>
                      </label>
                      {i.returnable > 1 && (picked[i.id] ?? 0) > 0 && (
                        <select
                          value={picked[i.id]}
                          onChange={(e) => setPicked((p) => ({ ...p, [i.id]: Number(e.target.value) }))}
                          aria-label={`How many ${i.name}`}
                          className="rounded-sm border border-gold-200 bg-cream-100 px-1.5 py-0.5 text-[0.7rem] text-plum-800"
                        >
                          {Array.from({ length: i.returnable }, (_, n) => n + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  ))}
              </ul>
            </fieldset>

            <label className="block text-[0.75rem]">
              <span className="label-caps mb-1.5 block text-[0.6rem] text-plum-800">Why</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as typeof reason)}
                className="w-full rounded-sm border border-gold-200 bg-cream-100 px-3 py-2 text-plum-800 focus:border-gold-500 focus:outline-none"
              >
                {REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[0.75rem]">
              <span className="label-caps mb-1.5 block text-[0.6rem] text-plum-800">
                Anything else <span className="normal-case tracking-normal text-ink-soft">(optional)</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder="Tell us what happened."
                className="w-full rounded-sm border border-gold-200 bg-cream-100 px-3 py-2 text-plum-800 placeholder:text-ink-soft/60 focus:border-gold-500 focus:outline-none"
              />
            </label>

            {refund > 0 && (
              <p className="text-[0.72rem] text-ink-soft">
                Refund if everything is accepted: <strong className="text-plum-800">{inrPaise(refund)}</strong>
              </p>
            )}
            {error && (
              <p role="alert" className="text-[0.72rem] text-danger">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={sending}>
                {sending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                {sending ? "Sending…" : "Request return"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className={cn("flex flex-wrap items-center justify-between gap-2", info.requests.length > 0 && "mt-3")}>
            <p className="text-[0.72rem] text-ink-soft">
              Changed your mind or something wrong? You can return this order
              {info.closesAt ? ` until ${day(info.closesAt)}` : ""}.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              <RotateCcw className="size-3.5" /> Request a return
            </Button>
          </div>
        )
      ) : (
        info.reason &&
        info.requests.length === 0 && <p className="text-[0.72rem] text-ink-soft">{info.reason}</p>
      )}
    </div>
  );
}
