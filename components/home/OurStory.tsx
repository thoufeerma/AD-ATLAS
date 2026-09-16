import Image from "next/image";
import Button from "@/components/ui/Button";

const STATS = [
  { value: "50+", label: "Premium Ingredients" },
  { value: "100%", label: "Safe & Effective" },
  { value: "10K+", label: "Happy Customers" },
];

export default function OurStory() {
  return (
    <section className="bg-cream-50">
      <div className="container-vel grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_1fr_auto] lg:gap-14">
        <div className="relative aspect-16/10 overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src="/brand/our-story.png"
            alt="Velastia lipstick beside laboratory glassware and dried flowers"
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="label-caps text-[0.78rem] text-plum-800">Our Story</h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
            Velastia was born from a belief — that beauty is not just about
            appearance, but about confidence, self-expression and self-love.
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
            We combine the best of science and nature to create high-performance
            products that are <strong className="font-medium text-plum-800">safe, effective and luxurious</strong>.
          </p>
          <Button href="/about" className="mt-7">
            Know More About Us
          </Button>
        </div>

        <ul className="grid grid-cols-3 gap-6 lg:grid-cols-1 lg:border-l lg:border-gold-200 lg:pl-12">
          {STATS.map((s) => (
            <li key={s.label} className="text-center lg:text-left">
              <p className="font-display text-[2.1rem] font-semibold leading-none text-plum-800">
                {s.value}
              </p>
              <p className="mt-1.5 text-[0.7rem] text-ink-soft">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
