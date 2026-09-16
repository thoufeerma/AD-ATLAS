import type { Metadata } from "next";
import PolicyPage from "@/components/ui/PolicyPage";
import { TERMS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the Velastia store.",
};

export default function Page() {
  return <PolicyPage policy={TERMS} />;
}
