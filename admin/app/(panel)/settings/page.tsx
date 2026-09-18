import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import SettingsForms from "@/components/settings/SettingsForms";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type Coupon, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const canEditStore = can.editStore(admin.role);
  const canEditCopy = can.editContent(admin.role);

  if (!canEditCopy) {
    return (
      <>
        <PageHeader title="Settings" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Your role doesn&apos;t include store settings. Ask a Super Administrator if you need
          something changed.
        </p>
      </>
    );
  }

  const [settings, coupons] = await Promise.all([
    apiGet<SiteSettings>("/admin/settings"),
    // The coupon list is super-admin only, and only needed to pick the welcome offer.
    canEditStore ? apiGet<Coupon[]>("/admin/coupons") : Promise.resolve([] as Coupon[]),
  ]);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Store details, the welcome offer and marketing copy shown on the storefront"
      />
      <SettingsForms
        settings={settings}
        coupons={coupons.filter((c) => c.type === "PERCENTAGE")}
        canEditStore={canEditStore}
        canEditCopy={canEditCopy}
      />
    </>
  );
}
