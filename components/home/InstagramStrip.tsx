"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { INSTAGRAM } from "@/lib/content";
import { useLoop } from "@/lib/loop";
import { cn } from "@/lib/utils";

/** Posts in view at once on a wide screen (three on phones, see `--visible`). */
const VISIBLE = 6;
const STEP_MS = 3000;

const ARROW =
  "grid size-10 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors hover:border-gold-400";

/**
 * Links out to the store's Instagram; the home page skips it until one is set.
 * The posts slide round and round (see lib/loop.ts), even when they exactly
 * fill the row.
 */
export default function InstagramStrip({ href, handle }: { href: string; handle: string | null }) {
  const { loops, i, go, tripled, trackClass, hoverProps, swipeProps } = useLoop(INSTAGRAM, {
    visible: VISIBLE,
    stepMs: STEP_MS,
    whenFull: true,
  });

  const post = (src: string, key: string | number) => (
    <li key={key} className="shrink-0" style={{ width: "calc((100% - (var(--visible) - 1) * 1rem) / var(--visible))" }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-square overflow-hidden rounded-[var(--radius-card)]"
      >
        <Image
          src={src}
          alt={`Velastia on Instagram, post ${INSTAGRAM.indexOf(src) + 1}`}
          fill
          sizes="(min-width: 640px) 16vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </a>
    </li>
  );

  return (
    <section className="bg-cream-50 pb-6">
      <div className="container-vel">
        <div className="mb-7 text-center">
          <h2 className="font-display text-[1.75rem] font-semibold tracking-[0.03em] uppercase text-plum-800">
            FOLLOW US ON INSTAGRAM
          </h2>
          {handle && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-ink-soft hover:text-gold-600"
            >
              {handle}
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 [--visible:3] sm:[--visible:6] lg:gap-4" {...hoverProps}>
          {loops && (
            <button type="button" aria-label="Previous posts" onClick={() => go(-1)} className={ARROW}>
              <ChevronLeft className="size-5" />
            </button>
          )}

          <div className="min-w-0 flex-1 overflow-hidden" {...swipeProps}>
            <ul
              className={cn(trackClass, "gap-4")}
              style={loops ? { transform: `translateX(calc(${-i} * (100% + 1rem) / var(--visible)))` } : undefined}
            >
              {tripled.map((src, k) => post(src, k))}
            </ul>
          </div>

          {loops && (
            <button type="button" aria-label="Next posts" onClick={() => go(1)} className={ARROW}>
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
