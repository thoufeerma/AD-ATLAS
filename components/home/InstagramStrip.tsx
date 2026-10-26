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
  "grid size-11 xl:size-12 2xl:size-13 shrink-0 place-items-center rounded-full border border-gold-200/60 bg-white text-gold-600 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:border-gold-400 active:scale-95";

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
    <li
      key={key}
      className="shrink-0 py-2"
      style={{ width: "calc((100% - (var(--visible) - 1) * var(--strip-gap,1rem)) / var(--visible))" }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-square overflow-hidden rounded-[var(--radius-card)] border border-gold-300/40 shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.18)] hover:border-gold-400/80"
      >
        <Image
          src={src}
          alt={`Velastia on Instagram, post ${INSTAGRAM.indexOf(src) + 1}`}
          fill
          sizes="(min-width: 1280px) 16vw, (min-width: 640px) 16vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </a>
    </li>
  );

  return (
    <section className="bg-cream-50 pb-6 xl:pb-10 2xl:pb-12">
      <div className="container-vel">
        <div className="mb-7 xl:mb-9 text-center">
          <h2 className="font-heading text-[1.75rem] xl:text-[2.25rem] 2xl:text-[2.6rem] font-bold tracking-[0.03em] uppercase text-plum-800">
            FOLLOW US ON INSTAGRAM
          </h2>
          {handle && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm xl:text-[1.05rem] 2xl:text-[1.12rem] font-medium text-ink-soft hover:text-gold-600"
            >
              {handle}
            </a>
          )}
        </div>

        <div
          className="flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-5 [--visible:3] sm:[--visible:6] [--strip-gap:1rem] xl:[--strip-gap:1.25rem] 2xl:[--strip-gap:1.5rem]"
          {...hoverProps}
        >
          {loops && (
            <button type="button" aria-label="Previous posts" onClick={() => go(-1)} className={ARROW}>
              <ChevronLeft className="size-5 xl:size-6" />
            </button>
          )}

          <div className="min-w-0 flex-1 overflow-hidden" {...swipeProps}>
            <ul
              className={cn(trackClass, "gap-4 xl:gap-5 2xl:gap-6")}
              style={
                loops
                  ? { transform: `translateX(calc(${-i} * (100% + var(--strip-gap,1rem)) / var(--visible)))` }
                  : undefined
              }
            >
              {tripled.map((src, k) => post(src, k))}
            </ul>
          </div>

          {loops && (
            <button type="button" aria-label="Next posts" onClick={() => go(1)} className={ARROW}>
              <ChevronRight className="size-5 xl:size-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
