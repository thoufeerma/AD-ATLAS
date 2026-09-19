import type { Metadata } from "next";
import { Suspense } from "react";
import PageBanner from "@/components/ui/PageBanner";
import VerifyEmail from "@/components/account/VerifyEmail";

export const metadata: Metadata = { title: "Confirm Your Email", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageBanner title="Confirm Your Email" tone="light" crumbs={[{ label: "Home", href: "/" }, { label: "Confirm Your Email" }]} />
      {/* Reads the link's token from the URL, so it renders in the browser. */}
      <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
        <VerifyEmail />
      </Suspense>
    </>
  );
}
