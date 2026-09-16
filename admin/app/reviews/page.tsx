"use client";

import { Star, Check, X, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { REVIEWS, type Review } from "@/lib/mock";
import { cn } from "@/lib/utils";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3", i <= n ? "text-warning" : "text-[#dedce6]")}
          fill={i <= n ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

const columns: Column<Review>[] = [
  {
    key: "product",
    header: "Product",
    cell: (r) => <span className="font-medium text-ink">{r.product}</span>,
  },
  { key: "author", header: "Author" },
  {
    key: "rating",
    header: "Rating",
    cell: (r) => <Stars n={r.rating} />,
  },
  {
    key: "body",
    header: "Review",
    sortable: false,
    cell: (r) => (
      <span className="line-clamp-2 max-w-[22rem] text-ink-2">{r.body}</span>
    ),
  },
  { key: "date", header: "Date" },
  {
    key: "status",
    header: "Status",
    cell: (r) => <Badge tone={toneFor(r.status)}>{r.status}</Badge>,
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    align: "right",
    cell: (r) => (
      <span className="inline-flex gap-1.5">
        {r.status !== "Published" && (
          <button
            aria-label={`Approve review by ${r.author}`}
            className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-good hover:text-good"
          >
            <Check className="size-3.5" />
          </button>
        )}
        {r.status !== "Rejected" && (
          <button
            aria-label={`Reject review by ${r.author}`}
            className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-warning hover:text-[#8a5d00]"
          >
            <X className="size-3.5" />
          </button>
        )}
        <button
          aria-label={`Delete review by ${r.author}`}
          className="grid size-7 place-items-center rounded-lg border border-hairline text-muted hover:border-critical hover:text-critical"
        >
          <Trash2 className="size-3.5" />
        </button>
      </span>
    ),
  },
];

const filters = [
  { label: "Pending", test: (r: Review) => r.status === "Pending" },
  { label: "Published", test: (r: Review) => r.status === "Published" },
  { label: "Rejected", test: (r: Review) => r.status === "Rejected" },
  { label: "Low Rated", test: (r: Review) => r.rating <= 3 },
];

export default function ReviewsPage() {
  const pending = REVIEWS.filter((r) => r.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle={
          pending > 0
            ? `${pending} awaiting moderation`
            : "Everything is moderated — nothing waiting"
        }
      />
      <DataTable
        rows={REVIEWS}
        columns={columns}
        rowKey={(r) => r.id}
        filters={filters}
        searchPlaceholder="Search reviews…"
      />
    </>
  );
}
