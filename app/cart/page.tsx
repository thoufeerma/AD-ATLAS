import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import CartView from "@/components/cart/CartView";
import { bannerHeadlines, getHomeContent, getProducts, getRatingSummary } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your Velastia bag before checkout.",
};

export default async function CartPage() {
  const [products, [giftBanner], rating, content] = await Promise.all([
    getProducts(),
    bannerHeadlines("cart.inline"),
    getRatingSummary(),
    getHomeContent(),
  ]);

  return (
    <>
      <PageBanner
        title="Your Cart"
        script="♥"
        tone="light"
        lead="Great choices! You're just a step away from flawless beauty."
        crumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
        image="/brand/cart-banner.png"
      />
      <CartView
        products={products}
        giftBanner={giftBanner ?? null}
        rating={rating}
        testimonials={content.testimonials}
      />
    </>
  );
}
