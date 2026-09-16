import type { Metadata } from "next";
import PolicyPage from "@/components/ui/PolicyPage";
import { RETURNS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Changed your mind? Here is how returns work.",
};

export default function Page() {
  return <PolicyPage policy={RETURNS} />;
}
