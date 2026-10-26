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
  { Icon: Heart, title: "Cruelty-Free\n& Vegan", note: "Beauty that's kind\nto all beings." },
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
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
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

      {/* Our story */}
      <section className="py-10 sm:py-14 lg:py-16 xl:py-20 bg-cream-50">
        <div className="container-vel">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] xl:grid-cols-[1fr_1.35fr] lg:items-center xl:gap-14 2xl:gap-18">
            {/* Story text */}
            <div className="max-w-xl">
              <p className="font-heading text-[1.15rem] sm:text-[1.25rem] xl:text-[1.35rem] font-bold uppercase tracking-[0.03em] text-gold-600">
                Our Story
              </p>
              <h2 className="mt-1 font-heading font-bold text-[2.2rem] sm:text-[2.5rem] xl:text-[2.75rem] leading-[1.12] text-ink">
                Born from a belief.
                <span className="block">Made for you.</span>
              </h2>
              <Ornament className="mt-3.5 w-full max-w-[388px]" />
              <p className="mt-6 text-[1.05rem] sm:text-[1.12rem] xl:text-[1.15rem] leading-[1.6] text-ink">
                Velastia was born from a simple belief – that beauty is not just about
                appearance, but about confidence, self-expression and self-love.
              </p>
              <p className="mt-4 text-[1.05rem] sm:text-[1.12rem] xl:text-[1.15rem] leading-[1.6] text-ink">
                We combine the best of science and nature to create high-performance
                products that are safe, effective and luxuriously indulgent.
              </p>
              <p className="mt-5 font-heading text-[1.5rem] sm:text-[1.7rem] font-bold leading-[1.2] text-gold-600">
                Luxury. Science. You.
              </p>
            </div>

            {/* Pillars Card - Perfectly scaled so all 4 pillars including "Inspired by You" fit with generous padding */}
            <div className="w-full overflow-hidden rounded-[14px] sm:rounded-[18px] border border-gold-300/40 bg-[#371938] shadow-[0_12px_32px_rgba(32,8,45,0.25),0_4px_12px_rgba(32,8,45,0.12)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(32,8,45,0.32),0_6px_16px_rgba(193,136,62,0.2)] hover:border-gold-400/60 grid sm:grid-cols-[1.12fr_1fr] items-stretch">
              <ul className="flex flex-col justify-between py-7 px-6 sm:px-7 sm:py-8 lg:py-9 lg:px-8 gap-5 sm:gap-6 bg-[#371938]">
                {PILLARS.map(({ label, value, Icon }) => (
                  <li key={value} className="flex items-center gap-4 lg:gap-4.5">
                    <span className="grid size-12 sm:size-13 lg:size-14 xl:size-15 shrink-0 place-items-center rounded-full border-[1.5px] border-gold-400 bg-gold-400/5">
                      <Icon className="size-6 sm:size-6.5 lg:size-7 xl:size-7.5 text-gold-400" strokeWidth={1.25} />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[0.84rem] sm:text-[0.92rem] lg:text-[0.98rem] leading-snug text-cream-100">
                        {label}
                      </span>
                      <span className="mt-0.5 block font-heading text-[1.05rem] sm:text-[1.15rem] lg:text-[1.25rem] font-bold leading-tight text-gold-400">
                        {value}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="relative min-h-[260px] sm:min-h-full w-full">
                <Image
                  src="/brand/about-lab.png"
                  alt="Laboratory glassware with a flower and a pipette"
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 92vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Velastia way */}
      <section className="py-10 sm:py-14 lg:py-16 bg-cream-100/70 border-y border-gold-200/60">
        <div className="container-vel">
          <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <span className="h-px flex-1 bg-gold-300/70" />
            <h2 className="shrink-0 font-heading text-[1.25rem] sm:text-[1.4rem] lg:text-[1.6rem] font-bold uppercase tracking-[0.04em] text-plum-900">
              The Velastia Way
            </h2>
            <span className="h-px flex-1 bg-gold-300/70" />
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
            {WAY.map(({ Icon, title, note }) => (
              <li key={title} className="flex flex-col items-center text-center">
                <span className="grid size-14 sm:size-16 place-items-center rounded-full bg-gold-500/10 border border-gold-300/40 mb-3.5">
                  <Icon className="size-7 sm:size-8 text-gold-700" strokeWidth={1.2} />
                </span>
                <h3 className="whitespace-pre-line font-heading text-[0.95rem] sm:text-[1.05rem] font-bold uppercase leading-snug text-plum-900">
                  {title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-[0.8rem] sm:text-[0.88rem] leading-relaxed text-ink/80">
                  {note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The Science Behind Our Beauty */}
      <section className="grid lg:grid-cols-[35%_65%] xl:grid-cols-[33%_67%] bg-[#2e0829]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-10 lg:py-14 xl:px-14 xl:py-16 text-cream-50 bg-[#2e0829] border-b lg:border-b-0 lg:border-r border-gold-400/40">
          <h2 className="font-heading font-bold text-[1.75rem] sm:text-[2rem] xl:text-[2.2rem] uppercase leading-[1.2] tracking-[0.02em] text-cream-50">
            The Science Behind
            <span className="block">Our Beauty</span>
          </h2>
          <Ornament
            className="mt-3.5 w-[200px]"
            markClassName="h-3 w-6"
          />
          <p className="mt-5 text-[0.98rem] sm:text-[1.05rem] leading-relaxed text-[#f0d9e8]">
            At Velastia, we believe in transparency. That&apos;s why we carefully select every ingredient for its performance and purity.
          </p>
          <p className="mt-3 text-[0.98rem] sm:text-[1.05rem] leading-relaxed text-[#f0d9e8]">
            Our products are crafted in state-of-the-art facilities with global quality standards.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 bg-[#fdf6ec] p-6 sm:p-8 lg:p-10 xl:p-12 items-stretch py-8 sm:py-10 lg:py-12">
          {SCIENCE.map((s) => (
            <li
              key={s.name}
              className="group overflow-hidden rounded-xl border border-gold-300/40 bg-[#fef4ea] shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.18)] hover:border-gold-400/80 flex flex-col"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image src={s.image} alt={s.name} fill sizes="(min-width: 1280px) 11vw, (min-width: 1024px) 13vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between text-center">
                <h3 className="font-sans text-[0.82rem] sm:text-[0.88rem] font-bold uppercase tracking-[0.02em] text-plum-900">
                  {s.name}
                </h3>
                <p className="mt-1 whitespace-pre-line text-[0.74rem] sm:text-[0.8rem] leading-snug text-ink/80">
                  {s.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats Band */}
      <section className="bg-[#2c0a27] py-8 sm:py-10 lg:py-12 border-y border-gold-400/30">
        <div className="container-vel">
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 items-center justify-between">
            {stats.map(({ Icon, value, label }, i) => (
              <li
                key={label}
                className={`flex items-center gap-3.5 sm:gap-4.5 justify-start sm:justify-center ${
                  i > 0 ? "lg:border-l lg:border-[#502b3e] lg:pl-6 xl:pl-8" : ""
                }`}
              >
                <Icon className="size-10 sm:size-11 lg:size-12 shrink-0 text-[#e2b781]" strokeWidth={1} />
                <div>
                  <span className="block font-heading text-[1.8rem] sm:text-[2rem] lg:text-[2.2rem] font-bold leading-none text-[#e2b781]">
                    {value}
                  </span>
                  <span className="mt-1 block text-[0.82rem] sm:text-[0.92rem] leading-tight text-cream-50">
                    {label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Promise */}
      <section className="relative flex flex-col bg-[#fdf6ec] lg:flex-row overflow-hidden">
        <div className="relative hidden lg:block w-[18%] shrink-0 min-h-[300px]">
          <Image
            src="/images/Blush Pink Cosmos Still Life.png"
            alt="Pink cosmos flowers on a blush wall"
            fill
            sizes="18vw"
            className="object-cover"
          />
        </div>

        <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-between p-8 sm:p-10 lg:p-12 xl:p-14 gap-8 lg:gap-12">
          {/* Pale blush wall with flowers background */}
          <Image
            src="/images/Our promise to you about us.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-right opacity-35 pointer-events-none"
          />
          <div className="relative z-10 max-w-xl">
            <p className="font-heading text-[1.1rem] sm:text-[1.2rem] font-bold uppercase tracking-[0.03em] text-ink">
              Our Promise to You
            </p>
            <h2 className="mt-1 font-heading text-[1.9rem] sm:text-[2.2rem] font-bold leading-[1.15] text-ink">
              No Harmful Chemicals.
              <span className="block">Just Honest Beauty.</span>
            </h2>
            <p className="mt-3 text-[0.92rem] sm:text-[1rem] leading-relaxed text-ink/85">
              {"We say NO to Parabens, Sulphates, Phthalates, Mineral Oils and other harmful ingredients.\nWe say YES to clean, safe and effective beauty."}
            </p>
          </div>

          <ul className="relative z-10 grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 lg:gap-5 xl:gap-8 shrink-0">
            {FREE_FROM.map(({ label, Icon }) => (
              <li key={label} className="flex flex-col items-center text-center">
                <span className="grid size-14 sm:size-16 lg:size-18 place-items-center rounded-full border-[1.5px] border-ink/50 bg-white/40 shadow-xs">
                  <Icon className="size-7 sm:size-8 lg:size-9 text-ink" strokeWidth={1.25} />
                </span>
                <span className="mt-2.5 whitespace-pre-line text-[0.72rem] sm:text-[0.78rem] font-semibold uppercase leading-tight text-ink">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Founder Section - Fully responsive with zero vertical/horizontal overlapping */}
      <section className="bg-[#310c2b] text-cream-50">
        <div className="grid lg:grid-cols-[1fr_1.4fr] xl:grid-cols-[28%_44%_28%] items-stretch">
          {/* Column 1: Founder Portrait */}
          <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-full w-full">
            <Image
              src="/images/note from founder.png"
              alt="Anshil Dev, founder of Velastia"
              fill
              sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 40vw, 100vw"
              className="object-cover object-top"
            />
          </div>

          {/* Column 2: Founder Note */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-10 lg:py-14 xl:px-12 xl:py-16">
            <p className="label-caps font-bold tracking-[0.1em] text-[#e9b869]">
              A Note From Our Founder
            </p>
            <h2 className="mt-3 font-heading text-[1.6rem] sm:text-[1.85rem] xl:text-[2.1rem] font-bold leading-[1.2] text-[#e9b869]">
              <span className="block">This brand is for every version of you.</span>
              <span className="block mt-1 font-semibold text-[1.2rem] sm:text-[1.35rem] xl:text-[1.5rem] text-[#f7ddb2]">
                The bold you. The soft you. The unstoppable you.
              </span>
            </h2>
            <p className="mt-4 whitespace-pre-line text-[0.95rem] sm:text-[1.05rem] xl:text-[1.12rem] leading-[1.65] text-[#f3e8ef]">
              {"Velastia is my love letter to all women who dream, do and\ninspire. Thank you for being a part of our journey."}
            </p>
            <div className="mt-6 text-[0.95rem] sm:text-[1.02rem] leading-[1.6]">
              <p className="text-[#e9b869]">With love,</p>
              <p className="font-semibold text-[1.1rem] text-[#e9b869] mt-0.5">Anshil Dev</p>
              <p className="text-[#f3e8ef]/80 text-[0.88rem]">Founder, Velastia</p>
            </div>
          </div>

          {/* Column 3: Brand Seal & Trust */}
          <div className="flex flex-col items-center justify-center border-t border-[#865b65]/70 lg:border-t-0 lg:border-l border-[#865b65]/50 px-6 py-10 sm:px-8 sm:py-12 lg:col-span-2 xl:col-span-1 text-center bg-[#280923]">
            <Image
              src="/brand/founder-logo-mark.png"
              alt="Velastia seal"
              width={400}
              height={394}
              className="size-16 sm:size-20 xl:size-22"
            />
            <p className="mt-3 font-heading text-[2.4rem] sm:text-[2.8rem] xl:text-[3rem] font-bold uppercase leading-none tracking-[0.04em] text-[#e9b869]">
              Velastia
            </p>
            <p className="mt-1 font-heading text-[1.1rem] sm:text-[1.25rem] font-bold text-[#e9b869]">
              Luxury. Science. You.
            </p>
            <p className="mt-4 font-heading text-[0.82rem] sm:text-[0.9rem] font-bold uppercase tracking-[0.14em] text-[#e9b869]/90">
              Because you deserve more.
            </p>
            <p className="mt-2 font-script text-[1.8rem] sm:text-[2rem] text-[#e9b869]">
              Thank you for trusting us.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
