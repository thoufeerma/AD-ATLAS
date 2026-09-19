import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ShippingManager from "@/components/shipping/ShippingManager";
import { apiGet, requireAdmin } from "@/lib/api/server";
import { can, type ShippingMethod } from "@/lib/api/types";

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

  const methods = await apiGet<ShippingMethod[]>("/admin/shipping-methods");
  return (
    <>
      <PageHeader
        title="Shipping Methods"
        subtitle="Delivery options, rates and free-shipping amounts offered at checkout"
      />
      <ShippingManager methods={methods} />
    </>
  );
}
