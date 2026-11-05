"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
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
    copy: "Dermatologically tested, cruelty-free and vegan. Made in India, for Indian skin.",
    cta: { label: "Our Ingredients", href: "/ingredients" },
    image: "/brand/hero-ingredients.webp",
    alt: "Velastia serum, face cream and lipstick on marble pedestal with botanical flask on cream silk",
    dark: false,
  },
];

/** Padded with clones on both ends for seamless infinite circular sliding in both directions */
const EXTENDED_SLIDES = [
  SLIDES[SLIDES.length - 1], // Clone of last slide at index 0
  ...SLIDES,                 // Real slides at index 1, 2, 3
  SLIDES[0],                 // Clone of first slide at index 4
];

const BADGES = [
  { Icon: FlaskConical, label: "PREMIUM INGREDIENTS" },
  { Icon: ShieldCheck, label: "DERMATOLOGICALLY TESTED" },
  { Icon: Heart, label: "CRUELTY-FREE & VEGAN" },
  { Icon: Leaf, label: "MADE IN INDIA" },
];

/** How long each slide is shown (ms) */
const SLIDE_MS = 5000;

export default function Hero() {
  const { welcomeOffer } = useSettings();

  // index 1 corresponds to SLIDES[0]
  const [index, setIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isAnimatingRef = useRef(false);

  // Map extended array index (0..4) to real slide index (0..2)
  const shown = (index - 1 + SLIDES.length) % SLIDES.length;
  const slide = SLIDES[shown];
  const dark = slide.dark;

  // Handle seamless infinite circular wrap at both ends
  const handleTransitionEnd = useCallback((e?: React.TransitionEvent) => {
    if (e && e.target !== e.currentTarget) return;

    if (index === EXTENDED_SLIDES.length - 1) {
      // Reached clone of first slide (index 4) -> silently jump to real first slide (index 1)
      setIsTransitioning(false);
      setIndex(1);
    } else if (index === 0) {
      // Reached clone of last slide (index 0) -> silently jump to real last slide (index 3)
      setIsTransitioning(false);
      setIndex(SLIDES.length);
    }
    isAnimatingRef.current = false;
  }, [index]);

  // Re-enable CSS transitions on the frame after a silent reset
  useEffect(() => {
    if (!isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [isTransitioning]);

  // Safety fallback timeout ensuring animation lock is always released even if transitionend is missed
  useEffect(() => {
    if (index === 0 || index === EXTENDED_SLIDES.length - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(index === 0 ? SLIDES.length : 1);
        isAnimatingRef.current = false;
      }, 750);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        isAnimatingRef.current = false;
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [index]);

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setIndex((prev) => prev - 1);
  }, []);

  const handleDotClick = useCallback((targetIndex: number) => {
    if (isAnimatingRef.current) return;
    const targetSlide = targetIndex + 1;
    if (targetSlide === index) return;
    isAnimatingRef.current = true;
    setIsTransitioning(true);
    setIndex(targetSlide);
  }, [index]);

  // Auto-advance timer, resets when user changes slides or when hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => {
      handleNext();
    }, SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, isPaused, handleNext]);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  /** The photographs side by side, slid along one place at a time */
  const track = (
    <div
      className={cn(
        "flex h-full",
        isTransitioning
          ? "transition-transform duration-700 ease-out motion-reduce:transition-none"
          : "transition-none",
      )}
      style={{
        width: `${EXTENDED_SLIDES.length * 100}%`,
        transform: `translate3d(-${(index * 100) / EXTENDED_SLIDES.length}%, 0, 0)`,
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {EXTENDED_SLIDES.map((s, n) => (
        <div
          key={n}
          className="relative h-full shrink-0"
          style={{ width: `${100 / EXTENDED_SLIDES.length}%` }}
        >
          <Image
            src={s.image}
            alt={n === 0 || n === EXTENDED_SLIDES.length - 1 ? "" : s.alt}
            fill
            priority={n === 1}
            sizes="100vw"
            className="object-cover object-right lg:object-[86%_32%] xl:object-[84%_28%]"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative overflow-hidden transition-colors duration-700 select-none",
        dark ? "bg-plum-950" : "bg-cream-50",
      )}
    >
      {/* Full-bleed photography background across mobile and desktop */}
      <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
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

      <div className="container-vel relative z-10 flex min-h-[500px] sm:min-h-[540px] lg:min-h-[620px] xl:min-h-[680px] 2xl:min-h-[740px] items-center pt-10 pb-20 sm:pt-12 sm:pb-22 lg:pt-14 lg:pb-24 pointer-events-none">
        <div className="w-full max-w-[850px] lg:ml-2 xl:ml-4 pointer-events-auto">
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
              className="mt-6 sm:mt-8 px-8 sm:px-10 h-12 sm:h-14 min-h-[44px] text-[0.82rem] sm:text-[0.85rem] bg-[#20082d] text-cream-50 hover:bg-[#2e0c40] border border-gold-400/50 shadow-[0_8px_24px_rgba(0,0,0,0.45),0_2px_8px_rgba(193,136,62,0.25)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_4px_16px_rgba(193,136,62,0.4)] hover:border-gold-400/80 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              {slide.cta.label}
            </Button>
          </div>
        </div>

        {/* Introductory offer medallion — 100% pure-coded component matching reference design */}
        {welcomeOffer && (
          <IntroductoryOfferMedallion
            offer={welcomeOffer}
            className="absolute right-6 top-6 hidden lg:flex xl:right-14 xl:top-10 z-20 pointer-events-auto"
          />
        )}
      </div>

      {/* Side Arrow Buttons (visible on sm and larger viewports) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous slide"
        className={cn(
          "absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-30",
          "hidden sm:flex size-10 lg:size-11 place-items-center justify-center rounded-full border backdrop-blur transition-all duration-200 cursor-pointer shadow-lg",
          "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-400",
          dark
            ? "border-gold-400/40 bg-plum-900/70 text-gold-200 hover:bg-plum-900/90"
            : "border-gold-500/40 bg-cream-50/80 text-plum-900 hover:bg-cream-50",
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next slide"
        className={cn(
          "absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-30",
          "hidden sm:flex size-10 lg:size-11 place-items-center justify-center rounded-full border backdrop-blur transition-all duration-200 cursor-pointer shadow-lg",
          "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-400",
          dark
            ? "border-gold-400/40 bg-plum-900/70 text-gold-200 hover:bg-plum-900/90"
            : "border-gold-500/40 bg-cream-50/80 text-plum-900 hover:bg-cream-50",
        )}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Slide Navigation Dots & Mobile Arrow Controls (clean thumb-accessible placement) */}
      <div className="absolute bottom-[4.25rem] lg:bottom-[4.75rem] inset-x-0 mx-auto flex w-fit items-center gap-1.5 sm:gap-2.5 z-30">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className={cn(
            "flex sm:hidden size-8 place-items-center justify-center rounded-full border backdrop-blur transition-all duration-200 cursor-pointer shadow-md active:scale-95",
            dark
              ? "border-gold-400/40 bg-plum-900/80 text-gold-200 hover:bg-plum-900"
              : "border-gold-500/40 bg-cream-50/90 text-plum-900 hover:bg-cream-50",
          )}
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {SLIDES.map((s, n) => (
          <button
            key={s.image}
            type="button"
            onClick={() => handleDotClick(n)}
            aria-label={`Go to slide ${n + 1}`}
            aria-current={n === shown}
            className="p-2 sm:p-2.5 grid place-items-center focus:outline-none cursor-pointer"
          >
            <span
              className={cn(
                "block h-1.5 sm:h-2 rounded-full transition-all duration-300",
                n === shown
                  ? "w-6 sm:w-8 bg-gold-500 shadow-[0_0_8px_rgba(200,150,60,0.6)]"
                  : "w-1.5 sm:w-2 bg-gold-400/40 hover:bg-gold-400/70",
              )}
            />
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className={cn(
            "flex sm:hidden size-8 place-items-center justify-center rounded-full border backdrop-blur transition-all duration-200 cursor-pointer shadow-md active:scale-95",
            dark
              ? "border-gold-400/40 bg-plum-900/80 text-gold-200 hover:bg-plum-900"
              : "border-gold-500/40 bg-cream-50/90 text-plum-900 hover:bg-cream-50",
          )}
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* ── Full-Width Edge-to-Edge Trust Ribbon ──────────────────────────
          Spans 100% from one end to the other end, matching the clean
          rectilinear architectural aesthetic of the site (like the
          AnnouncementBar and GoldBand).
      ─────────────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full bg-[#20082d] border-t border-gold-400/40 border-b border-black/20 shadow-md">
        <div className="container-vel py-3 sm:py-3.5 xl:py-4 2xl:py-5">
          <ul className="grid grid-cols-2 gap-y-3 gap-x-2.5 sm:gap-x-4 sm:flex sm:items-center sm:justify-between px-2 sm:px-4 lg:px-6 xl:px-8">
            {BADGES.map(({ Icon, label }, idx) => (
              <Fragment key={label}>
                <li className="flex items-center justify-start gap-2 sm:gap-2.5 lg:gap-3 xl:gap-3.5 min-w-0">
                  <span className="grid size-7 sm:size-8 lg:size-9.5 xl:size-11 2xl:size-12 shrink-0 place-items-center rounded-full border border-gold-400/60 bg-gold-500/15 text-gold-300 shadow-inner">
                    <Icon className="size-3.5 sm:size-4 lg:size-4.5 xl:size-5.5 2xl:size-6 text-[#fcedc7]" strokeWidth={1.5} />
                  </span>
                  <span className="font-heading text-[0.62rem] sm:text-[0.66rem] md:text-[0.72rem] lg:text-[0.8rem] xl:text-[0.88rem] 2xl:text-[0.95rem] font-bold tracking-[0.03em] sm:tracking-[0.06em] lg:tracking-[0.09em] xl:tracking-[0.12em] uppercase text-cream-50 leading-tight min-w-0 sm:whitespace-nowrap">
                    {label}
                  </span>
                </li>
                {idx < BADGES.length - 1 && (
                  <span className="hidden sm:block h-5 lg:h-6 xl:h-7 w-px bg-gold-400/30 shrink-0 mx-1 lg:mx-2" aria-hidden="true" />
                )}
              </Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
