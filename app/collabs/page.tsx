import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Gift, Megaphone, HandHeart } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Button from "@/components/ui/Button";
import { COLLABORATORS, INSTAGRAM } from "@/lib/content";

export const metadata: Metadata = {
  title: "Collaborations",
  description:
    "Partnering with creators, makeup artists and beauty experts who inspire beauty every day.",
};

const BENEFITS = [
  { Icon: Gift, title: "Product Seeding", note: "Full-size launches sent to you first, before they go on sale." },
  { Icon: Megaphone, title: "Paid Campaigns", note: "Compensated collaborations across Instagram, YouTube and events." },
  { Icon: Sparkles, title: "Co-Creation", note: "Work with our formulators on limited-edition shades." },
  { Icon: HandHeart, title: "Affiliate Program", note: "Your own discount code and a share of every sale it drives." },
];

export default function CollabsPage() {
  return (
    <>
      <PageBanner
        title="Collaborations"
        tone="light"
        lead="Partnering with amazing creators and beauty experts who inspire beauty every day."
        crumbs={[{ label: "Home", href: "/" }, { label: "Collabs" }]}
      />

      <div className="container-vel py-12">
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {COLLABORATORS.map((c) => (
            <li
              key={c.name}
              className="flex flex-col items-center rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 text-center"
            >
              <Image
                src={c.avatar}
                alt={c.name}
                width={84}
                height={84}
                className="size-21 rounded-full border border-gold-300/70 object-cover"
                style={{ width: 84, height: 84 }}
              />
              <p className="mt-3.5 text-[0.85rem] font-medium text-plum-800">{c.name}</p>
              <p className="text-[0.68rem] text-ink-soft">{c.role}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* What we offer */}
      <section className="border-y border-gold-200/60 bg-cream-100 py-14">
        <div className="container-vel">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl tracking-[0.05em] text-plum-800">
              WHAT WE OFFER
            </h2>
            <p className="mt-1 text-xs text-ink-soft">
              Four ways to work with Velastia.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ Icon, title, note }) => (
              <li
                key={title}
                className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-50 p-6"
              >
                <span className="grid size-11 place-items-center rounded-full bg-blush-100">
                  <Icon className="size-5 text-gold-600" />
                </span>
                <h3 className="mt-4 text-sm font-medium text-plum-800">{title}</h3>
                <p className="mt-1.5 text-[0.72rem] leading-relaxed text-ink-soft">{note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Apply */}
      <section className="container-vel py-14">
        <div className="grid gap-10 rounded-[var(--radius-card)] bg-plum-800 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[2rem] leading-tight text-cream-50">
              Be a Part of Velastia
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-200/70">
              Are you a creator or makeup artist? Tell us about yourself and
              let&apos;s create magic together.
            </p>
            <ul className="mt-7 space-y-2.5">
              {INSTAGRAM.slice(0, 0).map((s) => (
                <li key={s} />
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              {INSTAGRAM.slice(0, 4).map((src, i) => (
                <div key={src} className="relative size-16 overflow-hidden rounded-md">
                  <Image src={src} alt={`Velastia campaign ${i + 1}`} fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <form className="space-y-4">
            {[
              { id: "col-name", label: "Full Name", placeholder: "Your name" },
              { id: "col-email", label: "Email Address", placeholder: "you@example.com", type: "email" },
              { id: "col-handle", label: "Instagram / YouTube Handle", placeholder: "@yourhandle" },
              { id: "col-followers", label: "Audience Size", placeholder: "e.g. 25,000" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  className="w-full rounded-sm border border-gold-500/35 bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:border-gold-400 focus:outline-none"
                />
              </div>
            ))}
            <div>
              <label htmlFor="col-about" className="label-caps mb-1.5 block text-[0.6rem] text-gold-400">
                Tell us about yourself
              </label>
              <textarea
                id="col-about"
                rows={4}
                placeholder="What do you create, and why Velastia?"
                className="w-full rounded-sm border border-gold-500/35 bg-plum-900/60 px-3.5 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/35 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full">
              Apply for Collab
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
