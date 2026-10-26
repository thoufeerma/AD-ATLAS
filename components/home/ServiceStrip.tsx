import { CreditCard, RotateCcw, Truck, Gift, ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/api/server";
import { inrPaise } from "@/lib/utils";

export default async function ServiceStrip() {
  const { shipping } = await getSettings();
  const freeAbove = shipping?.freeAbovePaise;

  const services = [
    { Icon: CreditCard, title: "Secure", note: "Payments" },
    { Icon: RotateCcw, title: "Easy Returns", note: "(7 Days)" },
    freeAbove != null
      ? { Icon: Truck, title: "Free Shipping", note: `above ${inrPaise(freeAbove)}` }
      : { Icon: Truck, title: "Fast Shipping", note: "across India" },
    { Icon: Gift, title: "Exclusive Offers", note: "for Members" },
  ];

  return (
    <section className="border-b border-gold-200/60 bg-cream-50">
      <div className="container-vel py-5 lg:py-6 xl:py-7 2xl:py-8">
        <div className="flex flex-col gap-y-6 lg:flex-row lg:items-center lg:justify-between lg:gap-x-6 xl:gap-x-10 2xl:gap-x-14">
          {/* The 4 service perks */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-x-4 lg:flex lg:flex-1 lg:items-center lg:justify-between lg:gap-x-3 xl:gap-x-6 2xl:gap-x-8">
            {services.map(({ Icon, title, note }) => (
              <div key={title} aria-label={`${title} ${note}`} className="flex items-center gap-2 sm:gap-2.5 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 shrink-0">
                <span className="grid size-9 sm:size-9.5 lg:size-10 xl:size-12 2xl:size-13 shrink-0 place-items-center rounded-full border border-gold-400/70 bg-gold-500/5">
                  <Icon strokeWidth={1.3} className="size-4.5 sm:size-5 lg:size-5 xl:size-6 2xl:size-6.5 text-gold-600" />
                </span>
                <div className="flex flex-col text-left leading-tight shrink-0">
                  <span className="font-heading text-[0.8rem] sm:text-[0.86rem] lg:text-[0.88rem] xl:text-[1.02rem] 2xl:text-[1.1rem] font-bold text-plum-900 tracking-[-0.01em] whitespace-nowrap">
                    {title}
                  </span>
                  <span className="font-heading text-[0.7rem] sm:text-[0.75rem] lg:text-[0.78rem] xl:text-[0.86rem] 2xl:text-[0.92rem] font-medium text-plum-800/80 mt-0.5 whitespace-nowrap">
                    {note}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Behind The Beauty */}
          <div className="flex flex-row items-center gap-4 sm:gap-5 xl:gap-6 pt-4 border-t border-gold-200/50 lg:border-t-0 lg:pt-0 lg:border-l lg:border-gold-200/60 lg:pl-6 xl:pl-8 2xl:pl-12 shrink-0">
            <Link
              href="/about"
              className="group relative h-[4.75rem] w-[8.5rem] sm:h-[5.25rem] sm:w-[9.5rem] lg:h-[5.5rem] lg:w-[10rem] xl:h-[6.5rem] xl:w-[12rem] 2xl:h-[7.25rem] 2xl:w-[13.5rem] shrink-0 overflow-hidden rounded-[10px] bg-plum-800 shadow-sm block"
              aria-label="Watch our story video"
            >
              <Image
                src="/brand/about-lab.png"
                alt="Velastia formulation laboratory and ingredients"
                fill
                sizes="(min-width: 1280px) 220px, (min-width: 640px) 180px, 140px"
                className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-9 sm:size-10 xl:size-12 items-center justify-center rounded-full border-2 border-white bg-black/25 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="ml-0.5 size-4 sm:size-4.5 xl:size-5.5 fill-white text-white" />
                </div>
              </div>
            </Link>
            <div className="flex flex-col justify-center">
              <h3 className="font-display text-[1.15rem] sm:text-[1.25rem] lg:text-[1.35rem] xl:text-[1.5rem] 2xl:text-[1.65rem] font-semibold text-plum-900 leading-tight">
                Behind The Beauty
              </h3>
              <p className="mt-1 max-w-[15rem] xl:max-w-[18rem] text-[0.82rem] sm:text-[0.88rem] xl:text-[0.92rem] 2xl:text-[0.98rem] font-semibold leading-snug text-[#1a0525]">
                Watch our story, our process,
                <br className="hidden sm:block" />
                and our promise.
              </p>
              <Link
                href="/about"
                className="label-caps mt-1.5 inline-flex min-h-[36px] items-center gap-1.5 text-[0.72rem] sm:text-[0.76rem] xl:text-[0.82rem] 2xl:text-[0.86rem] font-bold text-plum-800 hover:text-gold-600 transition-colors"
              >
                WATCH VIDEO <ArrowRight className="size-3.5 xl:size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
