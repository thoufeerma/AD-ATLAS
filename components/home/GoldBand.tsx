import Image from "next/image";
import { Clock, Droplets, Sparkles, Leaf } from "lucide-react";

const FEATURES = [
  { Icon: Clock, label: "Long Lasting" },
  { Icon: Droplets, label: "Highly Pigmented" },
  { Icon: Sparkles, label: "Smooth Application" },
  { Icon: Leaf, label: "Enriched with Vitamin E" },
];

/** The plum band with the gold script lockup, from B-1-Home. */
export default function GoldBand() {
  return (
    <section className="relative w-full overflow-hidden bg-plum-800 py-7 xl:py-9 2xl:py-10">
      {/* Background Image */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image 
          src="/images/velastia for every you banner image.png" 
          alt="Velastia Banner Background" 
          fill 
          className="object-cover object-right lg:object-center" 
        />
        {/* Contrast overlay to keep text and icons 100% readable on mobile */}
        <div className="absolute inset-0 bg-[#20082d]/75 sm:bg-[#20082d]/35" />
      </div>

      <div className="container-vel relative z-10 flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:gap-8 xl:gap-12 lg:px-4 xl:px-8">
        <p 
          className="shrink-0 text-center font-script text-[clamp(2.5rem,7vw,3.5rem)] xl:text-[3.8rem] 2xl:text-[4.2rem] leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] lg:border-r lg:border-gold-500/30 lg:pr-8 xl:pr-12 2xl:pr-16"
          style={{ color: '#F0C968' }}
        >
          Velastia
          <span className="block">For Every You</span>
        </p>

        <ul className="grid grid-cols-2 sm:flex sm:flex-wrap items-start justify-center lg:justify-around gap-4 sm:gap-6 lg:gap-8 xl:gap-10 2xl:gap-14 w-full lg:flex-1">
          {FEATURES.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2 xl:gap-3 text-center">
              <span className="grid size-12 sm:size-14 lg:size-[4.25rem] xl:size-[4.85rem] 2xl:size-[5.25rem] place-items-center rounded-full border border-gold-400/80 bg-[#160420]/85 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                <Icon className="size-6 lg:size-[28px] xl:size-[32px] 2xl:size-[36px] text-gold-300" />
              </span>
              <span className="whitespace-nowrap text-[0.76rem] sm:text-[0.82rem] xl:text-[0.92rem] 2xl:text-[0.96rem] font-semibold leading-snug text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#160420]/75 px-2.5 xl:px-4 py-1 xl:py-1.5 rounded-full border border-gold-400/25">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
