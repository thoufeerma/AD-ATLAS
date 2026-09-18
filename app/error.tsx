"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

/** Shown when a page's data can't be loaded, e.g. the store API is unreachable. */
export default function Error({
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
    <div className="container-vel py-24 text-center">
      <h1 className="font-display text-3xl text-plum-800">We couldn&apos;t load this page</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        Something went wrong on our side. Please try again in a moment — your cart and
        wishlist are safe.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>
          <RefreshCw className="size-3.5" /> Try Again
        </Button>
        <Button href="/" variant="outline">
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
