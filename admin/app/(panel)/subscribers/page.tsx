import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import SubscribersTable from "@/components/subscribers/SubscribersTable";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type Subscriber } from "@/lib/api/types";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Subscribers" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include the newsletter list.
        </p>
      </>
    );
  }

  const subscribers = await apiGet<Subscriber[]>("/admin/subscribers");
  const active = subscribers.filter((s) => s.status === "SUBSCRIBED").length;

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle={`${active.toLocaleString("en-IN")} subscribed · sign-ups from the storefront newsletter form`}
      />
      <SubscribersTable subscribers={subscribers} />
    </>
  );
}
