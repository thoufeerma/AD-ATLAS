"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Mail, Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge, { type Tone } from "@/components/ui/Badge";
import { api } from "@/lib/api/client";
import {
  EMAIL_KIND_LABEL,
  EMAIL_STATUS_LABEL,
  type EmailLogDetail,
  type EmailLogRow,
  type EmailStatus,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

const TONE: Record<EmailStatus, Tone> = { SENT: "good", FAILED: "critical", CAPTURED: "neutral" };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function EmailLog({
  emails,
  initialId,
  connected,
}: {
  emails: EmailLogRow[];
  initialId: string | null;
  connected: boolean | null;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EmailStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<string | null>(initialId ?? emails[0]?.id ?? null);

  const q = query.trim().toLowerCase();
  const shown = emails.filter(
    (e) =>
      (status === "ALL" || e.status === status) &&
      (!q || e.to.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-4">
      {connected === false && (
        <p className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-[0.76rem] text-[#8a5d00]">
          No email service is connected, so nothing is actually emailed — every message is kept here
          as <strong>Not sent</strong>. Connect one under{" "}
          <Link href="/settings/notifications" className="underline">
            Settings → Notifications
          </Link>
          .
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card bodyClassName="p-0">
          <div className="space-y-3 border-b border-hairline p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search address or subject…"
                className="w-full rounded-lg border border-hairline bg-card py-2 pl-9 pr-3 text-[0.78rem] text-ink placeholder:text-muted focus:border-series-1 focus:outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
              {(["ALL", "SENT", "CAPTURED", "FAILED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className={cn(
                    "rounded-full px-3 py-1 text-[0.7rem]",
                    status === s ? "bg-ink text-white" : "bg-plane text-ink-2 hover:text-ink",
                  )}
                >
                  {s === "ALL" ? "All" : EMAIL_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 ? (
            <p className="p-8 text-center text-[0.8rem] text-ink-2">
              {emails.length === 0 ? "No emails yet — they appear here as orders and messages come in." : "Nothing matches."}
            </p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-hairline overflow-y-auto">
              {shown.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => setSelected(e.id)}
                    aria-current={selected === e.id}
                    className={cn(
                      "block w-full px-4 py-3 text-left hover:bg-plane",
                      selected === e.id && "bg-series-1/5",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[0.78rem] font-medium text-ink">{e.subject}</span>
                      <Badge tone={TONE[e.status]}>{EMAIL_STATUS_LABEL[e.status]}</Badge>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2 text-[0.7rem] text-muted">
                      <span className="truncate">
                        {EMAIL_KIND_LABEL[e.kind] ?? e.kind} · {e.to}
                      </span>
                      <span className="shrink-0">{when(e.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {selected ? <Preview key={selected} id={selected} /> : null}
      </div>
    </div>
  );
}

/** One email, exactly as the recipient sees it. */
function Preview({ id }: { id: string }) {
  const [email, setEmail] = useState<EmailLogDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api<EmailLogDetail>("GET", `/admin/emails/${id}`)
      .then((e) => live && setEmail(e))
      .catch(() => live && setError("Couldn't load this email."));
    return () => {
      live = false;
    };
  }, [id]);

  if (error) return <Card><p className="text-[0.8rem] text-critical">{error}</p></Card>;
  if (!email) {
    return (
      <Card>
        <Loader2 className="mx-auto my-10 size-5 animate-spin text-muted" />
      </Card>
    );
  }

  // The preview frame is locked down, so its links can't be clicked there.
  // Listing them lets you open, say, a confirm-email link while testing.
  const links = [
    ...new Set(
      [...email.html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) =>
        m[1]!.replace(/&amp;/g, "&"),
      ),
    ),
  ];

  return (
    <Card bodyClassName="p-0">
      <dl className="space-y-1 border-b border-hairline p-4 text-[0.74rem]">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">To</dt>
          <dd className="text-ink">{email.to}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">Subject</dt>
          <dd className="font-medium text-ink">{email.subject}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">Status</dt>
          <dd className="text-ink">
            <Badge tone={TONE[email.status]}>{EMAIL_STATUS_LABEL[email.status]}</Badge>
            {email.detail && <span className="ml-2 text-ink-2">{email.detail}</span>}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-muted">When</dt>
          <dd className="text-ink">{new Date(email.createdAt).toLocaleString("en-IN")}</dd>
        </div>
      </dl>
      {/* sandbox with no permissions: the email's HTML can't run scripts or reach this page. */}
      <iframe
        title={`Email: ${email.subject}`}
        sandbox=""
        srcDoc={email.html}
        className="h-[62vh] w-full rounded-b-[var(--radius-card)] bg-white"
      />
      {links.length > 0 && (
        <div className="border-t border-hairline px-4 py-3">
          <p className="text-[0.68rem] font-medium text-ink-2">Links in this email</p>
          <ul className="mt-1 space-y-0.5">
            {links.map((href) => (
              <li key={href} className="truncate text-[0.7rem]">
                <a href={href} target="_blank" rel="noreferrer" className="text-series-1 hover:underline">
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="flex items-center gap-1.5 px-4 py-2 text-[0.66rem] text-muted">
        <Mail className="size-3" /> Images load from the storefront; on a local setup they only show while it&apos;s running.
      </p>
    </Card>
  );
}
