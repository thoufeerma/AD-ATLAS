"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import CollabForm from "@/components/forms/CollabForm";

/**
 * A Collabs page button that opens the collab application form over the
 * page. `applyingAs` (e.g. "Makeup Artist") is noted on the application.
 */
export default function ApplyDialog({
  applyingAs,
  className,
  children,
}: {
  applyingAs?: string;
  className: string;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={className}>
        {children}
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        aria-label={applyingAs ? `Apply as ${applyingAs}` : "Apply for a collab"}
        className="m-auto w-[min(92vw,34rem)] rounded-md bg-[#2a0e2a] p-0 text-left backdrop:bg-[#1d052b]/70"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-cream-50 hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[#d9a53f]">
            {applyingAs ? `Applying as ${applyingAs}` : "Let's create magic"}
          </p>
          <h2 className="mt-1 mb-6 font-display text-2xl font-medium uppercase text-cream-50">Apply for a Collab</h2>
          <CollabForm applyingAs={applyingAs} />
        </div>
      </dialog>
    </>
  );
}
