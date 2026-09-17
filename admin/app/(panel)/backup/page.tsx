"use client";

import { DatabaseBackup, Download, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import { BACKUPS } from "@/lib/mock";

export default function BackupPage() {
  return (
    <>
      <PageHeader
        title="Backup & Restore"
        subtitle="Snapshots of the catalog, orders and content"
        actions={
          <Button size="sm">
            <DatabaseBackup className="size-3.5" /> Back Up Now
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Available Backups" bodyClassName="p-0">
          <ul className="divide-y divide-hairline">
            {BACKUPS.map((b) => (
              <li key={b.id} className="flex items-center gap-4 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-plane">
                  <DatabaseBackup className="size-4 text-series-1" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.85rem] font-medium text-ink">{b.name}</p>
                  <p className="tnum mt-0.5 text-[0.7rem] text-muted">
                    {b.date} · {b.size}
                  </p>
                </div>
                <Badge tone={b.type === "Automatic" ? "info" : "neutral"} dot={false}>
                  {b.type}
                </Badge>
                <span className="flex gap-1.5">
                  <button
                    aria-label={`Download ${b.name}`}
                    className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-series-1 hover:text-series-1"
                  >
                    <Download className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Restore ${b.name}`}
                    className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-warning hover:text-[#8a5d00]"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Delete ${b.name}`}
                    className="grid size-8 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card title="Schedule">
            <ul className="space-y-4">
              {[
                { label: "Nightly automatic backup", on: true },
                { label: "Back up before bulk edits", on: true },
                { label: "Copy to off-site storage", on: false },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-4">
                  <span className="text-[0.78rem] text-ink-2">{r.label}</span>
                  <Toggle defaultOn={r.on} label={r.label} />
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <label className="mb-1.5 block text-[0.7rem] font-medium text-ink-2">
                Keep backups for
              </label>
              <select className="w-full rounded-lg border border-hairline bg-card px-3.5 py-2.5 text-[0.8rem] text-ink focus:border-series-1 focus:outline-none">
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
            </div>
          </Card>

          <Card title="Maintenance">
            <Button variant="outline" size="sm" className="w-full">
              <Trash2 className="size-3.5" /> Clear Cache
            </Button>
            <p className="mt-2.5 text-[0.68rem] leading-relaxed text-muted">
              Rebuilds the storefront&apos;s cached pages. Safe to run any time.
            </p>

            <div className="mt-5 rounded-xl border border-critical/25 bg-critical/5 p-4">
              <p className="flex items-center gap-2 text-[0.78rem] font-medium text-critical">
                <AlertTriangle className="size-4" /> Danger zone
              </p>
              <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink-2">
                Restoring a backup overwrites current data and cannot be undone.
                Take a fresh backup first.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
