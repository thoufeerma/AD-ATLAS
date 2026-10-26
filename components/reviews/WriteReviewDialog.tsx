"use client";

import { useRef } from "react";
import { PenLine, SquarePen, X } from "lucide-react";
import ReviewForm from "./ReviewForm";

/** The Reviews page's "Write a Review" button, opening the review form over the page. */
export default function WriteReviewDialog({
  products,
  className = "",
}: {
  products: { slug: string; name: string }[];
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`inline-flex items-center justify-center gap-2.5 rounded-[4px] bg-[#260b26] text-[0.78rem] font-semibold uppercase text-cream-50 border border-gold-400/40 shadow-[0_4px_16px_rgba(32,8,45,0.25)] hover:bg-[#45174a] hover:border-gold-400/70 hover:shadow-[0_8px_24px_rgba(32,8,45,0.38),0_2px_8px_rgba(193,136,62,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ${className}`}
      >
        <SquarePen className="size-4 text-[#d9a53f] xl:size-[1.25vw]" strokeWidth={1.5} />
        Write a Review
        <PenLine className="size-4 text-[#d9a53f] xl:size-[1.25vw]" strokeWidth={1.5} />
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-labelledby="write-review-title"
        className="m-auto w-[min(92vw,40rem)] rounded-md bg-cream-50 p-0 backdrop:bg-[#1d052b]/70"
      >
        <div className="relative p-6 text-left sm:p-8">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-plum-800 hover:bg-cream-200"
          >
            <X className="size-4" />
          </button>
          <h2 id="write-review-title" className="mb-5 font-heading text-2xl font-bold uppercase text-[#1d052b]">
            Write a Review
          </h2>
          <ReviewForm products={products} />
        </div>
      </dialog>
    </>
  );
}
