import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#20082d] text-cream-50 border border-gold-400/40 shadow-[0_4px_14px_rgba(32,8,45,0.22)] hover:bg-[#2e0c40] hover:border-gold-400/70 hover:shadow-[0_8px_22px_rgba(32,8,45,0.32),0_2px_8px_rgba(193,136,62,0.2)] hover:-translate-y-0.5 active:translate-y-0",
  gold:
    "bg-gradient-to-r from-[#ca9d4c] to-[#a27334] text-white border border-gold-300/40 shadow-[0_4px_14px_rgba(193,136,62,0.3)] hover:brightness-110 hover:border-gold-300/80 hover:shadow-[0_8px_24px_rgba(193,136,62,0.45)] hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border border-[#20082d]/30 text-[#20082d] bg-white/60 backdrop-blur-xs shadow-[0_2px_8px_rgba(32,8,45,0.08)] hover:border-[#20082d] hover:bg-[#20082d] hover:text-cream-50 hover:shadow-[0_6px_18px_rgba(32,8,45,0.2)] hover:-translate-y-0.5 active:translate-y-0",
  ghost: "text-[#20082d] hover:text-gold-600 transition-colors",
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
    "label-caps inline-flex items-center justify-center gap-2 rounded-sm transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none",
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
