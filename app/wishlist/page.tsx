import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import WishlistView from "@/components/cart/WishlistView";
import { getProducts } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "All your favourite Velastia products, saved for you.",
};

export default async function WishlistPage() {
  const products = await getProducts();

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
      <WishlistView products={products} />
    </>
  );
}
