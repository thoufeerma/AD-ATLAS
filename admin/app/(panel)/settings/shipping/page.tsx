import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ShippingManager from "@/components/shipping/ShippingManager";
import PickupForm from "@/components/shipping/PickupForm";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type ShippingMethod, type SiteSettings } from "@/lib/api/types";

export const metadata: Metadata = { title: "Shipping Methods" };

export default async function ShippingPage() {
  const admin = await requireAdmin();
  if (!can.editStore(admin.role)) {
    return (
      <>
        <PageHeader title="Shipping Methods" />
        <p className="rounded-[var(--radius-card)] border border-hairline bg-card p-8 text-center text-[0.82rem] text-ink-2">
          Only super administrators can change shipping rates.
        </p>
      </>
    );
  }

  const [methods, settings] = await Promise.all([
    apiGet<ShippingMethod[]>("/admin/shipping-methods"),
    apiGet<SiteSettings>("/admin/settings"),
  ]);
  return (
    <>
      <PageHeader
        title="Shipping Methods"
        subtitle="Delivery options at checkout, and where parcels are collected from"
      />
      <div className="space-y-5">
        <ShippingManager methods={methods} />
        <PickupForm initial={settings.pickup} />
      </div>
    </>
  );
}
