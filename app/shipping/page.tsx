import PolicyPage, { policyMetadata } from "@/components/ui/PolicyPage";

// Text is edited in the admin on the Pages screen.
export const generateMetadata = () => policyMetadata("shipping");

export default function Page() {
  return <PolicyPage slug="shipping" />;
}
