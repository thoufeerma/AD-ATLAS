import PolicyPage, { policyMetadata } from "@/components/ui/PolicyPage";

// Text is edited in the admin on the Pages screen.
export const generateMetadata = () => policyMetadata("privacy");

export default function Page() {
  return <PolicyPage slug="privacy" />;
}
