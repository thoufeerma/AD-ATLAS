"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FlaskConical, Leaf, ShieldCheck, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { cn } from "@/lib/utils";

/**
 * Full-bleed photography with the copy over it. `dark` picks the lettering for
 * the darker shots — the photograph is never boxed in by a panel of colour.
 */
const SLIDES = [
  {
    headline: ["Luxury.", "Science.", "You."],
    copy: "Premium beauty, crafted with science and designed for the modern Indian woman.",
    cta: { label: "Shop Now", href: "/shop" },
    image: "/brand/hero-1.webp",
    alt: "Velastia velvet matte lipstick, liquid lipstick and packaging on cream silk",
    dark: false,
  },
  {
    headline: ["Velvet.", "Matte.", "Forever."],
    copy: "Twelve hours of one-swipe colour, enriched with Vitamin E and jojoba oil.",
    cta: { label: "Shop Lipstick", href: "/shop?category=lipstick" },
    image: "/brand/hero-2.webp",
    alt: "The Velastia range — lipstick, serum, compact and brushes — on plum velvet",
    dark: true,
  },
  {
    headline: ["Pure.", "Potent.", "Perfect."],
    copy: "Dermatologically tested, cruelty free and vegan. Made in India, for Indian skin.",
    cta: { label: "Our Ingredients", href: "/ingredients" },
    image: "/brand/hero-3.webp",
    alt: "Velastia lipstick, liquid lipstick and box on a marble slab",
    dark: false,
  },
];

const BADGES = [
  { Icon: FlaskConical, label: "Premium\nIngredients" },
  { Icon: ShieldCheck, label: "Dermatologically\nTested" },
  { Icon: Heart, label: "Cruelty Free\n& Vegan" },
  { Icon: Leaf, label: "Made in\nIndia" },
];

/** How long each slide is shown, and how long the slide across takes. */
const SLIDE_MS = 4500;
const GLIDE_MS = 700;

export default function Hero() {
  const { welcomeOffer } = useSettings();

  /**
   * The track carries the three photographs plus a copy of the first at the
   * end, so it only ever travels one way: … → 3 → 1(copy) → and then silently
   * back to the real 1 while that copy is on screen. Nothing rewinds.
   */
  const LAST = SLIDES.length;
  const [i, setI] = useState(0);
  const [silent, setSilent] = useState(false); // the reset move, with no animation
  const shown = i % SLIDES.length;
  const slide = SLIDES[shown];
  const dark = slide.dark;

  // Advance on a timer, restarted whenever the slide changes — so arrows and
  // dots buy a full interval rather than a leftover moment.
  useEffect(() => {
    if (i === LAST) return; // the copy of the first slide hands over below
    const t = setTimeout(() => {
      setSilent(false);
      setI((n) => n + 1);
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, LAST]);

  // Once the copy of slide one is in place, jump to the real one without
  // animating. A timer rather than transitionend, which never fires for
  // visitors who have asked for reduced motion.
  useEffect(() => {
    if (i !== LAST) return;
    const t = setTimeout(() => {
      setSilent(true);
      setI(0);
    }, GLIDE_MS + 50);
    return () => clearTimeout(t);
  }, [i, LAST]);

  function go(direction: 1 | -1) {
    if (direction === 1) {
      setSilent(false);
      setI((n) => (n >= LAST ? 1 : n + 1));
      return;
    }
    if (i === 0) {
      // Step to the copy at the far end first, then glide back one, so "back"
      // from the first slide still travels the same way as everything else.
      setSilent(true);
      setI(LAST);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setSilent(false);
          setI(LAST - 1);
        }),
      );
      return;
    }
    setSilent(false);
    setI((n) => n - 1);
  }

  /** The photographs side by side, slid along one place at a time. */
  const track = (
    <div
      className={cn(
        "flex h-full relative",
        silent ? "transition-none" : "transition-[left] duration-700 ease-out motion-reduce:transition-none",
      )}
      style={{ left: `-${i * 100}%` }}
    >
      {[...SLIDES, SLIDES[0]].map((s, n) => (
        <div key={n} className="relative h-full w-full shrink-0">
          <Image
            src={s.image}
            alt={n === LAST ? "" : s.alt}
            fill
            priority={n === 0}
            sizes="100vw"
            // The products sit right of centre in every shot, so the narrower
            // crop on a phone keeps that side.
            className="object-cover object-right lg:object-center"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      className={cn(
        // Unify the container to flow vertically on mobile, and stack at lg:
        "relative flex flex-col lg:block overflow-hidden bg-cream-50 transition-colors duration-700",
        dark && "lg:bg-plum-950",
      )}
    >
      {/* Unified track wrapper: aspect box on mobile, full-bleed absolute on lg: */}
      <div className="relative w-full overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:w-full">
        {track}
      </div>
      {/* Just enough shade under the words to keep them readable on any photo */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 hidden bg-gradient-to-r to-transparent transition-colors duration-700 lg:block",
          dark ? "from-plum-950/70 via-plum-950/15" : "from-cream-50/80 via-cream-50/20",
        )}
      />

      <div className="container-vel relative flex items-center py-8 md:py-10 lg:min-h-[580px] lg:py-16">
        <div className="w-full max-w-[800px] lg:ml-12 xl:ml-16">
          {/* Keyed so the words fade up again on every slide */}
          <div key={shown} className="hero-copy max-w-xl">
            <h1
              className={cn(
                "font-display font-semibold leading-[1.05] text-[#20082d]",
                dark && "lg:text-white",
              )}
              style={{ fontSize: "clamp(2.75rem, 1.5rem + 3.5vw, 4.8rem)" }}
            >
              {slide.headline.map((line, n) => (
                <span
                  key={line}
                  className={cn(
                    "block",
                    n === slide.headline.length - 1 && (dark ? "text-[#c8963c] lg:text-[#c8963c]" : "text-[#c8963c]"),
                  )}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p
              className={cn(
                "mt-6 max-w-md text-[1.15rem] font-medium leading-relaxed text-[#20082d]/70",
                dark && "lg:text-white/80",
              )}
            >
              {slide.copy}
            </p>

            <Button
              href={slide.cta.href}
              size="lg"
              className={cn("mt-8 px-10 h-14 text-[0.85rem]", dark && "lg:bg-[#c8963c] lg:text-white lg:hover:bg-[#a67b2d]")}
            >
              {slide.cta.label}
            </Button>
          </div>

          <ul className="mt-10 md:mt-12 lg:mt-14 flex flex-wrap lg:flex-nowrap items-center gap-x-6 xl:gap-x-10 gap-y-5">
            {BADGES.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 xl:gap-3">
                <Icon className={cn("size-5 md:size-6 xl:size-7 shrink-0 text-[#c8963c]", dark && "lg:text-[#c8963c]")} strokeWidth={1.5} />
                <span
                  className={cn(
                    "whitespace-pre-line text-[0.65rem] font-bold tracking-wide uppercase leading-tight text-[#20082d]/80",
                    dark && "lg:text-white/80",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Introductory offer medallion — only while the welcome code is live */}
        {welcomeOffer && (
          <div className="pointer-events-none absolute right-16 top-10 hidden size-[180px] flex-col items-center justify-center rounded-full border border-[#c8963c] bg-[#20082d] text-center xl:flex shadow-2xl p-3">
            <span className="text-[0.45rem] font-bold text-[#c8963c] tracking-[0.15em] uppercase">Introductory Offer</span>
            <span className="mt-2 font-display text-[3.2rem] font-medium leading-none text-[#c8963c]">
              {welcomeOffer.percent}%
            </span>
            <span className="mt-0.5 font-display text-[1.5rem] font-medium leading-[1] text-[#c8963c]">
              OFF
            </span>
            <span className="mt-3 text-[0.45rem] font-bold text-white tracking-[0.1em] uppercase">
              {welcomeOffer.firstOrderOnly ? "On your first order" : "On your order"}
            </span>
            <span className="mt-1 text-[0.45rem] font-bold text-white tracking-[0.1em] uppercase">
              Code: {welcomeOffer.code}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      {[
        { d: -1 as const, label: "Previous slide", Icon: ChevronLeft, side: "left-3 lg:left-6" },
        { d: 1 as const, label: "Next slide", Icon: ChevronRight, side: "right-3 lg:right-6" },
      ].map(({ d, label, Icon, side }) => (
        <button
          key={label}
          onClick={() => go(d)}
          aria-label={label}
          className={cn(
            "absolute inset-y-0 my-auto hidden size-9 place-items-center rounded-full border backdrop-blur transition-colors lg:grid",
            side,
            dark
              ? "border-gold-400/40 bg-plum-900/60 text-gold-200 hover:bg-plum-900/85"
              : "border-gold-500/40 bg-cream-50/70 text-plum-800 hover:bg-cream-50",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}

      <div className="absolute bottom-5 inset-x-0 mx-auto flex w-fit gap-2">
        {SLIDES.map((s, n) => (
          <button
            key={s.image}
            onClick={() => {
              setSilent(false);
              setI(n);
            }}
            aria-label={`Go to slide ${n + 1}`}
            aria-current={n === shown}
            className={cn(
              "h-1.5 rounded-full transition-all",
              n === shown ? "w-6 bg-gold-600" : "w-1.5 bg-gold-500/50",
            )}
          />
        ))}
      </div>
    </section>
  );
}
