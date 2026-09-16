import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import TrackOrder from "@/components/order/TrackOrder";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Stay updated with every step. We're getting your Velastia beauty to you.",
};

export default function TrackOrderPage() {
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
      <TrackOrder />
    </>
  );
}
