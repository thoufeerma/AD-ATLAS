import type { Metadata } from "next";
import PolicyPage from "@/components/ui/PolicyPage";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What we collect, why, and the control you have over it.",
};

export default function Page() {
  return <PolicyPage policy={PRIVACY} />;
}
