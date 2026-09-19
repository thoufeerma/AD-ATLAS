import type { Metadata } from "next";
import { Suspense } from "react";
import PageBanner from "@/components/ui/PageBanner";
import ResetPassword from "@/components/account/ResetPassword";

export const metadata: Metadata = { title: "Reset Password", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageBanner title="Reset Password" tone="light" crumbs={[{ label: "Home", href: "/" }, { label: "Reset Password" }]} />
      {/* Reads the link's token from the URL, so it renders in the browser. */}
      <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
        <ResetPassword />
      </Suspense>
    </>
  );
}
