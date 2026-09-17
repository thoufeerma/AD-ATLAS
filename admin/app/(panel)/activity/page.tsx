import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ActivityTable from "@/components/content/ActivityTable";
import { apiGet } from "@/lib/api/server";
import type { ActivityEntry } from "@/lib/api/types";

export const metadata: Metadata = { title: "Activity Logs" };

export default async function ActivityPage() {
  const entries = await apiGet<ActivityEntry[]>("/admin/activity?take=200");
  return (
    <>
      <PageHeader
        title="Activity Logs"
        subtitle="Every change made in the admin panel, newest first · last 200 entries"
      />
      <ActivityTable entries={entries} />
    </>
  );
}
