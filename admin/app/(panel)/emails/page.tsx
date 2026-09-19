import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import EmailLog from "@/components/emails/EmailLog";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type EmailLogRow, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Email Log" };

export default async function EmailsPage({ searchParams }: PageProps<"/emails">) {
  const admin = await requireAdmin();
  if (!can.readOrders(admin.role)) {
    return (
      <>
        <PageHeader title="Email Log" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Emails contain customers&apos; details, so the log is for the people who handle orders.
        </p>
      </>
    );
  }

  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : null;
  const [emails, settings] = await Promise.all([
    apiGet<EmailLogRow[]>("/admin/emails?take=500"),
    // Whether a service is connected; settings are readable by content roles
    // and super admins, so order staff simply don't see the banner.
    can.editContent(admin.role) ? apiGet<SiteSettings>("/admin/settings") : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader title="Email Log" subtitle="Every email the store has sent — or would have sent — newest first" />
      <EmailLog emails={emails} initialId={id} connected={settings ? settings.email.connected : null} />
    </>
  );
}
