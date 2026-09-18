import type { Metadata } from "next";
import { Suspense } from "react";
import OrderSuccess from "@/components/checkout/OrderSuccess";
import { getProducts } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you — your Velastia order has been placed successfully.",
  robots: { index: false },
};

export default async function OrderSuccessPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={<div className="container-vel py-24" aria-hidden />}>
      <OrderSuccess products={products} />
    </Suspense>
  );
}
