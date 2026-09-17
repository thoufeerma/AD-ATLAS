import { cn } from "@/lib/utils";
import { humanize } from "@/lib/api/types";

export type Tone = "good" | "warning" | "serious" | "critical" | "neutral" | "info";

/**
 * Status colours are reserved and always ship with a label — never colour alone,
 * per the data-viz status rule. The dot is decorative; the word carries meaning.
 */
const TONES: Record<Tone, string> = {
  good: "bg-good/10 text-[#0a7f0a] ring-good/25",
  warning: "bg-warning/15 text-[#8a5d00] ring-warning/30",
  serious: "bg-serious/15 text-[#a34a22] ring-serious/30",
  critical: "bg-critical/10 text-critical ring-critical/25",
  info: "bg-series-1/10 text-series-1 ring-series-1/20",
  neutral: "bg-plane text-ink-2 ring-hairline",
};

const DOTS: Record<Tone, string> = {
  good: "bg-good",
  warning: "bg-warning",
  serious: "bg-serious",
  critical: "bg-critical",
  info: "bg-series-1",
  neutral: "bg-muted",
};

export default function Badge({
  tone = "neutral",
  children,
  dot = true,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

/** Maps the statuses used across the panel onto reserved status tones. */
export function toneFor(status: string): Tone {
  // Accepts API enum values ("OUT_FOR_DELIVERY") as well as display labels.
  const label = /^[A-Z_]+$/.test(status) ? humanize(status) : status;
  switch (label) {
    case "Delivered":
    case "Published":
    case "Active":
    case "Subscribed":
    case "Sent":
    case "Paid":
      return "good";
    case "Processing":
    case "Pending":
    case "Scheduled":
      return "warning";
    case "Confirmed":
    case "Shipped":
    case "Out for Delivery":
    case "Automated":
    case "Coming Soon":
      return "info";
    case "Refunded":
    case "Bounced":
      return "serious";
    case "Cancelled":
    case "Rejected":
    case "Failed":
      return "critical";
    default:
      return "neutral";
  }
}
