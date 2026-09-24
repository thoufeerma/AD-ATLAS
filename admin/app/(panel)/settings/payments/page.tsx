import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import PaymentsForm from "@/components/settings/PaymentsForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Payment Methods" };

export default async function PaymentsPage() {
  const admin = await requireAdmin();
  if (!can.editContent(admin.role)) {
    return (
      <>
        <PageHeader title="Payment Methods" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include payment settings.
        </p>
      </>
    );
  }

  const settings = await apiGet<SiteSettings>("/admin/settings");
  const { gateway } = settings.payments;

  return (
    <>
      <PageHeader
        title="Payment Methods"
        subtitle="How customers can pay. Razorpay handles the online ones; cash on delivery needs nothing."
        actions={
          <Badge tone={gateway.mode === "live" ? "good" : gateway.connected ? "info" : "neutral"}>
            {gateway.mode === "simulated"
              ? "Simulated"
              : gateway.connected
                ? `Razorpay ${gateway.mode}`
                : "Razorpay not connected"}
          </Badge>
        }
      />
      <PaymentsForm initial={settings.payments} editable={can.editStore(admin.role)} />
    </>
  );
}
