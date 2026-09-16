import type { Metadata } from "next";
import { Gift, Percent, Truck, Sparkles, Copy } from "lucide-react";
import PageBanner from "@/components/ui/PageBanner";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import TrustStrip from "@/components/ui/TrustStrip";
import { bestsellers, STORE } from "@/lib/products";
import { inr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current Velastia offers, coupon codes and bundle savings.",
};

/**
 * No design exists for this page — the Gen B nav links to it but the reference
 * set has no Offers screen. Built from the promotions the other screens
 * advertise: the announcement bar, the shop-page offer card and the cart gift.
 */
const OFFERS = [
  {
    Icon: Percent,
    title: `${STORE.welcomeDiscountPct}% Off Your First Order`,
    note: "New here? Take 10% off anything in the store on your first purchase.",
    code: STORE.welcomeCode,
    terms: "Valid on first order only. Cannot be combined with other codes.",
  },
  {
    Icon: Gift,
    title: "Buy 2, Get 1 Free",
    note: "Add any three eligible products to your bag and the lowest-priced one is on us.",
    terms: "Applies to full-priced products. Discount applied automatically at checkout.",
  },
  {
    Icon: Truck,
    title: `Free Shipping Above ${inr(STORE.freeShippingAbove)}`,
    note: "Standard delivery is free once your bag crosses the threshold — no code needed.",
    terms: "Applies across India. Calculated after discounts.",
  },
  {
    Icon: Sparkles,
    title: `Complimentary Gift Above ${inr(STORE.giftAbove)}`,
    note: "Luxury deserves a little extra. A surprise gift ships with qualifying orders.",
    terms: "While stocks last. Gift varies by month.",
  },
];

export default function OffersPage() {
  const featured = bestsellers();

  return (
    <>
      <PageBanner
        title="Offers"
        tone="light"
        lead="Everything currently running at Velastia, in one place."
        crumbs={[{ label: "Home", href: "/" }, { label: "Offers" }]}
      />

      <section className="container-vel py-12">
        <ul className="grid gap-5 sm:grid-cols-2">
          {OFFERS.map(({ Icon, title, note, code, terms }) => (
            <li
              key={title}
              className="flex flex-col rounded-[var(--radius-card)] border border-gold-300/60 bg-blush-100 p-7"
            >
              <span className="grid size-12 place-items-center rounded-full bg-cream-50">
                <Icon className="size-5 text-gold-600" />
              </span>
              <h2 className="mt-4 font-display text-xl text-plum-800">{title}</h2>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">{note}</p>

              {code && (
                <p className="mt-5 inline-flex w-fit items-center gap-2.5 rounded-sm border border-dashed border-gold-500 bg-cream-50 px-4 py-2.5">
                  <span className="label-caps text-[0.7rem] text-plum-800">{code}</span>
                  <Copy className="size-3.5 text-gold-600" />
                </p>
              )}

              <p className="mt-auto pt-5 text-[0.68rem] leading-relaxed text-ink-soft/85">
                {terms}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-center">
          <Button href="/shop" size="lg">
            Shop the Collection
          </Button>
        </div>
      </section>

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

      <TrustStrip />
    </>
  );
}
