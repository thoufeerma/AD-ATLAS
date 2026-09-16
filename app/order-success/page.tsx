import type { Metadata } from "next";
import { Suspense } from "react";
import OrderSuccess from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Thank you — your Velastia order has been placed successfully.",
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-vel py-24" aria-hidden />}>
      <OrderSuccess />
    </Suspense>
  );
}
