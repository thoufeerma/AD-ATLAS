import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import CouponsManager from "@/components/coupons/CouponsManager";
import { apiGet } from "@/lib/api/server";
import type { Coupon } from "@/lib/api/types";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const coupons = await apiGet<Coupon[]>("/admin/coupons");
  const active = coupons.filter((c) => c.isActive).length;

  return (
    <>
      <PageHeader title="Coupons" subtitle={`${active} active of ${coupons.length}`} />
      <CouponsManager coupons={coupons} />
    </>
  );
}
