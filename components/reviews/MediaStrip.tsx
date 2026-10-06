"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Lightbox, { type MediaItem } from "./Lightbox";

/**
 * "Customer Photos & Videos": a row of square-ish tiles that scrolls
 * sideways (arrows move it one tile), each opening large in a lightbox.
 */
export default function MediaStrip({ items }: { items: MediaItem[] }) {
  const row = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<MediaItem | null>(null);

  function scroll(dir: 1 | -1) {
    const el = row.current;
    const tile = el?.firstElementChild as HTMLElement | null;
    if (!el || !tile) return;
    const step = tile.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const arrow =
    "grid size-8 place-items-center rounded-full border border-[#e3d6c8] bg-cream-50 text-[#1d052b] transition-colors hover:border-[#c8963c] xl:size-[2.44vw]";

  return (
    <section aria-labelledby="customer-media" className="mt-6 xl:mt-[1.66vw]">
      <div className="flex min-h-8 items-center justify-between xl:min-h-[2.44vw]">
        <h2
          id="customer-media"
          className="font-display text-[1.15rem] font-bold uppercase leading-none tracking-[0.01em] text-[#1d052b] xl:text-[1.42vw]"
        >
          Customer Photos &amp; Videos
        </h2>
        {items.length > 6 && (
          <div className="flex gap-2 xl:gap-[0.73vw]">
            <button type="button" onClick={() => scroll(-1)} aria-label="Previous photos" className={arrow}>
              <ChevronLeft className="size-4 xl:size-[1.2vw]" strokeWidth={1.5} />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="More photos" className={arrow}>
              <ChevronRight className="size-4 xl:size-[1.2vw]" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      <ul
        ref={row}
        className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] xl:mt-[0.83vw] xl:gap-[0.83vw] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <li key={item.src} className="w-[40vw] shrink-0 snap-start sm:w-[24vw] xl:w-[14.06vw]">
            <button
              type="button"
              onClick={() => setOpen(item)}
              aria-label={item.kind === "video" ? "Play customer video" : "View customer photo"}
              className="relative block h-[44vw] w-full overflow-hidden rounded-md bg-[#efdccb] sm:h-[26vw] xl:h-[15.43vw]"
            >
              {item.kind === "video" ? (
                <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" className="size-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- customer photos come from storage at any size
                <img src={item.src} alt="" loading="lazy" className="size-full object-cover" />
              )}
              {item.kind === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-10 place-items-center rounded-full border-2 border-white/90 bg-black/15 xl:size-[2.93vw]">
                    <Play className="ml-0.5 size-4 fill-white text-white xl:size-[1.2vw]" />
                  </span>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
