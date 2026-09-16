import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-plum-800 text-cream-50 hover:bg-plum-700",
  gold: "bg-gold-600 text-white hover:bg-gold-500",
  outline:
    "border border-plum-800/25 text-plum-800 hover:border-plum-800 hover:bg-plum-800 hover:text-cream-50",
  ghost: "text-plum-800 hover:text-gold-600",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.68rem]",
  md: "px-6 py-3 text-[0.72rem]",
  lg: "px-8 py-3.5 text-[0.78rem]",
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
    "label-caps inline-flex items-center justify-center gap-2 rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45",
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
