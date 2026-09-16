import { Clock, Droplets, Sparkles, Leaf } from "lucide-react";

const FEATURES = [
  { Icon: Clock, label: "Long Lasting" },
  { Icon: Droplets, label: "Highly Pigmented" },
  { Icon: Sparkles, label: "Smooth Application" },
  { Icon: Leaf, label: "Enriched with\nVitamin E" },
];

/** The plum band with the gold script lockup, from B-1-Home. */
export default function GoldBand() {
  return (
    <section className="relative overflow-hidden bg-plum-800">
      {/* Soft brushstroke wash on the right, as drawn in the reference */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-plum-600/45 to-transparent" />

      <div className="container-vel relative flex flex-col items-center gap-8 py-10 lg:flex-row lg:gap-14">
        <p className="shrink-0 text-center font-script text-4xl leading-tight text-gold-300 lg:border-r lg:border-gold-500/30 lg:pr-14 lg:text-left">
          Velastia
          <span className="block">For Every You</span>
        </p>

        <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
          {FEATURES.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2.5 text-center">
              <span className="grid size-11 place-items-center rounded-full border border-gold-400/60">
                <Icon className="size-[18px] text-gold-300" />
              </span>
              <span className="label-caps whitespace-pre-line text-[0.62rem] leading-tight text-cream-100">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
