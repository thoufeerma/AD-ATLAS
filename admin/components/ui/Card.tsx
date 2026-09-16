import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Card({
  title,
  action,
  actionHref,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  action?: string;
  actionHref?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-hairline bg-card",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
          {title && <h2 className="text-[0.92rem] font-semibold text-ink">{title}</h2>}
          {action && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-series-1 hover:underline"
            >
              {action} <ArrowRight className="size-3" />
            </Link>
          )}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
