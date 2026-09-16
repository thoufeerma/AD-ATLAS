import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Velastia lockup: circular gold monogram (a V drawn as a leaf/petal),
 * the wordmark in Cormorant, and the "Luxury. Science. You." tagline.
 */
export default function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const wordmark = tone === "light" ? "text-cream-50" : "text-plum-800";

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)}>
      <Mark className="size-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.45rem] font-semibold tracking-[0.14em]",
            wordmark,
          )}
        >
          VELASTIA
        </span>
        <span className="mt-0.5 text-[0.55rem] tracking-[0.18em] text-gold-600">
          Luxury. Science. You.
        </span>
      </span>
    </Link>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="#c1883e" strokeWidth="1.4" />
      {/* petal */}
      <path
        d="M24 11c7.2 3.1 10.8 8.2 10.8 14.2 0 5.6-4.6 10.3-10.8 10.3s-10.8-4.7-10.8-10.3C13.2 19.2 16.8 14.1 24 11Z"
        fill="none"
        stroke="#c1883e"
        strokeWidth="1.3"
      />
      {/* V stem */}
      <path
        d="M18.6 20.2 24 31.6l5.4-11.4"
        fill="none"
        stroke="#c1883e"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 31.6V37" stroke="#c1883e" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
