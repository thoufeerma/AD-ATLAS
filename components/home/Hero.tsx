"use client";

import Image from "next/image";
import { useEffect, useState, Fragment } from "react";
import { ChevronLeft, ChevronRight, FlaskConical, Leaf, ShieldCheck, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import IntroductoryOfferMedallion from "@/components/home/IntroductoryOfferMedallion";
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
    image: "/brand/hero-ingredients.webp",
    alt: "Velastia serum, face cream and lipstick on marble pedestal with botanical flask on cream silk",
    dark: false,
  },
];

const BADGES = [
  { Icon: FlaskConical, line1: "PREMIUM", line2: "INGREDIENTS" },
  { Icon: ShieldCheck, line1: "DERMATOLOGICALLY", line2: "TESTED" },
  { Icon: Heart, line1: "CRUELTY FREE &", line2: "VEGAN" },
  { Icon: Leaf, line1: "MADE IN", line2: "INDIA" },
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
            // The products sit right of centre in every shot, so object-right
            // keeps them framed cleanly on the right half across all viewports.
            className="object-cover object-right lg:object-[86%_32%] xl:object-[84%_28%]"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden transition-colors duration-700",
        dark ? "bg-plum-950" : "bg-cream-50",
      )}
    >
      {/* Full-bleed photography background across mobile and desktop */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        {track}
      </div>

      {/* Shade gradient overlay to keep text readable on any photo across mobile and desktop */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[5] transition-colors duration-700",
          dark
            ? "bg-gradient-to-r from-plum-950/95 via-plum-950/70 to-plum-950/25 sm:from-plum-950/90 sm:via-plum-950/60 lg:from-plum-950/85 lg:via-plum-950/35"
            : "bg-gradient-to-r from-cream-50/95 via-cream-50/80 to-cream-50/30 sm:from-cream-50/90 sm:via-cream-50/65 lg:from-cream-50/85 lg:via-cream-50/30",
        )}
      />

      <div className="container-vel relative z-10 flex min-h-[500px] sm:min-h-[540px] lg:min-h-[620px] xl:min-h-[680px] 2xl:min-h-[740px] items-center pt-10 pb-20 sm:pt-12 sm:pb-22 lg:pt-14 lg:pb-24">
        <div className="w-full max-w-[850px] lg:ml-2 xl:ml-4">
          {/* Keyed so the words fade up again on every slide */}
          <div key={shown} className="hero-copy max-w-xl">
            <h1
              className={cn(
                "font-display font-semibold leading-[1.05]",
                dark ? "text-cream-50" : "text-[#20082d]",
              )}
              style={{ fontSize: "clamp(2.35rem, 1.35rem + 3.8vw, 4.8rem)" }}
            >
              {slide.headline.map((line, n) => (
                <span
                  key={line}
                  className={cn(
                    "block",
                    n === slide.headline.length - 1 ? "text-[#c8963c]" : dark ? "text-cream-50" : "text-[#20082d]",
                  )}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p
              className={cn(
                "mt-4 sm:mt-6 max-w-md text-[clamp(0.95rem,2.2vw,1.15rem)] font-medium leading-relaxed drop-shadow-sm",
                dark ? "text-cream-100" : "text-[#20082d]",
              )}
            >
              {slide.copy}
            </p>

            <Button
              href={slide.cta.href}
              size="lg"
              className="mt-6 sm:mt-8 px-8 sm:px-10 h-12 sm:h-14 min-h-[44px] text-[0.82rem] sm:text-[0.85rem] bg-[#20082d] text-cream-50 hover:bg-[#2e0c40] border border-gold-400/40 shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
            >
              {slide.cta.label}
            </Button>
          </div>
        </div>

        {/* Introductory offer medallion — 100% pure-coded component matching reference design */}
        {welcomeOffer && (
          <IntroductoryOfferMedallion
            offer={welcomeOffer}
            className="absolute right-6 top-6 hidden lg:flex xl:right-14 xl:top-10 z-20"
          />
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
            "absolute inset-y-0 my-auto hidden size-11 place-items-center rounded-full border backdrop-blur transition-colors lg:grid",
            side,
            dark
              ? "border-gold-400/40 bg-plum-900/60 text-gold-200 hover:bg-plum-900/85"
              : "border-gold-500/40 bg-cream-50/70 text-plum-800 hover:bg-cream-50",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-[4.25rem] lg:bottom-[4.75rem] inset-x-0 mx-auto flex w-fit gap-1 sm:gap-2 z-20">
        {SLIDES.map((s, n) => (
          <button
            key={s.image}
            onClick={() => {
              setSilent(false);
              setI(n);
            }}
            aria-label={`Go to slide ${n + 1}`}
            aria-current={n === shown}
            className="p-3 grid place-items-center focus:outline-none"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all",
                n === shown ? "w-6 bg-gold-600" : "w-1.5 bg-gold-500/50",
              )}
            />
          </button>
        ))}
      </div>

      {/* ── Full-Width Edge-to-Edge Trust Ribbon ──────────────────────────
          Spans 100% from one end to the other end, matching the clean
          rectilinear architectural aesthetic of the site (like the
          AnnouncementBar and GoldBand).
      ─────────────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full bg-[#20082d] border-t border-gold-400/40 border-b border-black/20 shadow-md">
        <div className="container-vel py-3 sm:py-3.5 xl:py-4 2xl:py-5">
          <ul className="grid grid-cols-2 gap-y-3.5 gap-x-3 sm:gap-x-4 sm:flex sm:items-center sm:justify-between px-2 sm:px-6 lg:px-8 xl:px-6 2xl:px-8">
            {BADGES.map(({ Icon, line1, line2 }, idx) => (
              <Fragment key={line1}>
                <li className="flex items-center justify-start gap-2.5 sm:gap-3 xl:gap-4">
                  <span className="grid size-8 sm:size-9 lg:size-10 xl:size-12 2xl:size-13 shrink-0 place-items-center rounded-full border border-gold-400/60 bg-gold-500/15 text-gold-300 shadow-inner">
                    <Icon className="size-4 sm:size-4.5 lg:size-5 xl:size-6 2xl:size-6.5 text-[#fcedc7]" strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-col text-left leading-[1.15]">
                    <span className="font-heading text-[0.62rem] sm:text-[0.74rem] lg:text-[0.8rem] xl:text-[0.9rem] 2xl:text-[0.96rem] font-bold tracking-[0.06em] sm:tracking-[0.14em] uppercase text-cream-50">
                      {line1}
                    </span>
                    <span className="font-heading text-[0.62rem] sm:text-[0.74rem] lg:text-[0.8rem] xl:text-[0.9rem] 2xl:text-[0.96rem] font-bold tracking-[0.06em] sm:tracking-[0.14em] uppercase text-cream-50">
                      {line2}
                    </span>
                  </div>
                </li>
                {idx < BADGES.length - 1 && (
                  <span className="hidden sm:block h-6 xl:h-8 w-px bg-gold-400/30 shrink-0" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
