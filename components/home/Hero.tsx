"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FlaskConical, Leaf, ShieldCheck, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    headline: ["Luxury.", "Science.", "You."],
    copy: "Premium beauty, crafted with science and designed for the modern Indian woman.",
    cta: { label: "Shop Now", href: "/shop" },
  },
  {
    headline: ["Velvet.", "Matte.", "Forever."],
    copy: "Twelve hours of one-swipe colour, enriched with Vitamin E and jojoba oil.",
    cta: { label: "Shop Lipstick", href: "/shop?category=lipstick" },
  },
  {
    headline: ["Clean.", "Proven.", "Kind."],
    copy: "Dermatologically tested, cruelty free and vegan. Made in India, for Indian skin.",
    cta: { label: "Our Ingredients", href: "/ingredients" },
  },
];

const BADGES = [
  { Icon: FlaskConical, label: "Premium\nIngredients" },
  { Icon: ShieldCheck, label: "Dermatologically\nTested" },
  { Icon: Heart, label: "Cruelty Free\n& Vegan" },
  { Icon: Leaf, label: "Made in\nIndia" },
];

export default function Hero() {
  const { welcomeOffer } = useSettings();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, []);

  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative overflow-hidden bg-cream-100">
      {/* Product photography sits on the right; the copy gets its own column so
          nothing overlaps the bottles the way a full-bleed background would. */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <Image
          src="/brand/hero-products.png"
          alt="Velastia velvet matte lipstick, liquid lipstick and packaging on silk"
          fill
          priority
          sizes="58vw"
          className="object-cover object-left"
        />
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cream-100 to-transparent" />
      </div>

      <div className="container-vel relative grid min-h-[440px] items-center py-14 lg:min-h-[540px] lg:grid-cols-2">
        {/* pl clears the carousel arrow, which sits at the section edge */}
        <div className="max-w-lg lg:pl-12">
          <h1 className="font-display text-[2.9rem] leading-[1.05] text-plum-800 sm:text-[3.6rem]">
            {slide.headline.map((line, n) => (
              <span
                key={line}
                className={cn("block", n === slide.headline.length - 1 && "text-gold-600")}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
            {slide.copy}
          </p>

          <Button href={slide.cta.href} size="lg" className="mt-7">
            {slide.cta.label}
          </Button>

          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-4">
            {BADGES.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-5 shrink-0 text-gold-600" />
                <span className="label-caps whitespace-pre-line text-[0.55rem] leading-tight text-ink-soft">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Same photography, stacked under the copy on small screens */}
        <div className="relative mt-10 aspect-16/9 overflow-hidden rounded-[var(--radius-card)] lg:hidden">
          <Image
            src="/brand/hero-products.png"
            alt="Velastia velvet matte lipstick, liquid lipstick and packaging on silk"
            fill
            priority
            sizes="92vw"
            className="object-cover"
          />
        </div>

        {/* Introductory offer medallion — only while the welcome code is live */}
        {welcomeOffer && (
          <div className="pointer-events-none absolute right-6 top-10 hidden size-[132px] flex-col items-center justify-center rounded-full border border-gold-400/70 bg-plum-800/92 text-center xl:flex">
            <span className="label-caps text-[0.44rem] text-gold-300">Introductory Offer</span>
            <span className="mt-1 font-display text-3xl font-semibold leading-none text-gold-300">
              {welcomeOffer.percent}% OFF
            </span>
            <span className="mt-1 text-[0.5rem] text-cream-200/80">
              {welcomeOffer.firstOrderOnly ? "on your first order" : "on your order"}
            </span>
            <span className="label-caps mt-1.5 bg-gold-600 px-2 py-0.5 text-[0.48rem] text-white">
              Code: {welcomeOffer.code}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden size-9 lg:grid -translate-y-1/2 place-items-center rounded-full border border-gold-400/50 bg-cream-50/80 text-plum-800 backdrop-blur transition-colors hover:bg-cream-50 lg:left-6"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden size-9 lg:grid -translate-y-1/2 place-items-center rounded-full border border-gold-400/50 bg-cream-50/80 text-plum-800 backdrop-blur transition-colors hover:bg-cream-50 lg:right-6"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            aria-label={`Go to slide ${n + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              n === i ? "w-6 bg-gold-600" : "w-1.5 bg-gold-500/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
