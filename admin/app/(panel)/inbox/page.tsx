import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import InboxList from "@/components/inbox/InboxList";
import { apiGet } from "@/lib/api/server";
import type { CollabApplication, ContactMessage, InboxCounts } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inbox" };

const TABS = [
  { id: "messages", label: "Contact Messages" },
  { id: "applications", label: "Collab Applications" },
] as const;
const STATUSES = [
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type StatusId = (typeof STATUSES)[number]["id"];

export default async function InboxPage({ searchParams }: PageProps<"/inbox">) {
  const sp = await searchParams;
  const tab: TabId = sp.tab === "applications" ? "applications" : "messages";
  const status: StatusId = sp.status === "done" || sp.status === "all" ? sp.status : "open";

  const [counts, rows] = await Promise.all([
    apiGet<InboxCounts>("/admin/inbox/counts"),
    tab === "messages"
      ? apiGet<ContactMessage[]>(`/admin/inbox/messages?status=${status}`)
      : apiGet<CollabApplication[]>(`/admin/inbox/applications?status=${status}`),
  ]);

  const href = (t: TabId, s: StatusId) => `/inbox?tab=${t}&status=${s}`;
  const open = { messages: counts.messages, applications: counts.applications };

  return (
    <>
      <PageHeader
        title="Inbox"
        subtitle="What shoppers send from the storefront's Contact and Collabs pages. Reply by email, then mark it done."
      />

      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Inbox sections">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={href(t.id, status)}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[0.78rem] font-medium",
              tab === t.id
                ? "border-series-1 bg-series-1/5 text-series-1"
                : "border-hairline bg-card text-ink-2 hover:text-ink",
            )}
          >
            {t.label}
            {open[t.id] > 0 && (
              <span className="tnum rounded-full bg-series-1 px-1.5 py-0.5 text-[0.62rem] text-white">
                {open[t.id]}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mb-5 flex gap-1.5" role="group" aria-label="Filter by status">
        {STATUSES.map((s) => (
          <Link
            key={s.id}
            href={href(tab, s.id)}
            aria-current={status === s.id ? "true" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-[0.72rem]",
              status === s.id ? "bg-ink text-white" : "bg-plane text-ink-2 hover:text-ink",
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {tab === "messages" ? (
        <InboxList
          messages={rows as ContactMessage[]}
          emptyMessage={status === "open" ? "No open messages — you're all caught up." : "No messages here."}
        />
      ) : (
        <InboxList
          applications={rows as CollabApplication[]}
          emptyMessage={status === "open" ? "No open applications." : "No applications here."}
        />
      )}
    </>
  );
}
