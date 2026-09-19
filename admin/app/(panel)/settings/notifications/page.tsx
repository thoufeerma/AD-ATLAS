import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import NotificationsForm from "@/components/settings/NotificationsForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Notifications" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include email settings.
        </p>
      </>
    );
  }

  const settings = await apiGet<SiteSettings>("/admin/settings");
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="The emails customers and the team receive"
      />
      <NotificationsForm settings={settings} editable={can.editStore(admin.role)} myEmail={admin.email} />
    </>
  );
}
