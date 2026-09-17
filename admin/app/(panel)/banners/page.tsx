import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { BannersManager } from "@/components/content/Managers";
import { apiGet } from "@/lib/api/server";
import type { Banner } from "@/lib/api/types";

export const metadata: Metadata = { title: "Banners" };

export default async function Page() {
  const banners = await apiGet<Banner[]>("/admin/banners");
  return (
    <>
      <PageHeader title="Banners" subtitle="Promotional banners across the storefront" />
      <BannersManager banners={banners} />
    </>
  );
}
