import Image from "next/image";
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
    <section className="relative w-full overflow-hidden rounded-[24px] bg-plum-800 py-6">
      {/* Background Image */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image 
          src="/images/velastia for every you banner image.png" 
          alt="Velastia Banner Background" 
          fill 
          className="object-cover object-right lg:object-center" 
        />
      </div>

      <div className="container-vel relative z-10 flex flex-col items-center gap-4 lg:flex-row lg:gap-8 lg:pl-12">
        <p 
          className="shrink-0 text-center font-script text-[3.5rem] leading-[1.1] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] lg:border-r lg:border-gold-500/30 lg:pr-8"
          style={{ color: '#D4AF37' }}
        >
          Velastia
          <span className="block">For Every You</span>
        </p>

        <ul className="flex flex-wrap items-start justify-center gap-7 lg:gap-12 lg:pl-2 lg:pr-32 w-full lg:w-auto">
          {FEATURES.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2.5 text-center">
              <span className="grid size-12 lg:size-[4.25rem] place-items-center rounded-full border border-gold-400/60">
                <Icon className="size-6 lg:size-[28px] text-gold-300" />
              </span>
              <span className="whitespace-pre-line text-[0.82rem] font-medium leading-snug text-cream-50">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
