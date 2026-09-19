import Image from "next/image";
import { INSTAGRAM } from "@/lib/content";

/** Links out to the store's Instagram; the home page skips it until one is set. */
export default function InstagramStrip({ href, handle }: { href: string; handle: string | null }) {
  return (
    <section className="bg-cream-50 pb-16">
      <div className="container-vel">
        <div className="mb-7 text-center">
          <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
            FOLLOW US ON INSTAGRAM
          </h2>
          {handle && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-gold-600 hover:text-gold-500"
            >
              {handle}
            </a>
          )}
        </div>

        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {INSTAGRAM.map((src, i) => (
            <li key={src}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
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
