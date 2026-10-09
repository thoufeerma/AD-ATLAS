import Image from "next/image";
import Button from "@/components/ui/Button";
import { getSettings } from "@/lib/api/server";

export default async function OurStory() {
  const { copy } = await getSettings();
  const stats = [
    { value: "50+", label: "Premium Ingredients" },
    { value: "100%", label: "Safe & Effective" },
    // Editable in the admin: Settings → Site Copy.
    { value: copy.happyCustomers, label: "Happy Customers" },
  ];

  return (
    <section className="bg-cream-50 pt-0">
      <div className="container-vel grid items-center gap-12 lg:grid-cols-[1.2fr_0.85fr_auto] lg:gap-14">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]">
          <Image
            src="/images/our story image.png"
            alt="Velastia lipstick and its box beside laboratory glassware and pink flowers"
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
        </div>

        <div className="pr-2 lg:pr-8">
          <h2 className="font-display text-[1.75rem] font-semibold tracking-[0.03em] uppercase text-plum-800">Our Story</h2>
          <p className="mt-6 text-[1.15rem] font-medium leading-[1.7] text-ink-soft">
            Velastia was born from a belief — that beauty is not just about
            appearance, but about confidence, self-expression and self-love.
          </p>
          <p className="mt-6 text-[1.15rem] font-medium leading-[1.7] text-ink-soft">
            We combine the best of science and nature to create high-performance
            products that are <strong className="font-semibold text-plum-800">safe, effective and luxurious</strong>.
          </p>
          <Button href="/about" className="mt-8 px-8 py-3.5 text-[0.8rem] rounded-md uppercase tracking-widest font-semibold">
            KNOW MORE ABOUT US
          </Button>
        </div>

        <ul className="flex flex-col lg:border-l lg:border-gold-200/50 lg:pl-12 lg:pr-16 w-full lg:w-[17rem]">
          {stats.map((s, i) => (
            <li key={s.label} className={`flex flex-col items-center justify-center py-6 ${i !== stats.length - 1 ? 'border-b border-gold-200/50' : ''} ${i === 0 ? 'pt-0' : ''} ${i === stats.length - 1 ? 'pb-0' : ''}`}>
              <p className="font-display text-[3.8rem] font-medium leading-none text-plum-800 text-center">
                {s.value}
              </p>
              <p className="mt-3 text-[0.9rem] font-medium text-ink-soft text-center">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* Full-width gold line completely flush with the container's contents */}
      <div className="w-full border-b border-gold-200/60" />
      {/* Very small gap for the next section */}
      <div className="h-3" />
    </section>
  );
}
