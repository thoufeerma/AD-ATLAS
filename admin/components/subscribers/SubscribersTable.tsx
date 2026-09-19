"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, UserMinus, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { api, ApiError } from "@/lib/api/client";
import { humanize, type Subscriber } from "@/lib/api/types";

function Action({ s }: { s: Subscriber }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (s.status === "BOUNCED") return null;

  const next = s.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED";
  async function toggle() {
    if (next === "SUBSCRIBED" && !window.confirm(`Re-subscribe ${s.email}? Only do this if they asked to be added back.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("PATCH", `/admin/subscribers/${s.id}`, { status: next });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center gap-1 text-[0.72rem] text-muted hover:text-ink disabled:opacity-40"
      >
        {next === "UNSUBSCRIBED" ? <UserMinus className="size-3" /> : <UserPlus className="size-3" />}
        {next === "UNSUBSCRIBED" ? "Unsubscribe" : "Re-subscribe"}
      </button>
      {error && <span role="alert" className="text-[0.65rem] text-critical">{error}</span>}
    </span>
  );
}

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const columns: Column<Subscriber>[] = [
  { key: "email", header: "Email", cell: (s) => <span className="font-medium text-ink">{s.email}</span> },
  { key: "source", header: "Source", value: (s) => s.source ?? "", cell: (s) => s.source ?? "—" },
  { key: "createdAt", header: "Subscribed", value: (s) => s.createdAt, cell: (s) => date(s.createdAt) },
  { key: "status", header: "Status", cell: (s) => <Badge tone={toneFor(s.status)}>{humanize(s.status)}</Badge> },
  { key: "actions", header: "", sortable: false, align: "right", cell: (s) => <Action s={s} /> },
];

const filters = [
  { label: "Subscribed", test: (s: Subscriber) => s.status === "SUBSCRIBED" },
  { label: "Unsubscribed", test: (s: Subscriber) => s.status === "UNSUBSCRIBED" },
];

/** Spreadsheet-safe CSV: quotes every field and neutralises formula prefixes. */
function toCsv(rows: Subscriber[]) {
  const cell = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const lines = [
    ["email", "status", "source", "subscribed_at"].map(cell).join(","),
    ...rows.map((s) => [s.email, s.status.toLowerCase(), s.source ?? "", s.createdAt].map(cell).join(",")),
  ];
  return lines.join("\r\n");
}

export default function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  function exportCsv() {
    // Only people who are still subscribed — never mail anyone who opted out.
    const active = subscribers.filter((s) => s.status === "SUBSCRIBED");
    const blob = new Blob([toCsv(active)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velastia-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={!subscribers.some((s) => s.status === "SUBSCRIBED")}>
          <Download className="size-3.5" /> Export subscribed (CSV)
        </Button>
      </div>
      <DataTable
        rows={subscribers}
        columns={columns}
        rowKey={(s) => s.id}
        filters={filters}
        searchPlaceholder="Search emails…"
        emptyMessage="No subscribers yet — sign-ups from the storefront footer appear here."
      />
    </>
  );
}
