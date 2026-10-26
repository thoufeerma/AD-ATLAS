import {
  FlaskConical,
  Leaf,
  ShieldCheck,
  Heart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** The "Science Backed / Clean & Safe / Dermatologically Tested..." band. */
const ITEMS: { Icon: LucideIcon; title: string; note?: string }[] = [
  { Icon: FlaskConical, title: "Science Backed", note: "Formulas" },
  { Icon: Leaf, title: "Clean & Safe", note: "Ingredients" },
  { Icon: ShieldCheck, title: "Dermatologically", note: "Tested" },
  { Icon: Heart, title: "Cruelty-Free", note: "& Vegan" },
  { Icon: Sparkles, title: "Designed For", note: "Indian Skin" },
];

export default function TrustStrip({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <section
      className={cn(
        dark ? "bg-plum-800 text-cream-100" : "border-y border-gold-200/60 bg-cream-100",
        className,
      )}
    >
      <div className="container-vel flex flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-7 lg:grid lg:grid-cols-5 lg:gap-x-4 xl:gap-x-8 py-7 sm:py-8 xl:py-10 2xl:py-11">
        {ITEMS.map(({ Icon, title, note }) => (
          <div key={title} className="flex items-center gap-2.5 sm:gap-3.5 xl:gap-4.5 lg:justify-self-center first:lg:justify-self-start last:lg:justify-self-end">
            <span className="grid size-10 lg:size-12 xl:size-14 2xl:size-15 shrink-0 place-items-center rounded-full border border-gold-300/60 bg-gold-500/5">
              <Icon strokeWidth={1.25} className={cn("size-5 lg:size-6.5 xl:size-7.5 2xl:size-8 shrink-0", dark ? "text-gold-400" : "text-gold-600")} />
            </span>
            <div className="leading-tight">
              <p className={cn("label-caps text-[0.68rem] xl:text-[0.8rem] 2xl:text-[0.86rem]", dark ? "text-cream-100" : "text-plum-800")}>
                {title}
              </p>
              {note && (
                <p className={cn("label-caps text-[0.68rem] xl:text-[0.8rem] 2xl:text-[0.86rem]", dark ? "text-cream-200/70" : "text-ink-soft")}>
                  {note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
