"use client";

import { Plus, Pencil, ExternalLink } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { PAGES } from "@/lib/mock";

type Page = (typeof PAGES)[number];

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL ?? "http://localhost:3000";

const columns: Column<Page>[] = [
  {
    key: "title",
    header: "Page",
    cell: (p) => <span className="font-medium text-ink">{p.title}</span>,
  },
  {
    key: "slug",
    header: "URL",
    cell: (p) => <span className="text-ink-2">{p.slug}</span>,
  },
  { key: "updated", header: "Last Updated" },
  {
    key: "status",
    header: "Status",
    cell: (p) => <Badge tone={toneFor(p.status)}>{p.status}</Badge>,
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    align: "right",
    cell: (p) => (
      <span className="inline-flex items-center gap-3">
        <button className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline">
          <Pencil className="size-3" /> Edit
        </button>
        <a
          href={`${STORE_URL}${p.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[0.72rem] text-ink-2 hover:text-ink"
        >
          View <ExternalLink className="size-3" />
        </a>
      </span>
    ),
  },
];

const filters = [
  { label: "Published", test: (p: Page) => p.status === "Published" },
  { label: "Draft", test: (p: Page) => p.status === "Draft" },
];

export default function PagesPage() {
  return (
    <>
      <PageHeader
        title="Pages"
        subtitle="Static storefront pages and their published state"
        actions={
          <Button size="sm">
            <Plus className="size-3.5" /> New Page
          </Button>
        }
      />
      <DataTable
        rows={PAGES}
        columns={columns}
        rowKey={(p) => p.id}
        filters={filters}
        searchPlaceholder="Search pages…"
      />
    </>
  );
}
