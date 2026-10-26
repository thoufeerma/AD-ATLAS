import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import {
  FlaskConicalOff,
  Beaker,
  TestTubes,
  Biohazard,
  Microscope,
  HeartPulse,
  Droplets,
  FlaskConical,
  ShieldCheck,
  Users,
  Baby,
  Leaf,
  Sprout,
  BadgeCheck,
  Heart,
  CircleCheck,
  CircleX,
  Star,
  ChartNoAxesColumnIncreasing,
  HeartHandshake,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";
import { TransparencyBadge } from "@/components/ingredients/TransparencyBadge";
import {
  VogueLogo,
  ElleLogo,
  FeminaLogo,
  NykaaLogo,
  PinkvillaLogo,
  IndiaTodayLogo,
  TimesOfIndiaLogo,
} from "@/components/ingredients/PressLogos";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("ingredients");
}

/*
 * Desktop (min-[1000px]) sizes on this page are the design's own proportions — its px
 * ÷ 10.24, the design being a 1024px-wide page mockup — and its colours are
 * sampled from it. Tablets and phones get fixed sizes of their own.
 */

const INK = "text-[#1d052b]";
const GOLD = "text-[#c8963c]";
const PURPLE = "bg-[#29082c]";

/**
 * Photos the design calls for. Each shows once its file is in /public; until
 * then a soft placeholder holds its place.
 */
const PHOTOS = {
  hero: "/images/hero section banner ingrediants.png",
  integrity: "/images/beauty with integrity.png",
  band: "/images/Your skin deservesthe safest care. image.png",
};

function Photo({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const present = existsSync(path.join(process.cwd(), "public", src));
  return present ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-[#f6e9dc] to-[#efdccb]" aria-hidden="true" />
  );
}

const FREE_FROM = [
  { icon: "/icons/ingredients/hero_icon_1.svg", label: "No Toxic\nChemicals" },
  { icon: "/icons/ingredients/hero_icon_2.svg", label: "No Parabens\nNo Sulphates" },
  { icon: "/icons/ingredients/hero_icon_3.svg", label: "No Phthalates\nNo Mineral Oils" },
  { icon: "/icons/ingredients/hero_icon_4.svg", label: "No Heavy Metals\nNo Formaldehyde" },
  { icon: "/icons/ingredients/hero_icon_5.svg", label: "No Carcinogenic\nIngredients" },
  { icon: "/icons/ingredients/hero_icon_6.svg", label: "100% Safe For\nEveryday Use" },
];

const PROMISES = [
  { icon: "/icons/ingredients/promise_icon_1.svg", label: "Dermatologically\nTested" },
  { icon: "/icons/ingredients/promise_icon_2.svg", label: "Clinically\nProven" },
  { icon: "/icons/ingredients/promise_icon_3.svg", label: "Non-Irritating\nFormulas" },
  { icon: "/icons/ingredients/promise_icon_4.svg", label: "Suitable For All\nSkin Types" },
  { icon: "/icons/ingredients/promise_icon_5.svg", label: "Pregnancy Safe\nFormulas" },
];

/** Ingredient cards. Real botanical photography for all 10 cards. Line breaks are the design's own. */
const POWER = [
  {
    name: "Vitamin E",
    image: "/ingredients/vitamin-e.png",
    note: "A powerful antioxidant\nthat protects skin from\ndamage and nourishes\ndeeply.",
    benefit: "Benefit: Protects &\nnourishes skin",
  },
  {
    name: "Niacinamide",
    image: "/ingredients/niacinamide.png",
    note: "Helps improve skin texture,\nreduces blemishes and\nenhances natural glow.",
    benefit: "Benefit: Brightens &\nstrengthens skin",
  },
  {
    name: "Hyaluronic Acid",
    image: "/ingredients/hyaluronic.png",
    note: "Deeply hydrates and locks\nin moisture for plump,\nsupple skin.",
    benefit: "Benefit: Hydrates &\nplumps",
  },
  {
    name: "Jojoba Oil",
    image: "/ingredients/jojoba.png",
    note: "Mimics skin's natural oils,\nrestores balance and\nprevents dryness.",
    benefit: "Benefit: Moisturizes &\nbalances",
  },
  {
    name: "Shea Butter",
    image: "/ingredients/shea.png",
    note: "Rich in vitamins, it soothes,\nsoftens and improves\nskin elasticity.",
    benefit: "Benefit: Soothes &\nrepairs",
  },
  {
    name: "Aloe Vera Extract",
    image: "/ingredients/aloe-vera.png",
    note: "Calms irritation, reduces\nredness and hydrates\nsensitive skin.",
    benefit: "Benefit: Soothes &\ncalms",
  },
  {
    name: "Green Tea Extract",
    image: "/ingredients/green-tea.png",
    note: "Packed with antioxidants\nthat protect skin from\nenvironmental stress.",
    benefit: "Benefit: Protects &\nrevitalizes",
  },
  {
    name: "Licorice Extract",
    image: "/ingredients/licorice.png",
    note: "Helps reduce dark spots\nand evens out\nskin tone.",
    benefit: "Benefit: Brightens &\nevens tone",
  },
  {
    name: "Centella Asiatica",
    image: "/ingredients/centella.png",
    note: "Known for its healing\nproperties. Repairs and\nstrengthens skin barrier.",
    benefit: "Benefit: Heals &\nstrengthens",
  },
  {
    name: "Peptide Complex",
    image: "/ingredients/peptide.png",
    note: "Supports collagen\nproduction and improves\nskin firmness.",
    benefit: "Benefit: Firms &\nrejuvenates",
  },
];

const REAL_LIFE = [
  "Safe for daily use",
  "Gentle on sensitive skin",
  "Non-comedogenic",
  "Toxin-free",
  "No harmful chemicals",
  "Clean beauty that works",
];

const SAY_NO = [
  ["Parabens", "Lead & Heavy Metals"],
  ["Sulphates (SLS/SLES)", "Hydroquinone"],
  ["Phthalates", "Triclocarban"],
  ["Mineral Oils", "Benzophenone"],
  ["Formaldehyde", "Animal-Derived Ingredients"],
  ["Triclosan", "Carcinogenic Ingredients"],
];

const CERTIFICATIONS = [
  { label: "IFRA\nCompliant", Icon: Sprout },
  { label: "FDA\nApproved Facility", text: "FDA" },
  { label: "GMP\nCertified", Icon: BadgeCheck },
  { label: "Cruelty-Free\n& Vegan", Icon: Heart },
];

const TRUST = [
  { Icon: Sprout, label: "Clean\nIngredients" },
  { Icon: Leaf, label: "Honest\nFormulas" },
  { Icon: ChartNoAxesColumnIncreasing, label: "Real\nResults" },
  { Icon: HeartHandshake, label: "Trusted by\nThousands" },
];

export default function IngredientsPage() {
  return (
    <div className="bg-cream-50 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#faf4ed]">
        {/* Full-width banner behind the hero on desktop, stacked below text on mobile/tablet */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src={PHOTOS.hero}
            alt="Velastia serum, cream and lipstick beside laboratory glassware and a pink flower"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] min-[1000px]:object-right"
          />
          {/* Subtle gradient overlay to guarantee text legibility on the left while preserving the right products */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf4ed]/95 via-[#faf4ed]/80 to-transparent min-[1000px]:w-[58%]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1780px] px-6 py-10 sm:py-12 min-[1000px]:px-[4.5vw] min-[1000px]:pt-[3.2vw] min-[1000px]:pb-[3.5vw]">
          <div className="max-w-xl min-[1000px]:max-w-[48vw]">
            <h1 className="font-display text-[2.1rem] sm:text-[2.6rem] font-medium uppercase leading-[1.12] tracking-[0.01em] min-[1000px]:text-[3vw] min-[1000px]:leading-[3.5vw] text-[#1d052b]">
              <span className="block min-[1000px]:text-[3.05vw]">Beauty You Can See.</span>
              <span className="block min-[1000px]:text-[2.85vw]">
                Ingredients You Can <span className="text-[#c8963c]">Trust.</span>
              </span>
            </h1>

            <p className="mt-2.5 flex items-center gap-1 font-script text-[1.7rem] sm:text-[2rem] leading-[1.3] min-[1000px]:mt-[1vw] min-[1000px]:text-[2.35vw] text-[#c8963c]">
              Safe today. Safe tomorrow. Safe always.
              <ScriptHeart className="mb-1 h-8 w-11 min-[1000px]:h-[3vw] min-[1000px]:w-[4vw]" />
            </p>

            <p className="mt-3.5 text-[0.98rem] sm:text-[1.05rem] leading-[1.5] min-[1000px]:mt-[1.3vw] min-[1000px]:text-[1.35vw] min-[1000px]:leading-[1.9vw] text-[#1d052b] min-[1000px]:whitespace-pre-line font-sans">
              {"At Velastia, we believe true beauty comes from\ningredients that are safe, effective and kind – to\nyour skin and to your health."}
            </p>

            {/* 6 Hero Icons Grid */}
            <ul className="mt-7 grid grid-cols-3 gap-y-6 gap-x-2 sm:grid-cols-6 sm:gap-x-3 min-[1000px]:mt-[2.2vw] min-[1000px]:gap-x-[1.2vw] min-[1000px]:gap-y-0">
              {FREE_FROM.map(({ icon, label }) => (
                <li key={label} className="flex flex-col items-center text-center group">
                  <div className="relative size-12 sm:size-14 min-[1000px]:size-[3.8vw] shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={icon}
                      alt={label.replace("\n", " ")}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="80px"
                    />
                  </div>
                  <span className="mt-2 whitespace-pre-line text-[0.62rem] sm:text-[0.66rem] min-[1000px]:text-[0.72vw] font-bold uppercase leading-[1.35] tracking-wider text-[#1d052b]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Circular Transparency Badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-7 min-[1000px]:top-[2.8vw] min-[1000px]:right-[3.6vw] z-10 pointer-events-auto">
          <TransparencyBadge />
        </div>
      </section>

      {/* 2. We Promise No Compromises */}
      <section className="mt-8 sm:mt-10 px-4 sm:px-6 min-[1000px]:mt-[2.5vw] min-[1000px]:px-[3.6vw]">
        <div
          className="relative overflow-hidden rounded-2xl min-[1000px]:rounded-[20px] px-6 py-8 sm:px-8 sm:py-10 min-[1000px]:py-[2.3vw] min-[1000px]:px-[3vw] flex flex-col min-[1000px]:flex-row min-[1000px]:items-center border border-gold-400/40 shadow-[0_16px_48px_rgba(32,5,43,0.38),0_4px_16px_rgba(32,5,43,0.18)] transition-all duration-300 hover:shadow-[0_22px_56px_rgba(32,5,43,0.48),0_6px_22px_rgba(193,136,62,0.25)] hover:border-gold-400/70"
          style={{ backgroundColor: "#20052b" }}
        >
          {/* Subtle gold aura */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#d4a038]/10 blur-3xl" />

          {/* Left copy */}
          <div className="relative z-10 min-[1000px]:w-[34vw] min-[1000px]:shrink-0 min-[1000px]:pr-[3vw]">
            <h2 className="font-heading text-[1.4rem] sm:text-[1.65rem] min-[1000px]:text-[1.72vw] font-bold uppercase leading-[1.2] tracking-wider text-[#d4a038]">
              We Promise No Compromises.
            </h2>
            <p className="mt-2 text-[0.95rem] sm:text-[1.05rem] min-[1000px]:text-[1.1vw] font-semibold leading-snug text-cream-50">
              We never use anything that can harm you.
            </p>
            <p className="mt-2 text-[0.8rem] sm:text-[0.88rem] min-[1000px]:text-[0.92vw] leading-relaxed text-cream-100/80 max-w-md">
              Every ingredient we use is carefully researched, scientifically tested and globally approved. Because your safety is non-negotiable.
            </p>
          </div>

          {/* Right 5 Promise Columns */}
          <div className="relative z-10 grid grid-cols-2 gap-y-6 sm:grid-cols-5 sm:gap-y-0 min-[1000px]:flex-1">
            {PROMISES.map(({ icon, label }, i) => (
              <div
                key={label}
                className={`relative flex flex-col items-center text-center px-2 min-[1000px]:px-[1vw] group ${
                  i > 0
                    ? "min-[1000px]:border-l min-[1000px]:border-white/15"
                    : ""
                }`}
              >
                <div className="relative size-12 sm:size-14 min-[1000px]:size-[3.6vw] shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={icon}
                    alt={label.replace("\n", " ")}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
                <span className="mt-2.5 whitespace-pre-line text-[0.66rem] sm:text-[0.7rem] min-[1000px]:text-[0.76vw] font-bold tracking-wider text-cream-100 uppercase text-center leading-[1.35]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Power Behind Our Products */}
      <section className="mt-12 sm:mt-16 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-[1.65rem] sm:text-[2rem] lg:text-[2.25rem] font-bold uppercase leading-[1.2] tracking-[0.01em] text-[#1d052b]">
          The Power Behind Our Products
        </h2>
        <p className="mt-1 text-[0.95rem] sm:text-[1.05rem] text-[#1d052b]/85 font-sans">
          Carefully Chosen. Purposefully Used.
        </p>
        <Ornament bare className="mt-2 justify-center" markClassName="h-3 w-6" />

        {/* Responsive grid: strictly 5 per row on desktop (2 rows of 5), 2 per row on mobile/tablet (5 rows of 2) */}
        <ul className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5 py-2">
          {POWER.map((p) => (
            <li
              key={p.name}
              className="group flex flex-col rounded-2xl border border-gold-300/40 bg-[#fffbf7] p-3 sm:p-3.5 shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.18)] hover:border-gold-400/80"
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f0e6da]/40 mb-3 shrink-0">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 48vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-heading text-[0.98rem] sm:text-[1.08rem] lg:text-[1.12rem] font-bold uppercase tracking-wider text-[#1d052b] text-center">
                {p.name}
              </h3>
              <p className="mt-1.5 text-[0.76rem] sm:text-[0.82rem] leading-relaxed text-[#1d052b]/80 text-center font-sans">
                {p.note}
              </p>
              <p className="mt-auto pt-3 text-[0.75rem] sm:text-[0.8rem] font-semibold text-[#a8762c] text-center leading-snug whitespace-pre-line">
                {p.benefit}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Real life · Say no to · Safe, clean & conscious */}
      <section className="mt-14 sm:mt-20 lg:mt-24 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-7 items-stretch">
          {/* Column 1: Made For Real Life */}
          <div className="lg:col-span-4 flex flex-col justify-between py-1">
            <div>
              <h2 className="font-heading text-[1.8rem] sm:text-[2.1rem] lg:text-[2.2rem] font-bold uppercase leading-[1.18] tracking-[0.01em] text-[#1d052b]">
                Made For Real Life.
                <span className="relative inline-flex items-center gap-1.5 mt-0.5">
                  Made For You.
                  <ScriptHeart className="h-7 w-10 text-[#c8963c]" />
                </span>
              </h2>
              <p className="mt-3 text-[0.88rem] sm:text-[0.94rem] leading-relaxed text-[#1d052b]/80 max-w-sm font-sans">
                {"Our products are designed for everyday use –\nbecause we use only clean, safe and effective\ningredients that your skin loves."}
              </p>
            </div>
            <ul className="mt-6 space-y-3.5">
              {REAL_LIFE.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[0.88rem] sm:text-[0.94rem] font-medium text-[#1d052b]">
                  <CircleCheck className="size-4.5 shrink-0 text-[#c8963c]" strokeWidth={1.8} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Ingredients We Say No To */}
          <div
            className="lg:col-span-4 rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-gold-400/35 shadow-[0_10px_28px_rgba(32,8,45,0.28),0_2px_8px_rgba(32,8,45,0.12)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(32,8,45,0.38),0_4px_14px_rgba(193,136,62,0.22)] hover:border-gold-400/70"
            style={{ backgroundColor: "#20052b" }}
          >
            <div>
              <h2 className="font-heading text-[1.25rem] sm:text-[1.35rem] font-bold uppercase tracking-wider text-[#d4a038]">
                Ingredients We Say No To
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-3">
                {SAY_NO.flat().map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[0.78rem] sm:text-[0.82rem] font-medium text-cream-100/90 leading-tight">
                    <CircleX className="size-3.5 shrink-0 text-[#d4a038] mt-0.5" strokeWidth={1.8} />
                    <span className="break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between font-script text-[1.4rem] sm:text-[1.6rem] text-[#d4a038]">
              <span>Because your health matters.</span>
              <ScriptHeart className="h-6 w-9 text-[#d4a038]" />
            </p>
          </div>

          {/* Column 3: Safe, Clean & Conscious + Beauty With Integrity */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            <div>
              <h2 className="font-heading text-[1.4rem] sm:text-[1.55rem] font-bold uppercase tracking-wider text-[#1d052b]">
                Safe, Clean &amp; Conscious
              </h2>
              <p className="mt-1.5 text-[0.84rem] sm:text-[0.88rem] text-[#1d052b]/80 leading-relaxed font-sans">
                {"We follow global safety standards and\nkeep updating our formulations to ensure\nmaximum safety and performance."}
              </p>
              <ul className="mt-4 grid grid-cols-4 gap-2">
                {CERTIFICATIONS.map(({ label, Icon, text }) => (
                  <li key={label} className="flex flex-col items-center text-center">
                    <span className="grid size-11 sm:size-12 place-items-center rounded-full border border-[#1d052b]/25 bg-white/70 shadow-2xs">
                      {Icon ? (
                        <Icon className="size-5 text-[#1d052b]" strokeWidth={1.5} />
                      ) : (
                        <span className="font-sans text-[0.68rem] font-bold text-[#1d052b] tracking-wider">
                          {text}
                        </span>
                      )}
                    </span>
                    <span className="mt-2 whitespace-pre-line text-[0.62rem] sm:text-[0.66rem] font-bold uppercase leading-tight tracking-wider text-[#1d052b]">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Beauty With Integrity card */}
            <div className="relative overflow-hidden rounded-xl bg-[#f7e4ce] p-5 sm:p-6 border border-gold-300/60 shadow-[0_8px_24px_rgba(32,8,45,0.16),0_2px_8px_rgba(32,8,45,0.08)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_38px_rgba(32,8,45,0.22),0_6px_16px_rgba(193,136,62,0.2)] hover:border-gold-400/80 min-h-[125px] flex items-center">
              <Image
                src={PHOTOS.integrity}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-cover object-left opacity-90 pointer-events-none"
              />
              <div className="relative z-10 w-full pl-20 sm:pl-24 pr-8 sm:pr-10 text-center">
                <h3 className="font-heading text-[1.05rem] sm:text-[1.12rem] font-bold uppercase tracking-wider text-[#1d052b]">
                  Beauty With Integrity
                </h3>
                <p className="mt-1 text-[0.76rem] sm:text-[0.8rem] leading-snug text-[#1d052b]/85 font-sans">
                  {"Because what goes into our products\nshould never harm you.\nOnly love, care and clean ingredients."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closing band */}
      <section className={`relative mt-12 sm:mt-16 flex flex-col items-center gap-8 overflow-hidden px-6 py-10 text-center min-[1000px]:min-h-[14.31vw] min-[1000px]:flex-row min-[1000px]:gap-0 min-[1000px]:p-0 min-[1000px]:text-left ${PURPLE}`}>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[60%] bg-[length:auto_100%] bg-left bg-no-repeat min-[1000px]:block" style={{ backgroundImage: `url("${PHOTOS.band}")` }} />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[52%] bg-[length:auto_100%] bg-right bg-no-repeat [mask-image:linear-gradient(to_right,transparent,black_20%)] min-[1000px]:block" style={{ backgroundImage: `url("${PHOTOS.band}")` }} />

        <div className="relative text-center min-[1000px]:ml-[14.38vw] min-[1000px]:w-[22.95vw] min-[1000px]:shrink-0">
          <p className="font-script text-[2rem] leading-[1.15] text-cream-50 min-[1000px]:text-[2.69vw] min-[1000px]:leading-[3.06vw]">
            Your skin deserves
            <span className="block">the safest care.</span>
          </p>
          <p className="mt-2 text-[1.05rem] leading-[1.3] text-[#d9a53f] min-[1000px]:mt-[0.61vw] min-[1000px]:text-[1.64vw] min-[1000px]:leading-[1.91vw]">
            <span className="block min-[1000px]:-translate-x-[1.3vw]">And that&apos;s exactly what</span>
            <span className="block">we promise – every single time.</span>
          </p>
        </div>

        {/* "Our promise" seal: a metallic gold ring around a cream disc */}
        <div className="relative size-40 shrink-0 rounded-full bg-[conic-gradient(from_200deg,#f6dc95,#b98a32,#f3d68a,#a8772a,#f6dc95,#b98a32,#f6dc95)] p-2 shadow-[0_0.4rem_1rem_rgba(0,0,0,0.35)] min-[1000px]:mt-[0.38vw] min-[1000px]:ml-[3.9vw] min-[1000px]:size-[13.31vw] min-[1000px]:p-[0.84vw] min-[1000px]:shadow-[0_0.3vw_0.9vw_rgba(0,0,0,0.35)]">
          <div className="grid size-full place-items-center rounded-full bg-[#fbf6ee] text-center shadow-[inset_0_0_0_3px_#fbf6ee,inset_0_0_0_4px_#c8963c] min-[1000px]:shadow-[inset_0_0_0_0.25vw_#fbf6ee,inset_0_0_0_0.33vw_#c8963c]">
            <div>
              <p className="font-heading text-[0.8rem] font-bold uppercase leading-[1.35] text-[#b07c2c] min-[1000px]:text-[1.15vw] min-[1000px]:leading-[1.45vw]">
                Our
                <span className="block">Promise</span>
              </p>
              <p className="mt-0.5 flex justify-center gap-0.5 text-[#d4a038] min-[1000px]:mt-[0.3vw] min-[1000px]:gap-[0.38vw]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-3 fill-current min-[1000px]:size-[1.15vw]" strokeWidth={0} />
                ))}
              </p>
              <p className="mt-1 text-[0.6rem] font-medium uppercase leading-[1.5] text-[#4b3358] min-[1000px]:mt-[0.75vw] min-[1000px]:text-[0.97vw] min-[1000px]:leading-[1.26vw]">
                Safe Ingredients
                <span className="block">Better Results</span>
                Happier You
              </p>
              <Heart className="mx-auto mt-0.5 size-3.5 text-[#c8963c] min-[1000px]:mt-[0.3vw] min-[1000px]:size-[1.38vw]" strokeWidth={1.4} />
            </div>
          </div>
        </div>

        <div className="relative min-[1000px]:ml-[3.37vw]">
          <p className="text-[0.9rem] leading-[1.45] text-cream-50 min-[1000px]:whitespace-pre-line min-[1000px]:text-[1.2vw] min-[1000px]:leading-[1.72vw]">
            {"We don't just follow trends.\nWe follow truth, science and safety.\nVelastia – Luxury you can feel good about."}
          </p>
          <ul className="mt-4 grid grid-cols-4 min-[1000px]:mt-[0.92vw] min-[1000px]:-ml-[0.99vw] min-[1000px]:grid-cols-[repeat(4,5.81vw)]">
            {TRUST.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <span className="grid size-8 place-items-center rounded-full border border-[#b6814b] min-[1000px]:size-[2.45vw]">
                  <Icon className="size-4 text-[#d9a53f] min-[1000px]:size-[1.38vw]" strokeWidth={1.3} />
                </span>
                <span className="mt-1 whitespace-pre-line text-[0.62rem] leading-[1.3] text-cream-50 min-[1000px]:mt-[0.45vw] min-[1000px]:text-[0.98vw] min-[1000px]:leading-[1.07vw]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. As Seen In press strip with authentic brand vector logos */}
      <section className="bg-cream-50 py-8 sm:py-10 border-t border-b border-[#e6d6c3]/60">
        <div className="mx-auto max-w-[1400px] px-6 flex flex-wrap items-center justify-center gap-7 sm:gap-9 lg:gap-12">
          <span className="font-heading text-[0.82rem] sm:text-[0.88rem] font-bold uppercase tracking-[0.2em] text-[#1d052b]/70">
            As Seen In
          </span>
          <VogueLogo className="h-6 sm:h-7 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <ElleLogo className="h-6 sm:h-7 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <FeminaLogo className="h-5 sm:h-6 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <NykaaLogo className="h-6 sm:h-7 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <PinkvillaLogo className="h-5 sm:h-6 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <IndiaTodayLogo className="h-7 sm:h-8 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
          <TimesOfIndiaLogo className="h-7 sm:h-8 w-auto text-[#1d052b] opacity-85 hover:opacity-100 transition-opacity" />
        </div>
      </section>
    </div>
  );
}
