import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import SearchBox from "@/components/search/SearchBox";

export const metadata: Metadata = {
  title: "Page not found",
};

/** Unknown addresses, and products or pages that no longer exist. */
export default function NotFound() {
  return (
    <div className="container-vel py-24 text-center">
      <p className="label-caps text-gold-600">Error 404</p>
      <h1 className="mt-3 font-display text-3xl text-plum-800 sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        The link may be old, or the product may no longer be available. Try a search, or
        browse the full collection.
      </p>
      <SearchBox className="mx-auto mt-8 max-w-md" />
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button href="/shop">Shop the Collection</Button>
        <Button href="/" variant="outline">
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
