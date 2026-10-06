"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export type MediaItem = { src: string; kind: "image" | "video"; caption?: string };

/** Shows one customer photo or video large, over the page. */
export default function Lightbox({ item, onClose }: { item: MediaItem | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="m-auto max-h-[90vh] max-w-[min(90vw,56rem)] overflow-visible bg-transparent p-0 backdrop:bg-[#1d052b]/80"
    >
      {item && (
        <figure className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute -top-3 -right-3 z-10 grid size-9 place-items-center rounded-full bg-cream-50 text-plum-800 shadow"
          >
            <X className="size-4" />
          </button>
          {item.kind === "video" ? (
            <video src={item.src} controls autoPlay playsInline className="max-h-[85vh] rounded-md bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- any size customer photo, shown whole
            <img src={item.src} alt={item.caption ?? "Customer photo"} className="max-h-[85vh] rounded-md object-contain" />
          )}
          {item.caption && (
            <figcaption className="mt-2 text-center text-sm text-cream-50">{item.caption}</figcaption>
          )}
        </figure>
      )}
    </dialog>
  );
}
