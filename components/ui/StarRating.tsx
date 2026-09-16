import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-gold-400/35" style={{ width: size, height: size }} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-gold-500"
                style={{ width: size, height: size }}
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
