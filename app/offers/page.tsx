import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import TrustStrip from "@/components/ui/TrustStrip";
import CopyCode from "@/components/ui/CopyCode";
import { getBestsellers, getOffers, getSettings } from "@/lib/api/server";
import { inrPaise } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current Velastia offers and coupon codes.",
};

/**
 * No design exists for this page — the Gen B nav links to it but the reference
 * set has no Offers screen. The cards are the offers switched on in the admin
 * (Offers & Deals) and inside their dates; the code callout is the live
 * welcome coupon.
 */
export default async function OffersPage() {
  const [offers, featured, { welcomeOffer }] = await Promise.all([
    getOffers(),
    getBestsellers(),
    getSettings(),
  ]);

  const ends = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageBanner
        title="Offers"
        tone="light"
        lead="Everything currently running at Velastia, in one place."
        crumbs={[{ label: "Home", href: "/" }, { label: "Offers" }]}
      />

      <section className="container-vel py-12">
        {welcomeOffer && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-card)] bg-plum-800 px-7 py-6">
            <div>
              <p className="label-caps text-[0.6rem] text-gold-300">
                {welcomeOffer.firstOrderOnly ? "New here?" : "Coupon"}
              </p>
              <p className="mt-1 font-display text-2xl text-cream-50">
                {welcomeOffer.percent}% off {welcomeOffer.firstOrderOnly ? "your first order" : "your order"}
              </p>
              {welcomeOffer.minOrderPaise > 0 && (
                <p className="mt-1 text-[0.72rem] text-cream-200/70">
                  On orders of {inrPaise(welcomeOffer.minOrderPaise)} or more.
                </p>
              )}
            </div>
            <CopyCode code={welcomeOffer.code} />
          </div>
        )}

        {offers.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2">
            {offers.map((o) => (
              <li
                key={o.id}
                className="flex flex-col rounded-[var(--radius-card)] border border-gold-300/60 bg-blush-100 p-7"
              >
                <span className="grid size-12 place-items-center rounded-full bg-cream-50">
                  <Sparkles className="size-5 text-gold-600" />
                </span>
                <h2 className="mt-4 font-display text-xl text-plum-800">{o.name}</h2>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">{o.scope}</p>
                <p className="mt-auto pt-5 text-[0.68rem] leading-relaxed text-ink-soft/85">
                  Ends {ends(o.endsAt)}.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          !welcomeOffer && (
            <p className="rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-12 text-center text-sm text-ink-soft">
              No offers are running right now. Check back soon!
            </p>
          )
        )}

        <div className="mt-8 flex justify-center">
          <Button href="/shop" size="lg">
            Shop the Collection
          </Button>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-gold-200/60 bg-cream-100 py-14">
          <div className="container-vel">
            <h2 className="mb-8 text-center font-display text-2xl tracking-[0.05em] text-plum-800">
              BESTSELLERS TO PAIR WITH YOUR OFFER
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TrustStrip />
    </>
  );
}
