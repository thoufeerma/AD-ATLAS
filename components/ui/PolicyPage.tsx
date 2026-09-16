import Link from "next/link";
import { FileText } from "lucide-react";
import PageBanner from "./PageBanner";
import { POLICIES, type Policy } from "@/lib/legal";
import { STORE } from "@/lib/products";
import { cn } from "@/lib/utils";

export default function PolicyPage({ policy }: { policy: Policy }) {
  return (
    <>
      <PageBanner
        title={policy.title}
        tone="light"
        lead={policy.lead}
        crumbs={[{ label: "Home", href: "/" }, { label: policy.title }]}
      />

      <div className="container-vel grid gap-10 py-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Policy nav */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="label-caps mb-4 text-[0.62rem] text-gold-700">Policies</h2>
          <ul className="space-y-1">
            {POLICIES.map((p) => {
              const active = p.slug === policy.slug;
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
              <a href={`mailto:${STORE.supportEmail}`} className="text-gold-700 hover:text-gold-600">
                {STORE.supportEmail}
              </a>{" "}
              or call {STORE.supportPhone}.
            </p>
          </div>
        </aside>

        {/* Body */}
        <article className="max-w-3xl">
          <p className="text-[0.72rem] text-ink-soft">Last updated: {policy.updated}</p>

          <div className="mt-8 space-y-9">
            {policy.sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="font-display text-xl text-plum-800">
                  <span className="mr-2.5 text-gold-500">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.body.map((p) => (
                    <p key={p} className="text-[0.9rem] leading-relaxed text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t border-gold-200/70 pt-6 text-[0.72rem] leading-relaxed text-ink-soft">
            Velastia is a brand of AD Atlas Ventures Private Limited, {STORE.city}.
            Questions about this policy can be sent to{" "}
            <a href={`mailto:${STORE.supportEmail}`} className="text-gold-700 hover:text-gold-600">
              {STORE.supportEmail}
            </a>
            .
          </p>
        </article>
      </div>
    </>
  );
}
