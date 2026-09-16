"use client";

import { Download, UserMinus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { SUBSCRIBERS } from "@/lib/mock";

type Subscriber = (typeof SUBSCRIBERS)[number];

const columns: Column<Subscriber>[] = [
  {
    key: "email",
    header: "Email",
    cell: (s) => <span className="font-medium text-ink">{s.email}</span>,
  },
  { key: "source", header: "Source" },
  { key: "date", header: "Subscribed" },
  {
    key: "status",
    header: "Status",
    cell: (s) => <Badge tone={toneFor(s.status)}>{s.status}</Badge>,
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    align: "right",
    cell: (s) =>
      s.status === "Subscribed" ? (
        <button className="inline-flex items-center gap-1 text-[0.72rem] text-muted hover:text-critical">
          <UserMinus className="size-3" /> Unsubscribe
        </button>
      ) : null,
  },
];

const filters = [
  { label: "Subscribed", test: (s: Subscriber) => s.status === "Subscribed" },
  { label: "Unsubscribed", test: (s: Subscriber) => s.status === "Unsubscribed" },
  { label: "Bounced", test: (s: Subscriber) => s.status === "Bounced" },
];

export default function SubscribersPage() {
  const active = SUBSCRIBERS.filter((s) => s.status === "Subscribed").length;

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle={`${active} active subscribers on the mailing list`}
        actions={
          <Button size="sm">
            <Download className="size-3.5" /> Export List
          </Button>
        }
      />
      <DataTable
        rows={SUBSCRIBERS}
        columns={columns}
        rowKey={(s) => s.id}
        filters={filters}
        searchPlaceholder="Search by email…"
      />
    </>
  );
}
