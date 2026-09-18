import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MessageCircle } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Button from "@/components/ui/Button";
import { getFaqs, getSettings } from "@/lib/api/server";
import type { Faq } from "@/lib/api/types";
import { telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to the questions we get asked most about Velastia.",
};

export default async function FaqsPage() {
  const [faqs, { store }] = await Promise.all([getFaqs(), getSettings()]);

  // Grouped under the categories set in the admin, in the order the API sends.
  const groups = new Map<string, Faq[]>();
  for (const f of faqs) groups.set(f.category, [...(groups.get(f.category) ?? []), f]);

  return (
    <>
      <PageBanner
        title="Frequently Asked Questions"
        tone="light"
        lead="Everything you might want to know, in one place."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
      />

      <div className="container-vel grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="max-w-3xl space-y-9">
          {faqs.length === 0 && (
            <p className="text-sm text-ink-soft">
              No questions here yet — contact us and we&apos;ll be glad to help.
            </p>
          )}
          {[...groups].map(([category, items], g) => (
            <section key={category}>
              {groups.size > 1 && (
                <h2 className="label-caps mb-3 text-[0.62rem] text-gold-700">{category}</h2>
              )}
              <div className="space-y-3">
                {items.map((f, i) => (
                  <details
                    key={f.id}
                    open={g === 0 && i === 0}
                    className="group rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 px-5 py-4 open:border-gold-400"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.92rem] font-medium text-plum-800 marker:hidden">
                      {f.question}
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-gold-300 text-gold-600 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 whitespace-pre-line text-[0.88rem] leading-relaxed text-ink-soft">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-gold-200/70 bg-blush-100 p-6">
            <h2 className="font-display text-lg text-plum-800">Still need help?</h2>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-soft">
              Our team is here {store.supportHours}.
            </p>
            <ul className="mt-5 space-y-3.5">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold-600" />
                <a
                  href={`mailto:${store.supportEmail}`}
                  className="text-[0.75rem] text-plum-800 hover:text-gold-600"
                >
                  {store.supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold-600" />
                <a
                  href={telHref(store.supportPhone)}
                  className="text-[0.75rem] text-plum-800 hover:text-gold-600"
                >
                  {store.supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="size-4 shrink-0 text-gold-600" />
                <a
                  href={whatsappHref(store.supportPhone)}
                  className="text-[0.75rem] text-plum-800 hover:text-gold-600"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
            <Button href="/contact" className="mt-6 w-full">
              Contact Us
            </Button>
          </div>

          <p className="mt-5 text-center text-[0.72rem] text-ink-soft">
            Looking for delivery timelines?{" "}
            <Link href="/shipping" className="text-gold-700 hover:text-gold-600">
              Read the shipping policy
            </Link>
          </p>
        </aside>
      </div>
    </>
  );
}
