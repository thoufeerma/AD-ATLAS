import Image from "next/image";
import { INSTAGRAM } from "@/lib/content";

export default function InstagramStrip() {
  return (
    <section className="bg-cream-50 pb-16">
      <div className="container-vel">
        <div className="mb-7 text-center">
          <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
            FOLLOW US ON INSTAGRAM
          </h2>
          <a
            href="https://instagram.com"
            className="mt-1 inline-block text-xs text-gold-600 hover:text-gold-500"
          >
            @velastia.beauty
          </a>
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {INSTAGRAM.map((src, i) => (
            <li key={src}>
              <a
                href="https://instagram.com"
                className="group relative block aspect-square overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={src}
                  alt={`Velastia on Instagram, post ${i + 1}`}
                  fill
                  sizes="(min-width: 640px) 16vw, 30vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
