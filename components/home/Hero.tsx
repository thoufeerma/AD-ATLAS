"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FlaskConical, Leaf, ShieldCheck, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { cn } from "@/lib/utils";

/** Each slide brings its own photograph; the copy column stays on the page's own cream. */
const SLIDES = [
  {
    headline: ["Luxury.", "Science.", "You."],
    copy: "Premium beauty, crafted with science and designed for the modern Indian woman.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/brand/hero-1.webp",
    alt: "Velastia velvet matte lipstick, liquid lipstick and packaging on cream silk",
  },
  {
    headline: ["Velvet.", "Matte.", "Forever."],
    copy: "Twelve hours of one-swipe colour, enriched with Vitamin E and jojoba oil.",
    cta: { label: "Shop Lipstick", href: "/shop?category=lipstick" },
    image: "/brand/hero-2.webp",
    alt: "The Velastia range — lipstick, serum, compact and brushes — on plum velvet",
  },
  {
    headline: ["Clean.", "Proven.", "Kind."],
    copy: "Dermatologically tested, cruelty free and vegan. Made in India, for Indian skin.",
    cta: { label: "Our Ingredients", href: "/ingredients" },
    image: "/brand/hero-3.webp",
    alt: "Velastia lipstick, liquid lipstick and box on a marble slab",
  },
];

const BADGES = [
  { Icon: FlaskConical, label: "Premium\nIngredients" },
  { Icon: ShieldCheck, label: "Dermatologically\nTested" },
  { Icon: Heart, label: "Cruelty Free\n& Vegan" },
  { Icon: Leaf, label: "Made in\nIndia" },
];

/** How long each slide is shown before the next one slides in. */
const SLIDE_MS = 4500;

export default function Hero() {
  const { welcomeOffer } = useSettings();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];

  // Keyed on `i`, so using the arrows or dots restarts the wait rather than
  // letting a slide flick past a moment after it arrives.
  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i]);

  const go = (d: number) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);

  /** The photographs, side by side, slid along by one width per slide. */
  const track = (sizes: string) => (
    <div
      className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
      style={{ transform: `translateX(-${i * 100}%)` }}
    >
      {SLIDES.map((s, n) => (
        <div key={s.image} className="relative h-full w-full shrink-0">
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={n === 0}
            sizes={sizes}
            // The products sit on the right of every shot; the column is
            // narrower than the photo, so crop from that side inwards.
            className="object-cover object-right"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="relative overflow-hidden">
      {/* Product photography sits on the right; the copy gets its own column so
          nothing overlaps the bottles the way a full-bleed background would. */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden lg:block">
        {track("58vw")}
        {/* Softens the edge where the photograph meets the copy column */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cream-50 to-transparent" />
      </div>

      <div className="container-vel relative grid min-h-[440px] items-center py-14 lg:min-h-[540px] lg:grid-cols-2">
        {/* pl clears the carousel arrow, which sits at the section edge */}
        <div className="max-w-lg lg:pl-12">
          {/* Keyed so the words fade up again on every slide */}
          <div key={i} className="hero-copy">
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

            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">{slide.copy}</p>

            <Button href={slide.cta.href} size="lg" className="mt-7">
              {slide.cta.label}
            </Button>
          </div>

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
          {track("92vw")}
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
      {[
        { d: -1, label: "Previous slide", Icon: ChevronLeft, side: "left-3 lg:left-6" },
        { d: 1, label: "Next slide", Icon: ChevronRight, side: "right-3 lg:right-6" },
      ].map(({ d, label, Icon, side }) => (
        <button
          key={label}
          onClick={() => go(d)}
          aria-label={label}
          className={cn(
            "absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-gold-400/50 bg-cream-50/80 text-plum-800 backdrop-blur transition-colors hover:bg-cream-50 lg:grid",
            side,
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={s.image}
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
