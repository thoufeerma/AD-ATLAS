"use client";

import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import type { ActivityEntry } from "@/lib/api/types";

const columns: Column<ActivityEntry>[] = [
  {
    key: "who",
    header: "By",
    value: (a) => a.adminUser?.name ?? "System",
    cell: (a) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar text-[0.58rem] font-semibold text-pill">
          {a.adminUser ? a.adminUser.name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "SYS"}
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{a.adminUser?.name ?? "System"}</span>
          {a.adminUser && <span className="block truncate text-[0.66rem] text-muted">{a.adminUser.email}</span>}
        </span>
      </span>
    ),
  },
  { key: "action", header: "Action", cell: (a) => <span className="text-ink-2">{a.action}</span> },
  {
    key: "entityType",
    header: "Area",
    cell: (a) => (
      <Badge tone="neutral" dot={false}>
        {a.entityType}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "When",
    align: "right",
    value: (a) => a.createdAt,
    cell: (a) =>
      new Date(a.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
  },
];

export default function ActivityTable({ entries }: { entries: ActivityEntry[] }) {
  const areas = [...new Set(entries.map((e) => e.entityType))].sort();
  return (
    <DataTable
      rows={entries}
      columns={columns}
      rowKey={(a) => a.id}
      filters={areas.map((area) => ({ label: area, test: (e: ActivityEntry) => e.entityType === area }))}
      searchPlaceholder="Search activity…"
      emptyMessage="No activity recorded yet."
    />
  );
}
