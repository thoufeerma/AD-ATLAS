import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { OffersManager } from "@/components/content/Managers";
import { apiGet } from "@/lib/api/server";
import type { Offer } from "@/lib/api/types";

export const metadata: Metadata = { title: "Offers & Deals" };

export default async function Page() {
  const offers = await apiGet<Offer[]>("/admin/offers");
  return (
    <>
      <PageHeader
        title="Offers & Deals"
        subtitle="Shown on the storefront Offers page while active and in date. Offers are for display — discounts are applied at checkout by coupons."
      />
      <OffersManager offers={offers} />
    </>
  );
}
