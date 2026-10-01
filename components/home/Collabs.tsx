"use client";

import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { Collaborator } from "@/lib/api/types";
import { useLoop } from "@/lib/loop";
import { cn } from "@/lib/utils";

/** Most people in view at once (two on phones, where the 85px photos need the room — see `--visible`). */
const VISIBLE = 4;
const STEP_MS = 3500;

const ARROW =
  // Level with the middle of the 85px photos, not the whole row — the names
  // underneath would pull them down.
  "mt-[22.5px] grid size-10 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors hover:border-gold-400";

/** The collaborators, one at a time, round and round (see lib/loop.ts). */
function CollabCarousel({ collaborators }: { collaborators: Collaborator[] }) {
  const { loops, i, go, tripled, trackClass, hoverProps, swipeProps } = useLoop(collaborators, {
    visible: VISIBLE,
    stepMs: STEP_MS,
  });

  const person = (c: Collaborator, key: string | number, width?: string) => (
    <li key={key} className="flex shrink-0 flex-col items-center text-center" style={{ width }}>
      <Avatar src={c.avatarUrl} name={c.name} size={85} />
      <p className="mt-3.5 text-[0.78rem] font-bold text-plum-800 leading-tight">{c.name}</p>
      <p className="mt-1 text-[0.68rem] font-medium text-ink-soft leading-tight">{c.role}</p>
    </li>
  );

  // Everyone fits: no sliding and no arrows.
  if (!loops) {
    return (
      <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
        {collaborators.map((c) => person(c, c.id, "5.5rem"))}
      </ul>
    );
  }

  return (
    <div className="flex items-start gap-2 [--visible:2] sm:[--visible:4] lg:gap-4" {...hoverProps}>
      <button type="button" aria-label="Previous collaborators" onClick={() => go(-1)} className={ARROW}>
        <ChevronLeft className="size-5" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden" {...swipeProps}>
        <ul
          className={cn(trackClass, "items-start gap-4")}
          style={{ transform: `translateX(calc(${-i} * (100% + 1rem) / var(--visible)))` }}
        >
          {tripled.map((c, k) => person(c, k, "calc((100% - (var(--visible) - 1) * 1rem) / var(--visible))"))}
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
      <div className="container-vel grid gap-10 pt-0 lg:grid-cols-[1.6fr_1fr] lg:items-center">
        {/* min-w-0: otherwise the sliding row stretches this column to fit every copy */}
        <div className="min-w-0">
          <div className="mb-8 text-center">
            <h2 className="font-display text-[1.75rem] font-semibold tracking-[0.03em] uppercase text-plum-800">
              COLLABORATIONS
            </h2>
            <p className="mt-1 text-sm font-medium text-ink-soft">
              Partnering with amazing creators and beauty experts.
            </p>
          </div>

          <CollabCarousel collaborators={collaborators} />
        </div>

        {/* self-end: keeps the card on the rule even if the left side grows taller */}
        <div className="rounded-[16px] border border-gold-200/50 bg-[#FCFAF8] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] lg:ml-8 lg:self-end">
          <div className="flex items-center gap-3">
            <UserPlus className="size-9 text-gold-500" strokeWidth={1.5} />
            <h3 className="font-display text-[1.4rem] font-medium uppercase tracking-widest text-plum-800">
              Be a Part of Velastia
            </h3>
          </div>
          <p className="mt-5 text-[0.95rem] font-medium leading-[1.6] text-ink-soft">
            Are you a creator or makeup artist?<br />
            Let&apos;s collaborate and create magic together.
          </p>
          <Button href="/collabs" className="mt-7 px-8 py-3.5 text-[0.8rem] rounded-[6px] uppercase tracking-widest font-semibold">
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
