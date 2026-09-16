import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-series-1 text-white hover:bg-[#5c3cc4]",
  outline: "border border-hairline bg-card text-ink hover:border-series-1 hover:text-series-1",
  ghost: "text-ink-2 hover:bg-plane hover:text-ink",
  danger: "border border-critical/30 bg-critical/5 text-critical hover:bg-critical/10",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[0.72rem]",
  md: "px-4 py-2.5 text-[0.78rem]",
};

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
