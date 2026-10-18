"use client";

import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { Collaborator } from "@/lib/api/types";
import { useLoop } from "@/lib/loop";
import { cn } from "@/lib/utils";

/** Most people in view at once (two on phones, where the 85px photos need the room — see `--visible`). */
const VISIBLE = 5;
const STEP_MS = 3500;

const ARROW =
  // Level with the middle of the 85px photos, not the whole row — the names
  // underneath would pull them down.
  "mt-[20px] grid size-11 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:border-gold-400 active:scale-95";

/** The collaborators, one at a time, round and round (see lib/loop.ts). */
function CollabCarousel({ collaborators }: { collaborators: Collaborator[] }) {
  const { loops, i, go, tripled, trackClass, hoverProps, swipeProps } = useLoop(collaborators, {
    visible: VISIBLE,
    stepMs: STEP_MS,
  });

  const person = (c: Collaborator, key: string | number, width?: string) => (
    <li key={key} className="flex shrink-0 flex-col items-center text-center" style={{ width }}>
      <div className="size-[85px] xl:size-[102px] 2xl:size-[114px] relative">
        <Avatar src={c.avatarUrl} name={c.name} size={114} className="w-full h-full" />
      </div>
      <p className="mt-3.5 text-[0.78rem] xl:text-[0.94rem] 2xl:text-[1.02rem] font-bold text-plum-800 leading-tight">{c.name}</p>
      <p className="mt-1 text-[0.68rem] xl:text-[0.82rem] 2xl:text-[0.88rem] font-medium text-ink leading-tight">{c.role}</p>
    </li>
  );

  // Everyone fits: no sliding and no arrows.
  if (!loops) {
    return (
      <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
        {collaborators.map((c) => person(c, c.id, "6.5rem"))}
      </ul>
    );
  }

  return (
    <div
      className="flex items-start gap-1 sm:gap-2 [--visible:2] sm:[--visible:3] md:[--visible:4] xl:[--visible:5] [--collab-gap:1rem] xl:[--collab-gap:1.5rem] lg:gap-4 xl:gap-6"
      {...hoverProps}
    >
      <button type="button" aria-label="Previous collaborators" onClick={() => go(-1)} className={ARROW}>
        <ChevronLeft className="size-5" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden" {...swipeProps}>
        <ul
          className={cn(trackClass, "items-start gap-4 xl:gap-6")}
          style={{
            transform: `translateX(calc(${-i} * (100% + var(--collab-gap,1rem)) / var(--visible)))`,
          }}
        >
          {tripled.map((c, k) =>
            person(
              c,
              k,
              "calc((100% - (var(--visible) - 1) * var(--collab-gap,1rem)) / var(--visible))"
            )
          )}
        </ul>
      </div>

      <button type="button" aria-label="Next collaborators" onClick={() => go(1)} className={ARROW}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

export default function Collabs({ collaborators }: { collaborators: Collaborator[] }) {
  return (
    <section className="bg-cream-50">
      {/* No bottom padding: the gold rule below sits right under the "Be a Part" card */}
      <div className="container-vel grid gap-10 xl:gap-14 2xl:gap-18 pt-0 pb-6 xl:pb-8 lg:grid-cols-[1.55fr_1fr] lg:items-center">
        {/* min-w-0: otherwise the sliding row stretches this column to fit every copy */}
        <div className="min-w-0">
          <div className="mb-8 xl:mb-10 text-center">
            <h2 className="font-heading text-[1.75rem] xl:text-[2.25rem] 2xl:text-[2.6rem] font-bold tracking-[0.03em] uppercase text-plum-800">
              COLLABORATIONS
            </h2>
            <p className="mt-1 text-sm xl:text-[1.05rem] 2xl:text-[1.12rem] font-medium text-ink">
              Partnering with amazing creators and beauty experts.
            </p>
          </div>

          <CollabCarousel collaborators={collaborators} />
        </div>

        {/* self-end: keeps the card on the rule even if the left side grows taller */}
        <div className="rounded-[18px] xl:rounded-[22px] border border-gold-200/50 bg-[#FCFAF8] p-6 sm:p-8 xl:p-9 2xl:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.03)] lg:ml-6 xl:ml-8 lg:self-end">
          <div className="flex items-center gap-3 xl:gap-4">
            <UserPlus className="size-8 sm:size-9 xl:size-11 2xl:size-12 text-gold-500 shrink-0" strokeWidth={1.5} />
            <h3 className="font-heading text-[1.25rem] sm:text-[1.4rem] xl:text-[1.65rem] 2xl:text-[1.85rem] font-bold uppercase tracking-widest text-plum-800">
              Be a Part of Velastia
            </h3>
          </div>
          <p className="mt-4 sm:mt-5 xl:mt-6 text-[0.92rem] sm:text-[0.95rem] xl:text-[1.12rem] 2xl:text-[1.2rem] font-medium leading-[1.6] text-ink">
            Are you a creator or makeup artist?<br />
            Let&apos;s collaborate and create magic together.
          </p>
          <Button href="/collabs" className="mt-6 sm:mt-7 xl:mt-8 px-8 py-3.5 xl:px-9 xl:py-4.5 min-h-[44px] text-[0.8rem] xl:text-[0.88rem] rounded-[6px] uppercase tracking-widest font-semibold">
            Apply for Collab
          </Button>
        </div>
      </div>
      {/* Full-width gold rule, edge to edge, like the one under Our Story */}
      <div className="w-full border-b border-gold-200/60" />
      <div className="h-6" />
    </section>
  );
}
