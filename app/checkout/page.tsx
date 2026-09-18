import type { Metadata } from "next";
import PageBanner from "@/components/ui/PageBanner";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { getProducts } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout for your Velastia order.",
};

export default async function CheckoutPage() {
  const products = await getProducts();

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
      <CheckoutFlow products={products} />
    </>
  );
}
