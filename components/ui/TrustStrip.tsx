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
  { Icon: Heart, title: "Cruelty Free", note: "& Vegan" },
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
      <div className="container-vel grid grid-cols-2 gap-x-6 gap-y-7 py-8 sm:grid-cols-3 lg:grid-cols-5">
        {ITEMS.map(({ Icon, title, note }) => (
          <div key={title} className="flex items-center gap-3">
            <Icon className={cn("size-6 shrink-0", dark ? "text-gold-400" : "text-gold-600")} />
            <div className="leading-tight">
              <p className={cn("label-caps text-[0.62rem]", dark ? "text-cream-100" : "text-plum-800")}>
                {title}
              </p>
              {note && (
                <p className={cn("label-caps text-[0.62rem]", dark ? "text-cream-200/70" : "text-ink-soft")}>
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
