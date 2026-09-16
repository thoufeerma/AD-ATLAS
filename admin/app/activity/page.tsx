"use client";

import { Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { ACTIVITY } from "@/lib/mock";

type Entry = (typeof ACTIVITY)[number];

const columns: Column<Entry>[] = [
  {
    key: "who",
    header: "Actor",
    cell: (a) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar text-[0.58rem] font-semibold text-pill">
          {a.who === "System" ? "SYS" : a.who.split(" ").map((n) => n[0]).join("")}
        </span>
        <span className="font-medium text-ink">{a.who}</span>
      </span>
    ),
  },
  {
    key: "what",
    header: "Action",
    cell: (a) => <span className="text-ink-2">{a.what}</span>,
  },
  {
    key: "type",
    header: "Module",
    cell: (a) => (
      <Badge tone={a.who === "System" ? "info" : "neutral"} dot={false}>
        {a.type}
      </Badge>
    ),
  },
  { key: "when", header: "When", align: "right" },
];

const filters = [...new Set(ACTIVITY.map((a) => a.type))].map((t) => ({
  label: t,
  test: (a: Entry) => a.type === t,
}));

export default function ActivityPage() {
  return (
    <>
      <PageHeader
        title="Activity Logs"
        subtitle="Every change made in the admin panel, newest first"
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export Logs
          </Button>
        }
      />
      <DataTable
        rows={ACTIVITY}
        columns={columns}
        rowKey={(a) => a.id}
        filters={filters}
        searchPlaceholder="Search activity…"
      />
    </>
  );
}
