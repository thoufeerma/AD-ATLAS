"use client";

import { useEffect, useRef, useCallback } from "react";
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
  autoOpen = false,
}: {
  applyingAs?: string;
  className: string;
  children: React.ReactNode;
  autoOpen?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  const openSmoothly = useCallback(() => {
    const d = dialog.current;
    if (!d) return;
    d.classList.remove("dialog-closing");
    if (!d.open) {
      d.showModal();
    }
  }, []);

  const closeSmoothly = useCallback(() => {
    const d = dialog.current;
    if (!d || !d.open) return;
    d.classList.add("dialog-closing");
    setTimeout(() => {
      d.close();
      d.classList.remove("dialog-closing");

      // Clean up query param/hash without a hard reload
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("apply") || url.hash === "#apply" || url.hash === "#apply-form") {
          url.searchParams.delete("apply");
          if (url.hash === "#apply" || url.hash === "#apply-form") {
            url.hash = "";
          }
          const cleanUrl = url.pathname + (url.search ? url.search : "") + (url.hash ? url.hash : "");
          window.history.replaceState({}, "", cleanUrl);
        }
      }
    }, 200);
  }, []);

  useEffect(() => {
    if (!autoOpen) return;

    const checkAndOpen = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const isApplyRequested =
        params.has("apply") ||
        window.location.hash === "#apply" ||
        window.location.hash === "#apply-form";

      if (isApplyRequested) {
        openSmoothly();
      }
    };

    // Smooth delay so the page has mounted and transitioned
    const timer = setTimeout(checkAndOpen, 120);

    window.addEventListener("popstate", checkAndOpen);
    window.addEventListener("hashchange", checkAndOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", checkAndOpen);
      window.removeEventListener("hashchange", checkAndOpen);
    };
  }, [autoOpen, openSmoothly]);

  return (
    <>
      <button type="button" onClick={openSmoothly} className={className}>
        {children}
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => {
          if (e.target === dialog.current) {
            closeSmoothly();
          }
        }}
        onCancel={(e) => {
          e.preventDefault();
          closeSmoothly();
        }}
        aria-label={applyingAs ? `Apply as ${applyingAs}` : "Apply for a collab"}
        className="m-auto w-[min(92vw,34rem)] rounded-xl border border-[#c8963c]/30 bg-[#250b28] p-0 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55)] outline-none backdrop:bg-[#1d052b]/75"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={closeSmoothly}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-cream-100/70 transition-colors hover:bg-white/10 hover:text-cream-50"
          >
            <X className="size-4" />
          </button>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#d9a53f]">
            {applyingAs ? `Applying as ${applyingAs}` : "Let's create magic"}
          </p>
          <h2 className="mt-1 mb-6 font-heading text-2xl font-bold uppercase tracking-wide text-cream-50">
            Apply for a Collab
          </h2>
          <CollabForm applyingAs={applyingAs} />
        </div>
      </dialog>
    </>
  );
}
