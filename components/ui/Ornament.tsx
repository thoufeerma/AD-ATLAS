/**
 * Gold decorations from the About and Ingredients designs.
 *
 * `Ornament`: a thin gold rule with a small winged mark at its centre. With
 * `bare`, just the mark (no rules), as under a centred heading.
 * `ScriptHeart`: the hand-drawn gold heart that trails after script lines.
 */
export function Ornament({
  className,
  markClassName = "h-4 w-8 xl:h-[0.837vw] xl:w-[1.674vw]",
  bare = false,
}: {
  className?: string;
  /** Size of the winged mark. */
  markClassName?: string;
  /** Only the mark, without the rules either side. */
  bare?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`} aria-hidden="true">
      {!bare && <span className="h-px flex-1 bg-gold-400/70" />}
      <svg viewBox="0 0 32 16" className={`shrink-0 text-gold-500 ${markClassName}`} fill="currentColor">
        <path d="M16 8c-2-4-6.5-6-11-5.2 1.6 1.5 2 3.3 1.7 5.2 2.6-.7 6 .2 9.3 0Z" />
        <path d="M16 8c2-4 6.5-6 11-5.2-1.6 1.5-2 3.3-1.7 5.2-2.6-.7-6 .2-9.3 0Z" />
        <path d="M16 8c-1.7 2.4-4.6 3.8-7.6 3.6 1.4-1 2-2.2 2-3.4 1.8.3 3.8.2 5.6-.2Z" opacity=".75" />
        <path d="M16 8c1.7 2.4 4.6 3.8 7.6 3.6-1.4-1-2-2.2-2-3.4-1.8.3-3.8.2-5.6-.2Z" opacity=".75" />
      </svg>
      {!bare && <span className="h-px flex-1 bg-gold-400/70" />}
    </div>
  );
}

export function ScriptHeart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M30 31C20 24 15 18 16.5 11.5 18 5.5 25 4 29.5 9.5 33.5 3.5 41 5 42.5 11 44 18 38 25 30 31Z" />
      <path d="M30 31C22 34 10 35 2 31" />
    </svg>
  );
}
