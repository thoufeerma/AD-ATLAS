import { cn } from "@/lib/utils";

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-1",
        align === "center" ? "items-center text-center" : "items-start text-left",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={align === "center" ? "text-center" : ""}>
        <h2 className="font-display text-[1.7rem] tracking-[0.06em] text-plum-800 sm:text-[2rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
