import { CreditCard, RotateCcw, Truck, Gift, Play, ArrowRight } from "lucide-react";
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
      <div className="container-vel grid gap-8 py-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {services.map(({ Icon, title, note }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold-300/70">
                <Icon className="size-4 text-gold-600" />
              </span>
              <span className="text-[0.72rem] leading-tight text-ink-soft">
                <span className="block font-medium text-plum-800">{title}</span>
                {note}
              </span>
            </li>
          ))}
        </ul>

        {/* Behind The Beauty */}
        <div className="flex items-center gap-4 border-gold-200/60 lg:border-l lg:pl-8">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-plum-800">
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-7 place-items-center rounded-full bg-cream-50/90">
                <Play className="size-3 fill-plum-800 text-plum-800" />
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg text-plum-800">Behind The Beauty</h3>
            <p className="mt-0.5 max-w-[16rem] text-xs leading-relaxed text-ink-soft">
              Watch our story, our process, and our promise.
            </p>
            <Link
              href="/about"
              className="label-caps mt-1.5 inline-flex items-center gap-1.5 text-[0.6rem] text-gold-600 hover:text-gold-500"
            >
              Watch Video <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
