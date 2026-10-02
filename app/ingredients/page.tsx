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

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("ingredients");
}

/*
 * Desktop (xl) sizes on this page are the design's own proportions — its px
 * ÷ 10.24, the design being a 1024px-wide page mockup — and its colours are
 * sampled from it. Tablets and phones get fixed sizes of their own.
 */

const INK = "text-[#1d052b]";
const GOLD = "text-[#c8963c]";
const PURPLE = "bg-[#29082c]";

/**
 * Photos the design calls for. Each shows once its file is in /public; until
 * then a soft placeholder holds its place, so dropping the file in is all it
 * takes.
 */
const PHOTOS = {
  hero: "/images/hero section banner ingrediants.png",
  integrity: "/images/beauty with integrity.png",
  band: "/images/Your skin deservesthe safest care. image.png",
};

function Photo({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  const present = existsSync(path.join(process.cwd(), "public", src));
  return present ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-[#f6e9dc] to-[#efdccb]" aria-hidden="true" />
  );
}

const FREE_FROM = [
  { Icon: FlaskConicalOff, label: "No Toxic\nChemicals" },
  { Icon: Beaker, label: "No Parabens\nNo Sulphates" },
  { Icon: TestTubes, label: "No Phthalates\nNo Mineral Oils" },
  { Icon: Biohazard, label: "No Heavy Metals\nNo Formaldehyde" },
  { Icon: Microscope, label: "No Carcinogenic\nIngredients" },
  { Icon: HeartPulse, label: "100% Safe For\nEveryday Use" },
];
/** The six columns as spaced in the design (desktop). */
const FREE_FROM_COLUMNS = "xl:grid-cols-[7.42vw_7.91vw_8.45vw_8.59vw_8.3vw_7.96vw]";

const PROMISES = [
  { Icon: Droplets, label: "Dermatologically\nTested" },
  { Icon: FlaskConical, label: "Clinically\nProven" },
  { Icon: ShieldCheck, label: "Non-Irritating\nFormulas" },
  { Icon: Users, label: "Suitable For All\nSkin Types" },
  { Icon: Baby, label: "Pregnancy Safe\nFormulas" },
];
const PROMISE_COLUMNS = "xl:grid-cols-[11.23vw_10.35vw_10.55vw_11.38vw_11.96vw]";

/** Ingredient cards. `image` shows once its file is in /public. Line breaks are the design's own. */
const POWER = [
  { name: "Vitamin E", image: "/ingredients/vitamin-e.png", note: "A powerful antioxidant\nthat protects skin from\ndamage and nourishes\ndeeply.", benefit: "Benefit: Protects &\nnourishes skin" },
  { name: "Niacinamide", image: "/ingredients/niacinamide.png", note: "Helps improve skin texture,\nreduces blemishes and\nenhances natural glow.", benefit: "Benefit: Brightens &\nstrengthens skin" },
  { name: "Hyaluronic Acid", image: "/ingredients/hyaluronic.png", note: "Deeply hydrates and locks\nin moisture for plump,\nsupple skin.", benefit: "Benefit: Hydrates &\nplumps" },
  { name: "Jojoba Oil", image: "/ingredients/jojoba.png", note: "Mimics skin's natural oils,\nrestores balance and\nprevents dryness.", benefit: "Benefit: Moisturizes &\nbalances" },
  { name: "Shea Butter", image: "/ingredients/shea.png", note: "Rich in vitamins, it soothes,\nsoftens and improves\nskin elasticity.", benefit: "Benefit: Soothes &\nrepairs" },
  { name: "Aloe Vera Extract", image: "/ingredients/aloe-vera.png", note: "Calms irritation, reduces\nredness and hydrates\nsensitive skin.", benefit: "Benefit: Soothes &\ncalms" },
  { name: "Green Tea Extract", image: "/ingredients/green-tea.png", note: "Packed with antioxidants\nthat protect skin from\nenvironmental stress.", benefit: "Benefit: Protects &\nrevitalizes" },
  { name: "Licorice Extract", image: "/ingredients/licorice.png", note: "Helps reduce dark spots\nand evens out\nskin tone.", benefit: "Benefit: Brightens &\nevens tone" },
  { name: "Centella Asiatica", image: "/ingredients/centella.png", note: "Known for its healing\nproperties. Repairs and\nstrengthens skin barrier.", benefit: "Benefit: Heals &\nstrengthens" },
  { name: "Peptide Complex", image: "/ingredients/peptide.png", note: "Supports collagen\nproduction and improves\nskin firmness.", benefit: "Benefit: Firms &\nrejuvenates" },
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
  { label: "Cruelty Free\n& Vegan", Icon: Heart },
];

const TRUST = [
  { Icon: Sprout, label: "Clean\nIngredients" },
  { Icon: Leaf, label: "Honest\nFormulas" },
  { Icon: ChartNoAxesColumnIncreasing, label: "Real\nResults" },
  { Icon: HeartHandshake, label: "Trusted by\nThousands" },
];

export default function IngredientsPage() {
  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative flex flex-col xl:h-[32.13vw] xl:flex-row">
        <div className="relative z-10 px-6 py-10 xl:w-[49.3vw] xl:p-0 xl:pt-[2.15vw] xl:pl-[5.57vw]">
          <h1 className={`font-display text-[2rem] font-medium uppercase leading-[1.15] tracking-[0.01em] xl:text-[2.95vw] xl:leading-[3.52vw] ${INK}`}>
            {/* The design sets the first line a touch larger than the second. */}
            <span className="block xl:text-[3.03vw]">Beauty You Can See.</span>
            <span className="block xl:text-[2.85vw]">
              Ingredients You Can <span className={GOLD}>Trust.</span>
            </span>
          </h1>
          <p className={`mt-2 flex items-end gap-1 font-script text-[1.7rem] leading-[1.3] xl:mt-[1.03vw] xl:text-[2.345vw] ${GOLD}`}>
            Safe today. Safe tomorrow. Safe always.
            <ScriptHeart className="mb-1 h-9 w-12 xl:h-[3.1vw] xl:w-[4.1vw]" />
          </p>
          <p className={`xl:whitespace-pre-line mt-3 text-[1rem] leading-[1.45] xl:mt-[1.32vw] xl:text-[1.368vw] xl:leading-[1.953vw] ${INK}`}>
            {"At Velastia, we believe true beauty comes from\ningredients that are safe, effective and kind – to\nyour skin and to your health."}
          </p>
          <ul className={`mt-6 grid grid-cols-3 gap-y-5 sm:grid-cols-6 xl:mt-[1.95vw] xl:-ml-[1.37vw] xl:gap-y-0 ${FREE_FROM_COLUMNS}`}>
            {FREE_FROM.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <span className="grid size-12 place-items-center rounded-full border border-[#c8963c] xl:size-[3.9vw]">
                  <Icon className="size-6 text-[#4b1f5e] xl:size-[1.95vw]" strokeWidth={1.3} />
                </span>
                <span className={`mt-1.5 whitespace-pre-line text-[0.65rem] font-medium uppercase leading-[1.4] xl:mt-[0.44vw] xl:text-[0.8vw] xl:leading-[1.465vw] ${INK}`}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Full-width banner behind the hero (its left side is plain cream for
            the text), with the "Transparency is our promise" seal over it.
            Below xl it sits under the text, cropped to the products. */}
        <div className="relative h-[60vw] xl:absolute xl:inset-0 xl:h-auto">
          <Photo src={PHOTOS.hero} alt="Velastia serum, cream and lipstick beside laboratory glassware and a pink flower" sizes="100vw" className="object-[78%_center] xl:object-center" />
          <div className="absolute top-[6%] left-[4%] grid size-28 sm:size-32 xl:left-auto place-items-center rounded-full border-[3px] border-double border-[#c8963c] bg-cream-50/85 text-center xl:top-[6.54vw] xl:right-[3.8vw] xl:size-[11.5vw]">
            <p className={`font-display text-[0.7rem] font-medium uppercase leading-[1.35] sm:text-[0.8rem] xl:text-[1.142vw] ${INK}`}>
              Transparency
              <span className="block text-[0.85em]">Is Our</span>
              Promise
              <Heart className={`mx-auto mt-1 size-4 xl:size-[1.4vw] ${GOLD}`} strokeWidth={1.3} />
            </p>
          </div>
        </div>
      </section>

      {/* We promise no compromises */}
      <section className="px-4 xl:px-0 xl:pr-[3.52vw] xl:pl-[3.71vw]">
        <div className={`flex flex-col gap-8 rounded-md px-6 py-8 xl:h-[10.84vw] xl:flex-row xl:gap-0 xl:p-0 ${PURPLE}`}>
          <div className="relative xl:w-[32.62vw] xl:shrink-0 xl:pt-[1.46vw] xl:pl-[2.64vw] xl:before:absolute xl:before:right-0 xl:before:top-1/2 xl:before:h-[6.45vw] xl:before:w-px xl:before:-translate-y-1/2 xl:before:bg-white/15">
            <h2 className={`font-display text-[1.4rem] font-semibold uppercase leading-[1.25] xl:text-[1.721vw] ${GOLD}`}>
              We Promise No Compromises.
            </h2>
            <p className="mt-2 text-[0.95rem] font-semibold leading-[1.35] text-cream-50 xl:mt-[0.71vw] xl:text-[1.122vw]">
              We never use anything that can harm you.
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-[1.55] text-cream-50/85 xl:whitespace-pre-line xl:mt-[0.59vw] xl:text-[0.985vw] xl:leading-[1.563vw]">
              {"Every ingredient we use is carefully researched, scientifically tested\nand globally approved. Because your safety is non-negotiable."}
            </p>
          </div>
          <ul className={`grid grid-cols-2 gap-y-6 sm:grid-cols-5 xl:gap-y-0 ${PROMISE_COLUMNS}`}>
            {PROMISES.map(({ Icon, label }, i) => (
              <li
                key={label}
                className={`relative flex flex-col items-center text-center xl:pt-[2.34vw] ${
                  i > 0 ? "xl:before:absolute xl:before:left-0 xl:before:top-1/2 xl:before:h-[6.45vw] xl:before:w-px xl:before:-translate-y-1/2 xl:before:bg-white/15" : ""
                }`}
              >
                <Icon className={`size-8 xl:size-[3.32vw] ${GOLD}`} strokeWidth={1.1} />
                <span className="mt-2 whitespace-pre-line text-[0.72rem] font-medium uppercase leading-[1.45] text-cream-50 xl:mt-[0.83vw] xl:text-[0.921vw] xl:leading-[1.465vw]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The power behind our products */}
      <section className="mt-10 px-4 text-center xl:mt-[1.39vw] xl:px-0 xl:pr-[4.1vw] xl:pl-[4.3vw]">
        <h2 className={`font-display text-[1.5rem] font-semibold uppercase leading-[1.25] tracking-[0.01em] xl:text-[1.833vw] ${INK}`}>
          The Power Behind Our Products
        </h2>
        <p className={`mt-0.5 text-[0.95rem] xl:mt-[0.27vw] xl:text-[1.297vw] ${INK}`}>Carefully Chosen. Purposefully Used.</p>
        <Ornament bare className="mt-1 justify-center xl:mt-[0.25vw]" markClassName="h-2.5 w-5 xl:h-[0.98vw] xl:w-[1.95vw]" />

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:mt-[0.1vw] xl:grid-cols-5 xl:gap-x-[0.88vw] xl:gap-y-[0.98vw]">
          {POWER.map((p) => (
            <li
              key={p.name}
              className="flex flex-col items-center rounded-[4px] border border-[#f2e8de] bg-[#fdf6ef] px-2 pt-2 pb-3 xl:min-h-[22.1vw] xl:px-[0.5vw] xl:pt-[0.59vw] xl:pb-[0.83vw]"
            >
              <div className="relative h-24 w-full xl:h-[9.28vw]">
                <Photo src={p.image} alt={p.name} sizes="(min-width: 1280px) 15vw, 45vw" className="object-contain" />
              </div>
              <h3 className={`mt-2 font-display text-[1rem] font-semibold uppercase leading-[1.25] xl:mt-[0.54vw] xl:text-[1.316vw] ${INK}`}>
                {p.name}
              </h3>
              <p className={`xl:whitespace-pre-line mt-1 text-[0.8rem] leading-[1.35] xl:mt-[0.39vw] xl:text-[1.151vw] xl:leading-[1.465vw] text-[#1d052b]/80`}>
                {p.note}
              </p>
              <p className="mt-auto whitespace-pre-line pt-3 text-[0.78rem] font-semibold leading-[1.35] text-[#a8762c] xl:pt-[0.6vw] xl:text-[1.076vw] xl:leading-[1.465vw]">
                {p.benefit}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Real life · Say no to · Safe, clean & conscious */}
      <section className="mt-10 grid gap-10 px-6 xl:mt-[1.37vw] xl:grid-cols-[23.44vw_31.35vw_31.74vw] xl:gap-x-[2.54vw] xl:gap-y-0 xl:px-0 xl:pl-[5.66vw]">
        <div className="xl:pt-[0.54vw]">
          <h2 className={`font-display text-[1.6rem] font-semibold uppercase leading-[1.25] tracking-[0.01em] xl:text-[1.94vw] xl:leading-[2.44vw] ${INK}`}>
            Made For Real Life.
            {/* The heart trails the second line, as drawn. */}
            <span className="relative block w-fit">
              Made For You.
              <ScriptHeart className={`absolute bottom-0 left-full ml-1 h-9 w-12 xl:bottom-[0.2vw] xl:h-[3vw] xl:w-[4vw] ${GOLD}`} />
            </span>
          </h2>
          <p className={`xl:whitespace-pre-line mt-2 text-[0.9rem] leading-[1.35] xl:mt-[0.78vw] xl:text-[1.161vw] xl:leading-[1.465vw] text-[#1d052b]/85`}>
            {"Our products are designed for everyday use –\nbecause we use only clean, safe and effective\ningredients that your skin loves."}
          </p>
          <ul className="mt-2 xl:mt-[0.68vw]">
            {REAL_LIFE.map((item) => (
              <li key={item} className={`flex items-center gap-2 text-[0.9rem] leading-[1.6] xl:gap-[0.88vw] xl:text-[1.179vw] xl:leading-[1.855vw] ${INK}`}>
                <CircleCheck className={`size-4 shrink-0 xl:size-[1.27vw] ${GOLD}`} strokeWidth={1.4} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-[10px] px-5 py-5 xl:h-[22.85vw] xl:px-[2.25vw] xl:pt-[1.04vw] xl:pb-0 ${PURPLE}`}>
          <h2 className={`font-display text-[1.2rem] font-semibold uppercase leading-[1.25] tracking-[0.01em] xl:text-[1.467vw] ${GOLD}`}>
            Ingredients We Say No To
          </h2>
          <ul className="mt-3 grid grid-cols-2 xl:mt-[0.68vw] xl:grid-cols-[13.87vw_1fr]">
            {SAY_NO.flat().map((item) => (
              <li key={item} className="flex items-center gap-2 text-[0.8rem] leading-[1.9] text-cream-50 xl:gap-[0.59vw] xl:text-[1.007vw] xl:leading-[2.27vw]">
                <CircleX className={`size-3.5 shrink-0 xl:size-[1.37vw] ${GOLD}`} strokeWidth={1.3} />
                {/* The longest item is set a touch smaller so it stays on one line. */}
                {item === "Animal-Derived Ingredients" ? (
                  <span className="xl:whitespace-nowrap xl:text-[0.93vw]">{item}</span>
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>
          <p className={`mt-3 flex items-end gap-1 font-script text-[1.4rem] leading-[1.2] xl:mt-[1.58vw] xl:text-[1.987vw] ${GOLD}`}>
            Because your health matters.
            <ScriptHeart className="h-7 w-9 xl:h-[2.4vw] xl:w-[3.2vw]" />
          </p>
        </div>

        <div>
          <h2 className={`font-display text-[1.5rem] font-semibold uppercase leading-[1.25] tracking-[0.01em] xl:text-[1.802vw] ${INK}`}>
            Safe, Clean &amp; Conscious
          </h2>
          <p className={`xl:whitespace-pre-line mt-1 text-[0.85rem] leading-[1.4] xl:mt-[0.3vw] xl:text-[1.1vw] xl:leading-[1.416vw] text-[#1d052b]/85`}>
            {"We follow global safety standards and\nkeep updating our formulations to ensure\nmaximum safety and performance."}
          </p>
          <ul className="mt-3 grid grid-cols-4 xl:mt-[0.54vw] xl:-ml-[0.2vw] xl:grid-cols-[repeat(4,7.81vw)]">
            {CERTIFICATIONS.map(({ label, Icon, text }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <span className="grid size-10 place-items-center rounded-full border border-[#1d052b]/60 xl:size-[3.32vw]">
                  {Icon ? (
                    <Icon className={`size-5 xl:size-[1.66vw] ${INK}`} strokeWidth={1.3} />
                  ) : (
                    <span className={`rounded-[2px] border border-[#1d052b] px-0.5 font-sans text-[0.6rem] font-bold leading-tight xl:text-[0.8vw] ${INK}`}>
                      {text}
                    </span>
                  )}
                </span>
                <span className={`mt-1 whitespace-pre-line text-[0.6rem] font-medium uppercase leading-[1.35] xl:mt-[0.24vw] xl:text-[0.78vw] xl:leading-[1.07vw] ${INK}`}>
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {/* The photograph (gerbera on the left, gold heart on the right) is
              the card's whole background; the text sits in its plain middle. */}
          <div className="relative mt-4 flex min-h-28 overflow-hidden rounded-md bg-[#f4e2cb] xl:mt-[0.83vw] xl:-ml-[0.88vw] xl:h-[8.3vw] xl:min-h-0">
            <Photo src={PHOTOS.integrity} alt="" sizes="(min-width: 1280px) 33vw, 100vw" className="object-[70%_center] xl:object-left" />
            <div className="relative py-3 pr-[28%] pl-24 xl:py-0 xl:pt-[1.1vw] xl:pr-0 xl:pl-[9.37vw]">
              <h3 className={`font-display text-[0.95rem] font-semibold uppercase leading-[1.25] tracking-[0.01em] xl:text-[1.209vw] ${INK}`}>
                Beauty With Integrity
              </h3>
              <p className={`xl:whitespace-pre-line mt-1 text-[0.75rem] leading-[1.4] xl:mt-[0.3vw] xl:text-[1vw] xl:leading-[1.465vw] text-[#1d052b]/85`}>
                {"Because what goes into our products\nshould never harm you.\nOnly love, care and clean ingredients."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing band. The background photograph is fitted to the band's
          height twice, once from each end, so the flowers sit at both edges
          however wide the screen; the right copy fades in over the plain
          purple middle so no seam shows. Below xl it is plain purple. */}
      <section className={`relative mt-10 flex flex-col items-center gap-8 overflow-hidden px-6 py-10 text-center xl:mt-[0.98vw] xl:h-[14.31vw] xl:flex-row xl:gap-0 xl:p-0 xl:text-left ${PURPLE}`}>
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[60%] bg-[length:auto_100%] bg-left bg-no-repeat xl:block" style={{ backgroundImage: `url("${PHOTOS.band}")` }} />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[52%] bg-[length:auto_100%] bg-right bg-no-repeat [mask-image:linear-gradient(to_right,transparent,black_20%)] xl:block" style={{ backgroundImage: `url("${PHOTOS.band}")` }} />

        <div className="relative text-center xl:ml-[14.38vw] xl:w-[22.95vw] xl:shrink-0">
          <p className="font-script text-[2rem] leading-[1.15] text-cream-50 xl:text-[2.69vw] xl:leading-[3.06vw]">
            Your skin deserves
            <span className="block">the safest care.</span>
          </p>
          <p className="mt-2 text-[1.05rem] leading-[1.3] text-[#d9a53f] xl:mt-[0.61vw] xl:text-[1.64vw] xl:leading-[1.91vw]">
            <span className="block xl:-translate-x-[1.3vw]">And that&apos;s exactly what</span>
            <span className="block">we promise – every single time.</span>
          </p>
        </div>

        {/* "Our promise" seal: a metallic gold ring around a cream disc */}
        <div className="relative size-40 shrink-0 rounded-full bg-[conic-gradient(from_200deg,#f6dc95,#b98a32,#f3d68a,#a8772a,#f6dc95,#b98a32,#f6dc95)] p-2 shadow-[0_0.4rem_1rem_rgba(0,0,0,0.35)] xl:mt-[0.38vw] xl:ml-[3.9vw] xl:size-[13.31vw] xl:p-[0.84vw] xl:shadow-[0_0.3vw_0.9vw_rgba(0,0,0,0.35)]">
          <div className="grid size-full place-items-center rounded-full bg-[#fbf6ee] text-center shadow-[inset_0_0_0_3px_#fbf6ee,inset_0_0_0_4px_#c8963c] xl:shadow-[inset_0_0_0_0.25vw_#fbf6ee,inset_0_0_0_0.33vw_#c8963c]">
            <div>
              <p className="font-display text-[0.8rem] font-semibold uppercase leading-[1.35] text-[#b07c2c] xl:text-[1.15vw] xl:leading-[1.45vw]">
                Our
                <span className="block">Promise</span>
              </p>
              <p className="mt-0.5 flex justify-center gap-0.5 text-[#d4a038] xl:mt-[0.3vw] xl:gap-[0.38vw]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-3 fill-current xl:size-[1.15vw]" strokeWidth={0} />
                ))}
              </p>
              <p className="mt-1 text-[0.6rem] font-medium uppercase leading-[1.5] text-[#4b3358] xl:mt-[0.75vw] xl:text-[0.97vw] xl:leading-[1.26vw]">
                Safe Ingredients
                <span className="block">Better Results</span>
                Happier You
              </p>
              <Heart className="mx-auto mt-0.5 size-3.5 text-[#c8963c] xl:mt-[0.3vw] xl:size-[1.38vw]" strokeWidth={1.4} />
            </div>
          </div>
        </div>

        <div className="relative xl:ml-[3.37vw]">
          <p className="text-[0.9rem] leading-[1.45] text-cream-50 xl:whitespace-pre-line xl:text-[1.2vw] xl:leading-[1.72vw]">
            {"We don't just follow trends.\nWe follow truth, science and safety.\nVelastia – Luxury you can feel good about."}
          </p>
          <ul className="mt-4 grid grid-cols-4 xl:mt-[0.92vw] xl:-ml-[0.99vw] xl:grid-cols-[repeat(4,5.81vw)]">
            {TRUST.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <span className="grid size-8 place-items-center rounded-full border border-[#b6814b] xl:size-[2.45vw]">
                  <Icon className="size-4 text-[#d9a53f] xl:size-[1.38vw]" strokeWidth={1.3} />
                </span>
                <span className="mt-1 whitespace-pre-line text-[0.62rem] leading-[1.3] text-cream-50 xl:mt-[0.45vw] xl:text-[0.98vw] xl:leading-[1.07vw]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
