import { CreditCard, RotateCcw, Truck, Gift, ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
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
      <div className="container-vel flex flex-wrap items-center justify-start gap-x-6 gap-y-8 py-4 lg:gap-x-8 xl:gap-x-10">
        {services.map(({ Icon, title, note }) => (
          <Fragment key={title}>
            <div className="flex items-center gap-4">
              <span className="grid size-[3.5rem] shrink-0 place-items-center rounded-full border border-gold-400/80">
                <Icon strokeWidth={1.25} className="size-[1.65rem] text-gold-600" />
              </span>
              <span className="text-base font-bold leading-[1.3] text-plum-800">
                <span className="block">{title}</span>
                {note}
              </span>
            </div>
            {/* Divider */}
            <div className="hidden h-12 w-px bg-gold-200/80 lg:block" />
          </Fragment>
        ))}

        {/* Behind The Beauty */}
        <div className="flex items-center gap-6">
          <div className="group relative h-[7.5rem] w-[13rem] shrink-0 overflow-hidden rounded-[8px] bg-plum-800 shadow-sm">
            <Image src="/brand/about-lab.png" alt="" fill sizes="220px" className="object-cover opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-white bg-black/20 backdrop-blur-sm">
                <Play className="ml-1 size-6 fill-white text-white" />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-display text-[1.4rem] font-semibold text-plum-800">Behind The Beauty</h3>
            <p className="mt-1 max-w-[15rem] text-[0.95rem] font-medium leading-[1.4] text-plum-800/85">
              Watch our story, our process,
              <br className="hidden sm:block" />
              and our promise.
            </p>
            <Link
              href="/about"
              className="label-caps mt-2.5 inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-plum-800 hover:text-plum-700"
            >
              WATCH VIDEO <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
