import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import {
  Leaf,
  Heart,
  FlaskConical,
  Droplets,
  ScanFace,
  Flower,
  Flower2,
  Gem,
  ShieldCheck,
  Users,
  Star,
  Award,
  FlaskRound,
  Atom,
  Droplet,
  HeartCrack,
} from "lucide-react";
import { getRatingSummary, getSettings } from "@/lib/api/server";
import { Ornament } from "@/components/ui/Ornament";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about");
}

const PILLARS = [
  { label: "Crafted with", value: "Premium Ingredients", Icon: Droplets },
  { label: "Driven by", value: "Science & Innovation", Icon: FlaskConical },
  { label: "Designed for", value: "Indian Skin & Climate", Icon: ScanFace },
  { label: "Inspired by", value: "You", Icon: Flower2 },
];

/** Line breaks (\n) are the design's own, so each column wraps exactly as drawn. */
const WAY = [
  { Icon: Leaf, title: "Clean & Safe", note: "We use ingredients\nyou can trust." },
  { Icon: Heart, title: "Cruelty Free\n& Vegan", note: "Beauty that's kind\nto all beings." },
  { Icon: FlaskConical, title: "Science Backed", note: "Every formula is\ncarefully tested and\nproven." },
  { Icon: Flower, title: "Made in India", note: "Proudly formulated\nand manufactured\nin India." },
  { Icon: Gem, title: "Luxurious\nExperience", note: "Premium textures,\nelegant packaging,\nexceptional results." },
  { Icon: ShieldCheck, title: "Safe & Effective", note: "Dermatologically tested\nfor all skin types,\nincluding sensitive skin." },
];

const SCIENCE = [
  { name: "Vitamin E", note: "Nourishes & protects\nyour skin", image: "/ingredients/vitamin-e.png" },
  { name: "Hyaluronic Complex", note: "Locks in moisture\nfor plump, smooth lips", image: "/ingredients/hyaluronic.png" },
  { name: "Jojoba Oil", note: "Deeply hydrates &\nprevents dryness", image: "/ingredients/jojoba.png" },
  { name: "Shea Butter", note: "Softens, soothes &\nrestores comfort", image: "/ingredients/shea.png" },
  { name: "Peptide Blend", note: "Strengthens & improves\nskin texture", image: "/ingredients/peptide.png" },
];

const FREE_FROM = [
  { label: "Paraben\nFree", Icon: FlaskRound },
  { label: "Sulphate\nFree", Icon: FlaskConical },
  { label: "Phthalate\nFree", Icon: Atom },
  { label: "Mineral Oil\nFree", Icon: Droplet },
  { label: "Toxin\nFree", Icon: HeartCrack },
];

/**
 * Where each stat sits in the design's band: the columns between its five
 * dividers, and how far in each one's icon starts (desktop, in vw).
 */
const STAT_COLUMNS = "xl:grid-cols-[24.99vw_19.58vw_19.42vw_16.99vw_19.03vw]";
const STAT_INSET = ["xl:pl-[6.63vw]", "xl:pl-[3.18vw]", "xl:pl-[2.82vw]", "xl:pl-[2.1vw]", "xl:pl-[2.04vw]"];
/** Icon-to-number gap per stat: the design's icons differ in width, so do its gaps. */
const STAT_GAP = ["xl:gap-[1.4vw]", "xl:gap-[1.4vw]", "xl:gap-[1.15vw]", "xl:gap-[0.5vw]", "xl:gap-[0.3vw]"];

export default async function AboutPage() {
  const [{ copy }, rating] = await Promise.all([getSettings(), getRatingSummary()]);
  const stats = [
    { Icon: Award, value: "50+", label: "Premium Ingredients" },
    { Icon: FlaskConical, value: "100%", label: "Safe & Effective" },
    // Editable in the admin: Settings → Site Copy.
    { Icon: Users, value: copy.happyCustomers, label: "Happy Customers" },
    // The real average of published reviews, shown once there are some.
    ...(rating.total > 0
      ? [{ Icon: Star, value: `${rating.average.toFixed(1)}/5`, label: "Average Rating" }]
      : []),
    { Icon: Heart, value: "0%", label: "Compromise" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100">
        <div className="absolute inset-y-0 right-0 hidden w-[56%] lg:block">
          <Image
            src="/brand/about-hero.png"
            alt="Velastia lipstick, serum and cream beside a model"
            fill
            priority
            sizes="56vw"
            className="object-cover object-left"
          />
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cream-100 to-transparent" />
        </div>

        <div className="container-vel relative grid min-h-[380px] items-center py-14 lg:grid-cols-2">
          <div className="max-w-md">
            <p className="label-caps text-gold-700">About</p>
            <h1 className="mt-1 font-display text-[3.2rem] leading-none tracking-[0.03em] text-plum-800">
              VELASTIA
            </h1>
            <p className="mt-3 font-display text-[1.4rem] text-gold-600">
              Luxury That Loves You Back.
            </p>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
              Velastia is more than a beauty brand. It&apos;s a promise of luxury,
              backed by science, crafted for the modern Indian woman.
            </p>
            <p className="mt-5 font-script text-2xl text-plum-700">
              Because you deserve the best.
            </p>
          </div>

          <div className="relative mt-10 aspect-16/10 overflow-hidden rounded-[var(--radius-card)] lg:hidden">
            <Image
              src="/brand/about-hero.png"
              alt="Velastia lipstick, serum and cream beside a model"
              fill
              sizes="92vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our story. On desktop (xl) every size, gap and margin is the design's
          own proportion of the screen width — its px ÷ 19.12, the design being
          a 1912px-wide capture — so it matches the design at any desktop width.
          Tablets and phones get fixed sizes of their own. */}
      <section className="grid gap-10 px-6 pt-7 xl:grid-cols-[37.5vw_48.27vw] xl:gap-0 xl:pt-[1.464vw] xl:pr-[7.43vw] xl:pl-[6.8vw]">
        <div className="max-w-[520px] xl:max-w-[27.2vw] xl:pt-[0.575vw]">
          <p className="font-display text-[1.35rem] font-bold uppercase tracking-[0.03em] text-gold-600 xl:text-[1.37vw]">
            Our Story
          </p>
          <h2 className="mt-1 font-display text-[2.55rem] font-semibold leading-[1.1] text-ink xl:mt-[0.262vw] xl:text-[2.8vw]">
            Born From A Belief.
            <span className="block">Made For You.</span>
          </h2>
          <Ornament className="mt-3.5 w-full max-w-[388px] xl:mt-[0.732vw] xl:max-w-[20.29vw]" />
          <p className="mt-6 text-[1.15rem] leading-[1.45] text-ink xl:mt-[1.307vw] xl:text-[1.151vw] xl:leading-[1.621vw]">
            Velastia was born from a simple belief – that beauty is not just about
            appearance, but about confidence, self-expression and self-love.
          </p>
          <p className="mt-3 text-[1.15rem] leading-[1.45] text-ink xl:mt-[0.68vw] xl:text-[1.151vw] xl:leading-[1.621vw]">
            We combine the best of science and nature to create high-performance
            products that are safe, effective and luxuriously indulgent.
          </p>
          <p className="mt-3 font-display text-[1.7rem] font-semibold leading-[1.2] text-gold-600 xl:mt-[0.68vw] xl:text-[1.76vw] xl:leading-[2.1vw]">
            Luxury. Science. You.
          </p>
        </div>

        <div className="grid w-full max-w-[923px] overflow-hidden rounded-[10px] sm:grid-cols-[448fr_475fr] xl:h-[24.27vw] xl:max-w-none xl:self-start">
          <ul className="flex flex-col justify-center gap-5 bg-[#371938] px-8 py-10 xl:justify-start xl:gap-[1.15vw] xl:px-[2.93vw] xl:pt-[2.46vw] xl:pb-0">
            {PILLARS.map(({ label, value, Icon }) => (
              <li key={value} className="flex items-center gap-5 xl:gap-[1.2vw]">
                <span className="grid size-16 shrink-0 place-items-center rounded-full border-[1.5px] border-gold-400 xl:size-[4.08vw]">
                  <Icon className="size-8 text-gold-400 xl:size-[2.09vw]" strokeWidth={1.25} />
                </span>
                <span>
                  <span className="block text-[1.15rem] leading-[1.3] text-cream-50 xl:text-[1.124vw]">{label}</span>
                  <span className="mt-0.5 block font-display text-[1.4rem] font-bold leading-[1.3] text-gold-400 xl:mt-[0.15vw] xl:text-[1.365vw]">
                    {value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="relative min-h-[260px] xl:min-h-0">
            <Image
              src="/brand/about-lab.png"
              alt="Laboratory glassware with a flower and a pipette"
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 92vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* The Velastia way — desktop proportions from the design, as above. The
          title sits a little left of centre there, hence the unequal rules, and
          the six columns are the design's own (slightly uneven) widths. */}
      <section className="pt-6 pb-2 xl:pt-[1.255vw] xl:pb-[0.366vw]">
        <div className="flex items-center gap-6 px-6 xl:gap-[1.255vw] xl:px-[3.24vw]">
          <span className="h-px flex-1 bg-gold-300/70 xl:flex-[723]" />
          <h2 className="shrink-0 font-display text-[1.3rem] font-bold uppercase tracking-[0.02em] text-ink xl:text-[1.229vw]">
            The Velastia Way
          </h2>
          <span className="h-px flex-1 bg-gold-300/70 xl:flex-[795]" />
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-y-10 px-6 sm:grid-cols-3 xl:mt-[1.203vw] xl:grid-cols-[13.96vw_14.04vw_14.02vw_14.28vw_15.09vw_15.53vw] xl:pl-[5.83vw]">
          {WAY.map(({ Icon, title, note }) => (
            <li key={title} className="text-center">
              <Icon className="mx-auto size-14 text-gold-700 xl:size-[3.766vw]" strokeWidth={1} />
              <h3 className="mt-4 whitespace-pre-line font-display text-[1.15rem] font-bold uppercase leading-[1.24] tracking-[0.02em] text-ink xl:mt-[0.994vw] xl:text-[1.098vw]">
                {title}
              </h3>
              <p className="mt-2.5 whitespace-pre-line text-[1rem] leading-[1.35] text-ink/80 xl:mt-[0.575vw] xl:text-[1.02vw] xl:leading-[1.334vw]">
                {note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Science behind, stats and promise. Desktop (xl) sizes are the design's
          own proportions — its px ÷ 18.13, the design being a 1813px-wide
          capture — and its colours are sampled from it. Tablets and phones get
          fixed sizes of their own. */}
      <section className="grid xl:grid-cols-[33.48vw_minmax(0,1fr)]">
        {/* The thin gold rule along its foot divides it from the stats band, as drawn. */}
        <div className="border-b border-gold-400/60 bg-[#2e0829] px-6 py-10 xl:px-0 xl:pt-[1.68vw] xl:pb-0 xl:pl-[4.52vw]">
          <h2 className="font-display text-[1.8rem] font-medium uppercase leading-[1.25] tracking-[0.02em] text-cream-50 xl:text-[1.98vw] xl:leading-[2.482vw]">
            The Science Behind
            <span className="block">Our Beauty</span>
          </h2>
          <Ornament
            className="mt-3 w-[200px] xl:mt-[0.58vw] xl:w-[11.03vw]"
            markClassName="h-3 w-6 xl:h-[0.66vw] xl:w-[1.32vw]"
          />
          <p className="mt-5 whitespace-pre-line text-[1.05rem] leading-[1.45] text-[#f0d9e8] xl:mt-[1.1vw] xl:text-[1.219vw] xl:leading-[1.737vw]">
            {"At Velastia, we believe in transparency.\nThat's why we carefully select every ingredient\nfor its performance and purity."}
          </p>
          <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-[1.45] text-[#f0d9e8] xl:mt-[0.58vw] xl:text-[1.219vw] xl:leading-[1.737vw]">
            {"Our products are crafted in state-of-the-art\nfacilities with global quality standards."}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 bg-[#fdf6ec] p-6 sm:grid-cols-3 xl:grid-cols-5 xl:gap-[1.24vw] xl:pt-[1.71vw] xl:pr-[3.2vw] xl:pb-[1.49vw] xl:pl-[2.37vw]">
          {SCIENCE.map((s) => (
            <li
              key={s.name}
              className="overflow-hidden rounded-lg border border-[#f1e7dd] bg-[#fef4ea] pb-3 text-center xl:pb-[0.4vw]"
            >
              <div className="relative h-36 xl:h-[9.71vw]">
                <Image src={s.image} alt={s.name} fill sizes="(min-width: 1280px) 11vw, 45vw" className="object-cover" />
              </div>
              <h3 className="mt-4 font-sans text-[0.85rem] font-semibold uppercase tracking-[0.02em] text-ink xl:mt-[1.21vw] xl:text-[0.855vw]">
                {s.name}
              </h3>
              <p className="mt-2 whitespace-pre-line text-[0.9rem] leading-[1.4] text-ink/90 xl:mt-[0.72vw] xl:text-[0.96vw] xl:leading-[1.379vw]">
                {s.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats — with all five, each sits where the design puts it between the
          dividers; without a rating yet, four share the band evenly. */}
      <section className="bg-[#2c0a27]">
        <ul
          className={`grid grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-3 xl:items-center xl:gap-0 xl:px-0 xl:py-0 xl:h-[9.05vw] ${
            stats.length === 5 ? STAT_COLUMNS : "xl:grid-cols-4"
          }`}
        >
          {stats.map(({ Icon, value, label }, i) => (
            <li
              key={label}
              className={`relative flex items-center gap-4 ${stats.length === 5 ? STAT_GAP[i] : "xl:gap-[1.4vw]"} ${
                stats.length === 5 ? STAT_INSET[i] : "xl:justify-center"
              } ${i > 0 ? "xl:before:absolute xl:before:left-0 xl:before:top-1/2 xl:before:h-[4.8vw] xl:before:w-px xl:before:-translate-y-1/2 xl:before:bg-[#502b3e]" : ""}`}
            >
              <Icon className="size-12 shrink-0 text-[#e2b781] xl:size-[4.6vw]" strokeWidth={1} />
              <span>
                <span className="block font-display text-[2rem] font-semibold leading-[1.1] text-[#e2b781] xl:text-[2.261vw]">
                  {value}
                </span>
                <span className="mt-1 block text-[1rem] text-cream-50 xl:mt-[0.58vw] xl:text-[1.17vw]">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Promise */}
      <section className="flex flex-col bg-[#fdf6ec] xl:h-[16.44vw] xl:flex-row">
        <div className="relative hidden xl:block xl:w-[17.1vw] xl:shrink-0">
          <Image
            src="/images/Blush Pink Cosmos Still Life.png"
            alt="Pink cosmos flowers on a blush wall"
            fill
            sizes="17vw"
            className="object-cover"
          />
        </div>

        <div className="relative flex flex-1 flex-col gap-10 px-6 py-10 xl:flex-row xl:gap-0 xl:p-0 xl:pl-[2.37vw]">
          {/* Pale blush wall with flowers at its right end — anchored right so they stay in view. */}
          <Image
            src="/images/Our promise to you about us.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="relative xl:w-[30.05vw] xl:shrink-0 xl:pt-[1.71vw]">
            <p className="font-display text-[1.3rem] font-medium uppercase tracking-[0.02em] text-ink xl:text-[1.329vw]">
              Our Promise to You
            </p>
            <h2 className="mt-1 font-display text-[2.3rem] font-bold leading-[1.1] text-ink xl:mt-[0.32vw] xl:text-[2.482vw] xl:leading-[2.6vw]">
              No Harmful Chemicals.
              <span className="block">Just Honest Beauty.</span>
            </h2>
            <p className="mt-3 whitespace-pre-line text-[1.05rem] leading-[1.45] text-ink/90 xl:mt-[0.77vw] xl:text-[1.136vw] xl:leading-[1.6vw]">
              {"We say NO to Parabens, Sulphates, Phthalates, Mineral Oils\nand other harmful ingredients.\nWe say YES to clean, safe and effective beauty."}
            </p>
          </div>

          <ul className="relative grid grid-cols-3 gap-y-6 sm:grid-cols-5 xl:flex xl:pt-[4.47vw]">
            {FREE_FROM.map(({ label, Icon }) => (
              <li key={label} className="flex flex-col items-center text-center xl:w-[8.42vw]">
                <span className="grid size-20 place-items-center rounded-full border-[1.5px] border-ink/55 xl:size-[5.52vw]">
                  <Icon className="size-10 text-ink xl:size-[2.76vw]" strokeWidth={1.25} />
                </span>
                <span className="mt-3 whitespace-pre-line text-[0.95rem] font-semibold uppercase leading-[1.4] tracking-[0.02em] text-ink xl:mt-[1.02vw] xl:text-[0.96vw] xl:leading-[1.38vw]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Founder. Desktop (xl) sizes are the design's own proportions — its
          px ÷ 16.15, the design being a 1615px-wide capture — and its colours
          are sampled from it. The circle mark is cut from the supplied logo;
          the wordmark is set as text because the design spaces it tighter
          than the logo file does. */}
      <section className="grid bg-[#310c2b] lg:grid-cols-2 xl:h-[20.56vw] xl:grid-cols-[25.08vw_42.42vw_minmax(0,1fr)]">
        <div className="relative min-h-[300px] xl:min-h-0">
          <Image
            src="/images/note from founder.png"
            alt="Anshil Dev, founder of Velastia"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="px-6 py-10 xl:px-0 xl:pt-[2.23vw] xl:pb-0 xl:pl-[2.66vw]">
          <p className="font-display text-[1.1rem] font-medium uppercase tracking-[0.02em] text-[#e9b869] xl:text-[1.139vw]">
            A Note From Our Founder
          </p>
          <p className="mt-2 font-display text-[1.9rem] font-medium leading-[1.15] text-[#e9b869] xl:mt-[0.836vw] xl:text-[1.99vw] xl:leading-[2.13vw]">
            {/* The design sets this first line a touch larger than the second. */}
            <span className="block xl:text-[2.13vw]">This brand is for every you.</span>
            <span className="block">The bold you. The soft you. The unstoppable you.</span>
          </p>
          <p className="mt-3 whitespace-pre-line text-[1.1rem] leading-[1.45] text-[#f3e8ef] xl:mt-[0.9vw] xl:text-[1.3vw] xl:leading-[1.734vw]">
            {"Velastia is my love letter to all women who dream, do and\ninspire. Thank you for being a part of our journey."}
          </p>
          <div className="mt-4 text-[1.05rem] leading-[1.6] xl:mt-[0.93vw] xl:text-[1.27vw] xl:leading-[1.7vw]">
            <p className="text-[#e9b869]">With love,</p>
            <p className="font-semibold text-[#e9b869]">Anshil Dev</p>
            <p className="text-[#f3e8ef]">Founder, Velastia</p>
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-[#865b65]/70 px-6 py-10 text-center lg:col-span-2 xl:col-span-1 xl:border-t-0 xl:border-l xl:px-0 xl:pt-[2.48vw] xl:pb-0">
          <Image
            src="/brand/founder-logo-mark.png"
            alt=""
            width={400}
            height={394}
            className="size-20 xl:size-[5.7vw]"
          />
          <p className="font-display text-[3rem] font-semibold uppercase leading-none tracking-[0.02em] text-[#e9b869] xl:text-[3.288vw]">
            Velastia
          </p>
          <p className="font-display text-[1.3rem] font-medium leading-[1.2] text-[#e9b869] xl:text-[1.418vw]">
            Luxury. Science. You.
          </p>
          <p className="mt-5 font-display text-[1rem] font-medium uppercase tracking-[0.1em] text-[#e9b869] xl:mt-[1.594vw] xl:text-[1.096vw]">
            Because you deserve more.
          </p>
          <p className="mt-2 font-script text-[2rem] leading-[1.2] text-[#e9b869] xl:mt-[0.65vw] xl:text-[2.161vw]">
            Thank you for trusting us.
          </p>
        </div>
      </section>
    </>
  );
}
