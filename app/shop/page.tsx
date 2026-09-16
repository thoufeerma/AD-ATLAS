import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import ShopBrowser from "@/components/shop/ShopBrowser";
import TrustStrip from "@/components/ui/TrustStrip";

export const metadata: Metadata = {
  title: "Shop Collection",
  description:
    "Premium beauty essentials, crafted with science and luxury for the modern Indian woman.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;

  return (
    <>
      <PageBanner
        title="SHOP COLLECTION"
        lead="Premium beauty essentials, crafted with science and luxury for the modern Indian woman."
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        image="/brand/shop-banner.png"
      />
      <ShopBrowser initialCategory={category} />
      <TrustStrip />
    </>
  );
}
