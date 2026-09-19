"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, Phone, RotateCcw, Search, Trash2, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api, ApiError } from "@/lib/api/client";
import type { CollabApplication, ContactMessage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Item =
  | { kind: "message"; row: ContactMessage }
  | { kind: "application"; row: CollabApplication };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function InboxList({
  messages,
  applications,
  emptyMessage,
}: {
  messages?: ContactMessage[];
  applications?: CollabApplication[];
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const items: Item[] = [
    ...(messages ?? []).map((row) => ({ kind: "message" as const, row })),
    ...(applications ?? []).map((row) => ({ kind: "application" as const, row })),
  ];

  const q = query.trim().toLowerCase();
  const shown = q
    ? items.filter(({ row }) => Object.values(row).some((v) => typeof v === "string" && v.toLowerCase().includes(q)))
    : items;

  return (
    <div className="space-y-4">
      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        <span className="sr-only">Search</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email or text…"
          className="w-full rounded-lg border border-hairline bg-card py-2 pl-9 pr-3 text-[0.78rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
        />
      </label>

      {shown.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-10 text-center text-[0.8rem] text-ink-2">
          {q ? "Nothing matches that search." : emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((item) => (
            <li key={item.row.id}>
              {item.kind === "message" ? <MessageCard m={item.row} /> : <ApplicationCard a={item.row} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageCard({ m }: { m: ContactMessage }) {
  return (
    <Shell
      done={m.isHandled}
      title={m.subject}
      date={m.createdAt}
      from={m.name}
      email={m.email}
      phone={m.phone}
      replySubject={`Re: ${m.subject}`}
      body={m.message}
      endpoint={`/admin/inbox/messages/${m.id}`}
      doneField="isHandled"
      doneLabel="Mark done"
      what={`the message from ${m.name}`}
    />
  );
}

function ApplicationCard({ a }: { a: CollabApplication }) {
  return (
    <Shell
      done={a.isReviewed}
      title={`Collab application · ${a.handle}`}
      date={a.createdAt}
      from={a.name}
      email={a.email}
      extra={
        a.audienceSize ? (
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" /> {a.audienceSize} audience
          </span>
        ) : null
      }
      replySubject="Your Velastia collab application"
      body={a.about}
      endpoint={`/admin/inbox/applications/${a.id}`}
      doneField="isReviewed"
      doneLabel="Mark reviewed"
      what={`the application from ${a.name}`}
    />
  );
}

function Shell({
  done,
  title,
  date,
  from,
  email,
  phone,
  extra,
  replySubject,
  body,
  endpoint,
  doneField,
  doneLabel,
  what,
}: {
  done: boolean;
  title: string;
  date: string;
  from: string;
  email: string;
  phone?: string | null;
  extra?: React.ReactNode;
  replySubject: string;
  body: string;
  endpoint: string;
  doneField: "isHandled" | "isReviewed";
  doneLabel: string;
  what: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  const toggle = () => run(() => api("PATCH", endpoint, { [doneField]: !done }));
  const remove = () => {
    if (!window.confirm(`Delete ${what}? This can't be undone.`)) return;
    run(() => api("DELETE", endpoint));
  };

  const action =
    "inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-[0.72rem] font-medium disabled:opacity-40";

  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border bg-card p-5",
        done ? "border-hairline opacity-75" : "border-series-1/30",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[0.9rem] font-semibold text-ink">{title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-ink-2">
            <span className="font-medium text-ink">{from}</span>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:text-series-1">
              <Mail className="size-3" /> {email}
            </a>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 hover:text-series-1">
                <Phone className="size-3" /> {phone}
              </a>
            )}
            {extra}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[0.7rem] text-muted">{when(date)}</span>
          <Badge tone={done ? "neutral" : "warning"}>{done ? "Done" : "Open"}</Badge>
        </div>
      </header>

      <p className="mt-3.5 whitespace-pre-line text-[0.8rem] leading-relaxed text-ink">{body}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(replySubject)}`}
          className={cn(action, "border-series-1/40 text-series-1 hover:bg-series-1/5")}
        >
          <Mail className="size-3.5" /> Reply by email
        </a>
        <button onClick={toggle} disabled={busy} className={cn(action, "text-ink-2 hover:border-good hover:text-good")}>
          {done ? <RotateCcw className="size-3.5" /> : <Check className="size-3.5" />}
          {done ? "Reopen" : doneLabel}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className={cn(action, "text-muted hover:border-critical hover:text-critical")}
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
        {error && (
          <span role="alert" className="text-[0.7rem] text-critical">
            {error}
          </span>
        )}
      </footer>
    </article>
  );
}
