"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, X, Trash2, BadgeCheck } from "lucide-react";
import Badge, { toneFor } from "@/components/ui/Badge";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { api, ApiError } from "@/lib/api/client";
import { humanize, type Review, type ReviewStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5 stars`}>
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

function Actions({ review }: { review: Review }) {
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

  const setStatus = (status: ReviewStatus) =>
    run(() => api("PATCH", `/admin/reviews/${review.id}`, { status }));

  const remove = () => {
    if (!window.confirm(`Delete the review by ${review.authorName}? This can't be undone.`)) return;
    run(() => api("DELETE", `/admin/reviews/${review.id}`));
  };

  const btn = "grid size-7 place-items-center rounded-lg border border-hairline text-muted disabled:opacity-40";

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex gap-1.5">
        {review.status !== "PUBLISHED" && (
          <button onClick={() => setStatus("PUBLISHED")} disabled={busy} aria-label={`Publish review by ${review.authorName}`} title="Publish" className={cn(btn, "hover:border-good hover:text-good")}>
            <Check className="size-3.5" />
          </button>
        )}
        {review.status !== "REJECTED" && (
          <button onClick={() => setStatus("REJECTED")} disabled={busy} aria-label={`Reject review by ${review.authorName}`} title="Reject" className={cn(btn, "hover:border-warning hover:text-[#8a5d00]")}>
            <X className="size-3.5" />
          </button>
        )}
        <button onClick={remove} disabled={busy} aria-label={`Delete review by ${review.authorName}`} title="Delete" className={cn(btn, "hover:border-critical hover:text-critical")}>
          <Trash2 className="size-3.5" />
        </button>
      </span>
      {error && <span role="alert" className="text-[0.65rem] text-critical">{error}</span>}
    </span>
  );
}

const columns: Column<Review>[] = [
  { key: "product", header: "Product", value: (r) => r.product.name, cell: (r) => <span className="font-medium text-ink">{r.product.name}</span> },
  {
    key: "authorName",
    header: "Author",
    cell: (r) => (
      <span className="inline-flex items-center gap-1">
        {r.authorName}
        {r.isVerified && <BadgeCheck className="size-3.5 text-good" aria-label="Verified buyer" />}
      </span>
    ),
  },
  { key: "rating", header: "Rating", cell: (r) => <Stars n={r.rating} /> },
  {
    key: "body",
    header: "Review",
    sortable: false,
    cell: (r) => <span className="line-clamp-2 max-w-[22rem] text-ink-2">{r.body}</span>,
  },
  {
    key: "createdAt",
    header: "Date",
    value: (r) => r.createdAt,
    cell: (r) => new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  },
  { key: "status", header: "Status", cell: (r) => <Badge tone={toneFor(r.status)}>{humanize(r.status)}</Badge> },
  { key: "actions", header: "", sortable: false, align: "right", cell: (r) => <Actions review={r} /> },
];

const filters = [
  { label: "Pending", test: (r: Review) => r.status === "PENDING" },
  { label: "Published", test: (r: Review) => r.status === "PUBLISHED" },
  { label: "Rejected", test: (r: Review) => r.status === "REJECTED" },
  { label: "3★ or lower", test: (r: Review) => r.rating <= 3 },
];

export default function ReviewsTable({ reviews }: { reviews: Review[] }) {
  return (
    <DataTable
      rows={reviews}
      columns={columns}
      rowKey={(r) => r.id}
      filters={filters}
      searchPlaceholder="Search reviews…"
      emptyMessage="No reviews match."
    />
  );
}
