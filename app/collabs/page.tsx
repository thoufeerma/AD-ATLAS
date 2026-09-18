import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Gift, Megaphone, HandHeart } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Avatar from "@/components/ui/Avatar";
import CollabForm from "@/components/forms/CollabForm";
import { getHomeContent } from "@/lib/api/server";
import { INSTAGRAM } from "@/lib/content";

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

export default async function CollabsPage() {
  const { collaborators } = await getHomeContent();

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
          {collaborators.map((c) => (
            <li
              key={c.id}
              className="flex flex-col items-center rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 text-center"
            >
              <Avatar
                src={c.avatarUrl}
                name={c.name}
                size={84}
                className="border border-gold-300/70"
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
            <div className="mt-8 flex gap-3">
              {INSTAGRAM.slice(0, 4).map((src, i) => (
                <div key={src} className="relative size-16 overflow-hidden rounded-md">
                  <Image src={src} alt={`Velastia campaign ${i + 1}`} fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <CollabForm />
        </div>
      </section>
    </>
  );
}
