import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { Ban, Leaf, FlaskConical, ShieldCheck } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import TrustStrip from "@/components/ui/TrustStrip";
import Button from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("ingredients");
}

const HERO_INGREDIENTS = [
  {
    name: "Vitamin E",
    image: "/ingredients/vitamin-e.png",
    role: "Antioxidant",
    note: "Nourishes and protects your skin from daily environmental stress.",
  },
  {
    name: "Hyaluronic Complex",
    image: "/ingredients/hyaluronic.png",
    role: "Humectant",
    note: "Locks in moisture for plump, smooth lips that stay comfortable.",
  },
  {
    name: "Jojoba Oil",
    image: "/ingredients/jojoba.png",
    role: "Emollient",
    note: "Deeply hydrates and prevents the dryness matte formulas can cause.",
  },
  {
    name: "Shea Butter",
    image: "/ingredients/shea.png",
    role: "Conditioner",
    note: "Softens, soothes and restores comfort through long wear.",
  },
  {
    name: "Peptide Blend",
    image: "/ingredients/peptide.png",
    role: "Active",
    note: "Strengthens and improves skin texture over continued use.",
  },
];

const SUPPORTING = [
  { name: "Plant Wax Blend", note: "Provides rich colour payoff and long wear without heaviness." },
  { name: "Sunflower Oil", note: "Adds slip and comfort, keeping the finish flexible." },
  { name: "Candelilla Wax", note: "A vegan structure agent that replaces beeswax." },
  { name: "Squalane", note: "Lightweight hydration that never feels greasy." },
  { name: "Niacinamide", note: "Evens tone and supports the skin barrier." },
  { name: "Ceramides", note: "Reinforces moisture retention in skincare formulas." },
];

const NEVER = [
  "Parabens",
  "Sulphates",
  "Phthalates",
  "Mineral Oils",
  "Formaldehyde",
  "Animal Testing",
];

const PRINCIPLES = [
  {
    Icon: FlaskConical,
    title: "Chosen for performance",
    note: "Every active is included at a level that actually does something, not a token amount for the label.",
  },
  {
    Icon: Leaf,
    title: "Clean by default",
    note: "If an ingredient is contested, we leave it out rather than defend it.",
  },
  {
    Icon: ShieldCheck,
    title: "Tested for Indian skin",
    note: "Formulas are trialled in Indian heat and humidity, on Indian skin tones.",
  },
];

export default function IngredientsPage() {
  return (
    <>
      <PageBanner
        title="Ingredients That Care"
        tone="light"
        lead="Thoughtfully selected. Scientifically crafted. Here's exactly what goes into a Velastia formula — and what never does."
        crumbs={[{ label: "Home", href: "/" }, { label: "Ingredients" }]}
      />

      {/* Hero ingredients */}
      <section className="container-vel py-12">
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {HERO_INGREDIENTS.map((ing) => (
            <li
              key={ing.name}
              className="overflow-hidden rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100"
            >
              <div className="relative aspect-4/3">
                <Image src={ing.image} alt={ing.name} fill sizes="20vw" className="object-cover" />
              </div>
              <div className="p-4">
                <p className="label-caps text-[0.55rem] text-gold-600">{ing.role}</p>
                <h2 className="mt-1 text-[0.85rem] font-medium text-plum-800">{ing.name}</h2>
                <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink-soft">{ing.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Principles */}
      <section className="border-y border-gold-200/60 bg-cream-100 py-12">
        <ul className="container-vel grid gap-8 lg:grid-cols-3">
          {PRINCIPLES.map(({ Icon, title, note }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold-300/70">
                <Icon className="size-5 text-gold-600" />
              </span>
              <div>
                <h2 className="text-sm font-medium text-plum-800">{title}</h2>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-soft">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Supporting cast */}
      <section className="container-vel py-14">
        <div className="mb-9 text-center">
          <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
            THE SUPPORTING CAST
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            The quieter ingredients that make the formula work.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTING.map((s) => (
            <li
              key={s.name}
              className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5"
            >
              <h3 className="text-[0.88rem] font-medium text-plum-800">{s.name}</h3>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-soft">{s.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Never */}
      <section className="bg-plum-800 py-14">
        <div className="container-vel grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-[2rem] leading-tight text-cream-50">
              What We Never Use
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-200/70">
              We say NO to parabens, sulphates, phthalates, mineral oils and other
              harmful ingredients. We say YES to clean, safe and effective beauty.
            </p>
            <Button href="/shop" variant="gold" className="mt-7">
              Shop the Range
            </Button>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {NEVER.map((n) => (
              <li
                key={n}
                className="flex items-center gap-2.5 rounded-sm border border-gold-500/30 px-4 py-3"
              >
                <Ban className="size-4 shrink-0 text-gold-400" />
                <span className="text-[0.75rem] text-cream-100">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TrustStrip />
    </>
  );
}
