import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import ReturnsList from "@/components/returns/ReturnsList";
import { apiGet } from "@/lib/api/server";
import type { ReturnRequest, ReturnStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Returns" };

const FILTERS = [
  { id: "open", label: "Open", empty: "No returns to deal with right now." },
  { id: "REQUESTED", label: "Requested", empty: "Nothing is waiting for a decision." },
  { id: "APPROVED", label: "Approved", empty: "Nothing is on its way back to you." },
  { id: "RECEIVED", label: "Received", empty: "Nothing is waiting to be refunded." },
  { id: "REFUNDED", label: "Refunded", empty: "No refunds recorded yet." },
  { id: "REJECTED", label: "Rejected", empty: "You haven't turned any requests down." },
  { id: "all", label: "All", empty: "No return requests yet. They appear here as soon as a customer asks." },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default async function ReturnsPage({ searchParams }: PageProps<"/returns">) {
  const sp = await searchParams;
  const filter: FilterId = FILTERS.some((f) => f.id === sp.filter) ? (sp.filter as FilterId) : "open";
  const query =
    filter === "open" ? "?open=true" : filter === "all" ? "" : `?status=${filter as ReturnStatus}`;

  const requests = await apiGet<ReturnRequest[]>(`/admin/returns${query}`);
  const chosen = FILTERS.find((f) => f.id === filter)!;

  return (
    <>
      <PageHeader
        title="Returns"
        subtitle="What customers have asked to send back. Approving emails them the go-ahead; marking a return refunded records what you paid back — the money itself is moved by you."
      />

      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filter returns">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/returns?filter=${f.id}`}
            aria-current={f.id === filter}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[0.74rem] font-medium transition-colors",
              f.id === filter
                ? "bg-series-1 text-white"
                : "border border-hairline bg-card text-ink-2 hover:border-series-1 hover:text-series-1",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <ReturnsList requests={requests} emptyMessage={chosen.empty} />
    </>
  );
}
