"use client";

import { Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { CAMPAIGNS } from "@/lib/mock";
import { num, pct } from "@/lib/utils";

type Campaign = (typeof CAMPAIGNS)[number];

const rate = (a: number, b: number) => (b === 0 ? 0 : (a / b) * 100);

const columns: Column<Campaign>[] = [
  {
    key: "name",
    header: "Campaign",
    cell: (c) => <span className="font-medium text-ink">{c.name}</span>,
  },
  { key: "date", header: "Date" },
  { key: "sent", header: "Sent", align: "right", cell: (c) => num(c.sent) },
  {
    key: "open",
    header: "Open Rate",
    align: "right",
    value: (c) => rate(c.opened, c.sent),
    cell: (c) => (c.sent ? pct(rate(c.opened, c.sent)) : "—"),
  },
  {
    key: "click",
    header: "Click Rate",
    align: "right",
    value: (c) => rate(c.clicked, c.sent),
    cell: (c) => (c.sent ? pct(rate(c.clicked, c.sent)) : "—"),
  },
  {
    key: "status",
    header: "Status",
    cell: (c) => <Badge tone={toneFor(c.status)}>{c.status}</Badge>,
  },
];

const filters = [
  { label: "Sent", test: (c: Campaign) => c.status === "Sent" },
  { label: "Scheduled", test: (c: Campaign) => c.status === "Scheduled" },
  { label: "Automated", test: (c: Campaign) => c.status === "Automated" },
  { label: "Draft", test: (c: Campaign) => c.status === "Draft" },
];

export default function CampaignsPage() {
  const sent = CAMPAIGNS.reduce((n, c) => n + c.sent, 0);

  return (
    <>
      <PageHeader
        title="Email Campaigns"
        subtitle={`${num(sent)} emails sent across all campaigns`}
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> New Campaign
          </Button>
        }
      />
      <DataTable
        rows={CAMPAIGNS}
        columns={columns}
        rowKey={(c) => c.id}
        filters={filters}
        searchPlaceholder="Search campaigns…"
      />
    </>
  );
}
