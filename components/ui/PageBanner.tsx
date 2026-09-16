import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared page header: breadcrumb, title, optional lead and a photo on the right. */
export default function PageBanner({
  title,
  lead,
  crumbs,
  image,
  tone = "dark",
  script,
}: {
  /** Omit to render a breadcrumb-only strip, e.g. above a product page. */
  title?: string;
  lead?: string;
  crumbs: { label: string; href?: string }[];
  image?: string;
  tone?: "dark" | "light";
  /** Small handwritten flourish rendered beside the title, as on Cart/Wishlist. */
  script?: string;
}) {
  const dark = tone === "dark";

  return (
    <section className={cn("relative overflow-hidden", dark ? "bg-plum-800" : "bg-cream-100")}>
      {image && (
        <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
          <Image src={image} alt="" fill sizes="50vw" className="object-cover object-right" />
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-48 bg-gradient-to-r to-transparent",
              dark ? "from-plum-800" : "from-cream-100",
            )}
          />
        </div>
      )}

      <div className={cn("container-vel relative", title ? "py-10 md:py-12" : "py-4")}>
        <nav aria-label="Breadcrumb" className={title ? "mb-4" : ""}>
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.68rem]">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link
                    href={c.href}
                    className={cn(
                      "transition-colors",
                      dark ? "text-cream-200/65 hover:text-gold-300" : "text-ink-soft hover:text-gold-600",
                    )}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className={dark ? "text-gold-300" : "text-plum-800"}>{c.label}</span>
                )}
                {i < crumbs.length - 1 && (
                  <ChevronRight
                    className={cn("size-3", dark ? "text-cream-200/40" : "text-ink-soft/50")}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {title && (
          <div className="flex items-end gap-3">
            <h1
              className={cn(
                "font-display text-[2.1rem] leading-tight tracking-[0.04em] sm:text-[2.6rem]",
                dark ? "text-cream-50" : "text-plum-800",
              )}
            >
              {title}
            </h1>
            {script && (
              <span className="mb-1.5 font-script text-2xl text-gold-500">{script}</span>
            )}
          </div>
        )}

        {lead && (
          <p
            className={cn(
              "mt-3 max-w-md text-sm leading-relaxed",
              dark ? "text-cream-200/70" : "text-ink-soft",
            )}
          >
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
