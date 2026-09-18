"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import Button from "@/components/ui/Button";
import ReviewForm from "./ReviewForm";

/** "Write a Review" button that opens the review form in place. */
export default function WriteReview({ products }: { products: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="mt-6" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <PenLine className="size-3.5" /> Write a Review
      </Button>
      {open && (
        <div className="mt-6 border-t border-gold-200/70 pt-6">
          <ReviewForm products={products} />
        </div>
      )}
    </>
  );
}
