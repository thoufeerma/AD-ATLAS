"use client";

import { useRef } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import type { Collaborator } from "@/lib/api/types";

const INK = "text-[#1d052b]";

/**
 * "What our collaborators say": quote cards in a row that scrolls sideways,
 * five at a time on desktop, with arrows when there are more.
 */
export default function CollaboratorQuotes({ people }: { people: (Collaborator & { quote: string })[] }) {
  const row = useRef<HTMLUListElement>(null);

  function scroll(dir: 1 | -1) {
    const el = row.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-[#e3d6c8] bg-cream-50 text-[#1d052b] transition-colors hover:border-[#c8963c] sm:grid xl:size-[2.05vw]";

  return (
    <div className="relative mx-4 mt-4 xl:mx-auto xl:mt-[0.75vw] xl:w-[87.93vw]">
      {people.length > 5 && (
        <>
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous collaborators" className={`${arrow} -left-3 xl:-left-[2.61vw]`}>
            <ChevronLeft className="size-4 xl:size-[1.1vw]" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="More collaborators" className={`${arrow} -right-3 xl:-right-[2.61vw]`}>
            <ChevronRight className="size-4 xl:size-[1.1vw]" strokeWidth={1.5} />
          </button>
        </>
      )}
      <ul
        ref={row}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] xl:gap-[0.92vw] [&::-webkit-scrollbar]:hidden"
      >
        {people.map((p) => (
          <li
            key={p.id}
            className="flex w-[78vw] shrink-0 snap-start flex-col rounded-md border border-[#efe5da] bg-[#fdf7f1] p-3 sm:w-[44vw] lg:w-[30vw] xl:h-[10.66vw] xl:w-[16.85vw] xl:px-[0.9vw] xl:pt-[0.78vw] xl:pb-0"
          >
            <div className="flex gap-3 xl:gap-[1.09vw]">
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#efdccb] font-display text-lg text-[#6b3b5e] xl:size-[4.79vw] xl:text-[1.6vw]">
                {p.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded photo at any size
                  <img src={p.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  p.name.charAt(0)
                )}
              </span>
              <blockquote className="line-clamp-4 pt-0.5 text-[0.72rem] leading-[1.6] text-[#1d052b]/80 xl:pt-[0.3vw] xl:text-[0.76vw] xl:leading-[1.22vw]">
                &ldquo;{p.quote}&rdquo;
              </blockquote>
            </div>
            <div className="mt-3 xl:mt-auto xl:mb-[0.6vw] xl:pl-[0.74vw]">
              <p className={`flex items-center gap-2 text-[0.78rem] font-medium xl:gap-[0.4vw] xl:text-[0.88vw] ${INK}`}>
                {p.name}
                <span className="h-px flex-1 bg-[#efe5da]" aria-hidden="true" />
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-[#1d052b]/80 xl:mt-[0.2vw] xl:gap-[0.6vw] xl:text-[0.9vw]">
                {p.role}
                <BadgeCheck className="size-3.5 fill-[#c8963c] text-cream-50 xl:size-[1.1vw]" strokeWidth={2} aria-label="Velastia collaborator" />
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
