"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "./utils";

/** How long the slide across takes — matches `duration-700` below. */
const GLIDE_MS = 700;

/**
 * A row of cards that slides one place at a time, round and round, used by
 * the homepage's bestsellers and collaborators.
 *
 * The row renders its list three times (`tripled`) and starts on the middle
 * copy. A move that lands in the first or last copy is followed, once the
 * glide has finished, by a silent jump of one whole list back to the same
 * card in the middle — so it never visibly rewinds, in either direction.
 * Moved with a transform rather than native scrolling: smooth `scrollBy`
 * fights scroll snapping and left arrows doing nothing.
 *
 * `i` is the card at the left edge; the caller turns it into a transform.
 * With `visible` or fewer items there is nothing to slide (`loops` is false),
 * unless `whenFull` asks for a row that is exactly full to keep turning too.
 */
export function useLoop<T>(
  items: T[],
  { visible, stepMs, whenFull = false }: { visible: number; stepMs: number; whenFull?: boolean },
) {
  const n = items.length;
  const loops = whenFull ? n >= visible && n > 1 : n > visible;
  const [i, setI] = useState(n);
  const [silent, setSilent] = useState(false); // the jump back, with no animation
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  // Advance on a timer, restarted whenever the position changes — so an
  // arrow click buys a full interval rather than a leftover moment.
  useEffect(() => {
    if (!loops || paused) return;
    const t = setTimeout(() => {
      setSilent(false);
      setI((x) => x + 1);
    }, stepMs);
    return () => clearTimeout(t);
  }, [i, loops, paused, stepMs]);

  // Out in the first or last copy: back to the middle once the glide is done.
  // A timer rather than transitionend, which never fires for visitors who
  // have asked for reduced motion.
  useEffect(() => {
    if (!loops || (i >= n && i < 2 * n)) return;
    const t = setTimeout(() => {
      setSilent(true);
      setI((x) => (x < n ? x + n : x - n));
    }, GLIDE_MS + 50);
    return () => clearTimeout(t);
  }, [i, n, loops]);

  function go(direction: 1 | -1) {
    setSilent(false);
    // Clicks faster than the glide can't run off either end of the track.
    setI((x) => Math.min(3 * n - visible, Math.max(0, x + direction)));
  }

  return {
    loops,
    i,
    go,
    tripled: loops ? [...items, ...items, ...items] : items,
    trackClass: cn(
      "flex",
      silent ? "transition-none" : "transition-transform duration-700 ease-out motion-reduce:transition-none",
    ),
    /**
     * Holds still while someone is reading or about to click a card. Mouse
     * only: a tap on a phone would otherwise leave it paused for good.
     */
    hoverProps: {
      onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setPaused(true),
      onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && setPaused(false),
    },
    /** A sideways swipe on a phone moves it one place. */
    swipeProps: {
      onTouchStart: (e: React.TouchEvent) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 40) return;
        go(end < start ? 1 : -1);
      },
    },
  };
}
