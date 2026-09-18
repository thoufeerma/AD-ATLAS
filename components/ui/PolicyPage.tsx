import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import PageBanner from "./PageBanner";
import { getPage, getPages, getSettings } from "@/lib/api/server";
import { fillTokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Shipping, returns, terms and privacy. The text is edited in the admin
 * (Pages screen); {{tokens}} in it are filled from live settings.
 */
export default async function PolicyPage({ slug }: { slug: string }) {
  const [page, pages, settings] = await Promise.all([getPage(slug), getPages(), getSettings()]);
  if (!page) notFound();

  const { store } = settings;
  const fill = (text: string) => fillTokens(text, settings);
  const updated = new Date(page.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageBanner
        title={page.title}
        tone="light"
        lead={page.body.lead ? fill(page.body.lead) : undefined}
        crumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      />

      <div className="container-vel grid gap-10 py-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Policy nav */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="label-caps mb-4 text-[0.62rem] text-gold-700">Policies</h2>
          <ul className="space-y-1">
            {pages.map((p) => {
              const active = p.slug === page.slug;
              return (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[0.78rem] transition-colors",
                      active
                        ? "bg-plum-800 text-cream-50"
                        : "text-ink-soft hover:bg-cream-100 hover:text-plum-800",
                    )}
                  >
                    <FileText className="size-3.5 shrink-0" />
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-5">
            <p className="text-[0.72rem] font-medium text-plum-800">Still have a question?</p>
            <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink-soft">
              Write to us at{" "}
              <a href={`mailto:${store.supportEmail}`} className="text-gold-700 hover:text-gold-600">
                {store.supportEmail}
              </a>{" "}
              or call {store.supportPhone}.
            </p>
          </div>
        </aside>

        {/* Body */}
        <article className="max-w-3xl">
          <p className="text-[0.72rem] text-ink-soft">Last updated: {updated}</p>

          <div className="mt-8 space-y-9">
            {page.body.sections.map((s, i) => (
              <section key={`${i}-${s.heading}`}>
                <h2 className="font-display text-xl text-plum-800">
                  <span className="mr-2.5 text-gold-500">{String(i + 1).padStart(2, "0")}</span>
                  {fill(s.heading)}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.body.map((para, j) => (
                    <p key={j} className="text-[0.9rem] leading-relaxed text-ink-soft">
                      {fill(para)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t border-gold-200/70 pt-6 text-[0.72rem] leading-relaxed text-ink-soft">
            {store.name} is a brand of {store.legalEntity}, {store.city}. Questions about this
            policy can be sent to{" "}
            <a href={`mailto:${store.supportEmail}`} className="text-gold-700 hover:text-gold-600">
              {store.supportEmail}
            </a>
            .
          </p>
        </article>
      </div>
    </>
  );
}

/** Title and description for a policy route, from the page in the CMS. */
export async function policyMetadata(slug: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return { title: "Page not found" };
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? (page.body.lead ? fillTokens(page.body.lead, settings) : undefined),
  };
}
