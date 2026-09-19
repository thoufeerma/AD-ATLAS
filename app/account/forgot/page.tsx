import type { Metadata } from "next";
import { Suspense } from "react";
import PageBanner from "@/components/ui/PageBanner";
import ForgotPassword from "@/components/account/ForgotPassword";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageBanner title="Forgot Password" tone="light" crumbs={[{ label: "Home", href: "/" }, { label: "Forgot Password" }]} />
      {/* Reads the link's token from the URL, so it renders in the browser. */}
      <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
        <ForgotPassword />
      </Suspense>
    </>
  );
}
