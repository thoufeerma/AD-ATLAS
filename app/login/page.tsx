import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPanel from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Login or Register",
  description: "Sign in to your Velastia account, or create one to check out faster.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    // Reads ?next= from the URL, so it renders in the browser.
    <Suspense fallback={<div className="min-h-[70vh]" aria-hidden />}>
      <AuthPanel />
    </Suspense>
  );
}
