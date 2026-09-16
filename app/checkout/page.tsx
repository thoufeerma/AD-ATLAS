import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout, powered by Razorpay.",
};

export default function CheckoutPage() {
  return (
    <>
      <PageBanner
        title="Checkout"
        tone="light"
        lead="You're moments away. Shipping, payment, and a final look before you confirm."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <CheckoutFlow />
    </>
  );
}
