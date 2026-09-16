import type { Metadata } from "next";
import PolicyPage from "@/components/ui/PolicyPage";
import { SHIPPING } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "How and when your Velastia order reaches you.",
};

export default function Page() {
  return <PolicyPage policy={SHIPPING} />;
}
