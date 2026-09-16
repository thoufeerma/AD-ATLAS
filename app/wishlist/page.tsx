import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import WishlistView from "@/components/cart/WishlistView";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "All your favourite Velastia products, saved for you.",
};

export default function WishlistPage() {
  return (
    <>
      <PageBanner
        title="My Wishlist"
        script="♥"
        tone="light"
        lead="All your favorite Velastia products, saved for you."
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        image="/brand/wishlist-banner.png"
      />
      <WishlistView />
    </>
  );
}
