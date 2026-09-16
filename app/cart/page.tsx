import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your Velastia bag before checkout.",
};

export default function CartPage() {
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
      <CartView />
    </>
  );
}
