"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Image from "next/image";
import "./globals.css";

/**
 * Replaces the whole document when the root layout itself fails — it loads
 * store settings from the API, so this is what shows if the API is down and
 * no cached page is available.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-cream-50 px-4 text-center text-ink">
        <title>Velastia — we&apos;ll be right back</title>
        <div>
          <Image
            src="/brand/logo.png"
            alt="Velastia"
            width={154}
            height={52}
            className="mx-auto h-[52px] w-auto"
          />
          <h1 className="mt-6 text-xl text-plum-800">We&apos;ll be right back</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            The store is having a moment. Please try again shortly — your cart is saved.
          </p>
          <button
            onClick={() => retry()}
            className="mt-6 rounded-sm bg-plum-800 px-6 py-3 text-xs uppercase tracking-[0.14em] text-cream-50 hover:bg-plum-700"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
