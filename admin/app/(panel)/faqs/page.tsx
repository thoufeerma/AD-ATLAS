import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { FaqsManager } from "@/components/content/Managers";
import { apiGet } from "@/lib/api/server";
import type { Faq } from "@/lib/api/types";

export const metadata: Metadata = { title: "FAQs" };

export default async function Page() {
  const faqs = await apiGet<Faq[]>("/admin/faqs");
  return (
    <>
      <PageHeader title="FAQs" subtitle="FAQs shown on the storefront, grouped as customers see them" />
      <FaqsManager faqs={faqs} />
    </>
  );
}
