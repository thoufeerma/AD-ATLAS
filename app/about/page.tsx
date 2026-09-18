import type { Metadata } from "next";
import Image from "next/image";
import {
  Leaf,
  Heart,
  FlaskConical,
  MapPin,
  Gem,
  ShieldCheck,
  Sparkles,
  Users,
  Star,
  Ban,
} from "lucide-react";
import { getRatingSummary, getSettings } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "About Velastia",
  description:
    "Velastia is more than a beauty brand. It's a promise of luxury, backed by science, crafted for the modern Indian woman.",
};

const PILLARS = [
  { label: "Crafted with", value: "Premium Ingredients", Icon: Leaf },
  { label: "Driven by", value: "Science & Innovation", Icon: FlaskConical },
  { label: "Designed for", value: "Indian Skin & Climate", Icon: Users },
  { label: "Inspired by", value: "You", Icon: Sparkles },
];

const WAY = [
  { Icon: Leaf, title: "Clean & Safe", note: "We use ingredients you can trust." },
  { Icon: Heart, title: "Cruelty Free & Vegan", note: "Beauty that's kind to all beings." },
  { Icon: FlaskConical, title: "Science Backed", note: "Every formula is carefully tested and proven." },
  { Icon: MapPin, title: "Made in India", note: "Proudly formulated and manufactured in India." },
  { Icon: Gem, title: "Luxurious Experience", note: "Premium textures, elegant packaging, exceptional results." },
  { Icon: ShieldCheck, title: "Safe & Effective", note: "Dermatologically tested for all skin types, including sensitive skin." },
];

const SCIENCE = [
  { name: "Vitamin E", note: "Nourishes & protects your skin", image: "/ingredients/vitamin-e.png" },
  { name: "Hyaluronic Complex", note: "Locks in moisture for plump, smooth lips", image: "/ingredients/hyaluronic.png" },
  { name: "Jojoba Oil", note: "Deeply hydrates & prevents dryness", image: "/ingredients/jojoba.png" },
  { name: "Shea Butter", note: "Softens, soothes & restores comfort", image: "/ingredients/shea.png" },
  { name: "Peptide Blend", note: "Strengthens & improves skin texture", image: "/ingredients/peptide.png" },
];

const FREE_FROM = ["Paraben Free", "Sulphate Free", "Phthalate Free", "Mineral Oil Free", "Toxin Free"];

export default async function AboutPage() {
  const [{ copy }, rating] = await Promise.all([getSettings(), getRatingSummary()]);
  const stats = [
    { Icon: Sparkles, value: "50+", label: "Premium Ingredients" },
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

      {/* Our story */}
      <section className="container-vel grid gap-10 py-16 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="label-caps text-gold-700">Our Story</p>
          <h2 className="mt-3 font-display text-[2rem] leading-tight text-plum-800">
            Born From A Belief.
            <span className="block">Made For You.</span>
          </h2>
          <span className="mt-5 block h-px w-24 bg-gold-400" />
          <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
            Velastia was born from a simple belief — that beauty is not just about
            appearance, but about confidence, self-expression and self-love.
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
            We combine the best of science and nature to create high-performance
            products that are safe, effective and luxuriously indulgent.
          </p>
          <p className="mt-5 font-display text-xl text-gold-600">Luxury. Science. You.</p>
        </div>

        <div className="grid overflow-hidden rounded-[var(--radius-card)] sm:grid-cols-2">
          <ul className="space-y-6 bg-plum-800 p-8">
            {PILLARS.map(({ label, value, Icon }) => (
              <li key={value} className="flex items-center gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-400/60">
                  <Icon className="size-4 text-gold-300" />
                </span>
                <span className="text-[0.78rem] leading-tight">
                  <span className="block text-cream-200/65">{label}</span>
                  <span className="text-gold-300">{value}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="relative min-h-[240px]">
            <Image
              src="/brand/about-lab.png"
              alt="Laboratory glassware with a flower and a pipette"
              fill
              sizes="(min-width: 640px) 30vw, 92vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* The Velastia way */}
      <section className="border-y border-gold-200/60 bg-cream-100 py-14">
        <div className="container-vel">
          <h2 className="label-caps mb-10 text-center text-[0.78rem] text-plum-800">
            The Velastia Way
          </h2>
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {WAY.map(({ Icon, title, note }) => (
              <li key={title} className="text-center">
                <Icon className="mx-auto size-8 text-gold-600" strokeWidth={1.3} />
                <h3 className="label-caps mt-3 text-[0.65rem] text-plum-800">{title}</h3>
                <p className="mt-1.5 text-[0.68rem] leading-relaxed text-ink-soft">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Science behind */}
      <section className="grid lg:grid-cols-[minmax(0,34%)_minmax(0,66%)]">
        <div className="bg-plum-800 px-8 py-12 lg:px-12">
          <h2 className="font-display text-[1.8rem] leading-tight text-cream-50">
            THE SCIENCE BEHIND
            <span className="block">OUR BEAUTY</span>
          </h2>
          <span className="mt-5 block h-px w-24 bg-gold-500" />
          <p className="mt-6 text-sm leading-relaxed text-cream-200/70">
            At Velastia, we believe in transparency. That&apos;s why we carefully
            select every ingredient for its performance and purity.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream-200/70">
            Our products are crafted in state-of-the-art facilities with global
            quality standards.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 bg-cream-100 p-8 sm:grid-cols-3 lg:grid-cols-5">
          {SCIENCE.map((s) => (
            <li key={s.name} className="text-center">
              <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-card)]">
                <Image src={s.image} alt={s.name} fill sizes="20vw" className="object-cover" />
              </div>
              <h3 className="label-caps mt-3 text-[0.6rem] text-plum-800">{s.name}</h3>
              <p className="mt-1 text-[0.65rem] leading-relaxed text-ink-soft">{s.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Stats */}
      <section className="bg-plum-900">
        <ul className="container-vel grid grid-cols-2 gap-8 py-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ Icon, value, label }) => (
            <li key={label} className="flex items-center justify-center gap-3">
              <Icon className="size-7 shrink-0 text-gold-400" strokeWidth={1.3} />
              <span>
                <span className="block font-display text-2xl font-semibold leading-none text-gold-300">
                  {value}
                </span>
                <span className="text-[0.65rem] text-cream-200/65">{label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Promise */}
      <section className="bg-blush-100 py-14">
        <div className="container-vel grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label-caps text-gold-700">Our Promise to You</p>
            <h2 className="mt-3 font-display text-[1.9rem] leading-tight text-plum-800">
              No Harmful Chemicals.
              <span className="block">Just Honest Beauty.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              We say NO to Parabens, Sulphates, Phthalates, Mineral Oils and other
              harmful ingredients. We say YES to clean, safe and effective beauty.
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-6 sm:grid-cols-5">
            {FREE_FROM.map((f) => (
              <li key={f} className="flex flex-col items-center gap-2.5 text-center">
                <span className="grid size-14 place-items-center rounded-full border border-gold-400/60">
                  <Ban className="size-5 text-gold-600" strokeWidth={1.3} />
                </span>
                <span className="label-caps whitespace-pre-line text-[0.58rem] leading-tight text-plum-800">
                  {f.replace(" ", "\n")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Founder */}
      <section className="grid lg:grid-cols-[minmax(0,22%)_minmax(0,50%)_minmax(0,28%)]">
        <div className="relative min-h-[260px]">
          <Image
            src="/people/founder.png"
            alt="Anshil Dev, founder of Velastia"
            fill
            sizes="(min-width: 1024px) 22vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="bg-plum-800 px-8 py-12 lg:px-12">
          <p className="label-caps text-[0.62rem] text-gold-400">A Note From Our Founder</p>
          <p className="mt-4 font-display text-[1.5rem] leading-snug text-cream-50">
            This brand is for every you.
          </p>
          <p className="font-display text-[1.5rem] leading-snug text-gold-300">
            The bold you. The soft you. The unstoppable you.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-cream-200/70">
            Velastia is my love letter to all women who dream, do and inspire.
            Thank you for being a part of our journey.
          </p>
          <p className="mt-6 text-sm text-gold-300">With love,</p>
          <p className="text-sm text-cream-50">Anshil Dev</p>
          <p className="text-[0.72rem] text-cream-200/60">Founder, Velastia</p>
        </div>

        <div className="flex flex-col items-center justify-center bg-plum-900 px-8 py-12 text-center">
          <span className="font-display text-3xl tracking-[0.14em] text-gold-300">VELASTIA</span>
          <span className="mt-1 text-[0.6rem] tracking-[0.18em] text-gold-500">
            Luxury. Science. You.
          </span>
          <p className="label-caps mt-8 text-[0.62rem] text-cream-200/70">
            Because you deserve more.
          </p>
          <p className="mt-2 font-script text-2xl text-gold-400">Thank you for trusting us.</p>
        </div>
      </section>
    </>
  );
}
