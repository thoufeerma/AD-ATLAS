import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { TestimonialsManager } from "@/components/content/Managers";
import { apiGet } from "@/lib/api/server";
import type { Testimonial } from "@/lib/api/types";

export const metadata: Metadata = { title: "Testimonials" };

export default async function Page() {
  const testimonials = await apiGet<Testimonial[]>("/admin/testimonials");
  return (
    <>
      <PageHeader title="Testimonials" subtitle="Featured testimonials appear on the homepage" />
      <TestimonialsManager testimonials={testimonials} />
    </>
  );
}
