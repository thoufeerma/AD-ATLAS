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
    <section className="bg-cream-50 pt-0 pb-6 xl:pb-8">
      <div className="container-vel grid items-center gap-8 lg:grid-cols-[1.1fr_1fr_auto] xl:grid-cols-[1.2fr_1fr_auto] lg:gap-10 xl:gap-14 2xl:gap-18">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] xl:rounded-[24px] border border-gold-300/40 shadow-[0_10px_32px_rgba(32,8,45,0.14),0_2px_8px_rgba(32,8,45,0.06)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.15)]">
          <Image
            src="/images/our story image.png"
            alt="Velastia lipstick and its box beside laboratory glassware and pink flowers"
            fill
            sizes="(min-width: 1280px) 45vw, (min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
        </div>

        <div className="pr-2 lg:pr-6 xl:pr-8">
          <h2 className="font-heading text-[1.75rem] xl:text-[2.25rem] 2xl:text-[2.6rem] font-bold tracking-[0.03em] uppercase text-plum-800">Our Story</h2>
          <p className="mt-4 sm:mt-6 text-[clamp(0.95rem,2.2vw,1.15rem)] xl:text-[1.22rem] 2xl:text-[1.32rem] font-medium leading-[1.7] xl:leading-[1.8] text-ink">
            Velastia was born from a belief — that beauty is not just about
            appearance, but about confidence, self-expression and self-love.
          </p>
          <p className="mt-4 sm:mt-6 text-[clamp(0.95rem,2.2vw,1.15rem)] xl:text-[1.22rem] 2xl:text-[1.32rem] font-medium leading-[1.7] xl:leading-[1.8] text-ink">
            We combine the best of science and nature to create high-performance
            products that are <strong className="font-semibold text-plum-800">safe, effective and luxurious</strong>.
          </p>
          <Button href="/about" className="mt-6 sm:mt-8 px-8 py-3.5 xl:px-10 xl:py-4.5 min-h-[44px] text-[0.8rem] xl:text-[0.9rem] rounded-md uppercase tracking-widest font-semibold">
            KNOW MORE ABOUT US
          </Button>
        </div>

        <ul className="grid grid-cols-3 lg:flex lg:flex-col lg:border-l lg:border-gold-200/50 lg:pl-8 xl:pl-12 2xl:pl-16 lg:pr-8 xl:pr-12 2xl:pr-16 w-full lg:w-auto lg:min-w-[16rem] xl:min-w-[20rem] 2xl:min-w-[23rem] border-t border-gold-200/50 lg:border-t-0 py-4 lg:py-0">
          {stats.map((s, i) => (
            <li
              key={s.label}
              aria-label={`${s.value} ${s.label}`}
              className={`flex flex-col items-center justify-center py-2 sm:py-6 xl:py-7 2xl:py-8 px-1.5 sm:px-3 ${
                i !== stats.length - 1
                  ? "border-r lg:border-r-0 lg:border-b border-gold-200/50"
                  : ""
              } ${i === 0 ? "lg:pt-0" : ""} ${i === stats.length - 1 ? "lg:pb-0" : ""}`}
            >
              <p className="font-heading text-[clamp(1.75rem,5.5vw,3.8rem)] xl:text-[4.4rem] 2xl:text-[5rem] font-bold leading-none text-plum-800 text-center">
                {s.value}
              </p>
              <p className="mt-1.5 sm:mt-2.5 xl:mt-3 text-[0.68rem] sm:text-[0.9rem] xl:text-[1.08rem] 2xl:text-[1.18rem] font-medium text-ink text-center leading-tight">
                {s.label}
              </p>
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
