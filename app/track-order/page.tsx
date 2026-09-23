import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import PageBanner from "@/components/ui/PageBanner";
import TrackOrder from "@/components/order/TrackOrder";
import { getProducts } from "@/lib/api/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("track-order");
}

export default async function TrackOrderPage() {
  const products = await getProducts();

  return (
    <>
      <PageBanner
        title="Track Your Order"
        script="♥"
        tone="light"
        lead="Stay updated with every step. We're getting your Velastia beauty to you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
        image="/brand/track-banner.png"
      />
      {/* Reads ?order= from the URL, so it renders in the browser. */}
      <Suspense fallback={<div className="container-vel py-24" aria-hidden />}>
        <TrackOrder products={products} />
      </Suspense>
    </>
  );
}
