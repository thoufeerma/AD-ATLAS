"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  Trash2,
  ShoppingBag,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useStore, useHydrated } from "@/lib/store";
import type { Product } from "@/lib/api/types";
import { inrPaise, productImage } from "@/lib/utils";

export default function WishlistView({ products }: { products: Product[] }) {
  const { shipping } = useSettings();
  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic Products", note: "Sourced with Care" },
    { Icon: RotateCcw, title: "Easy Returns", note: "Hassle Free Returns" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "100% Safe & Secure" },
    shipping?.freeAbovePaise != null
      ? { Icon: Truck, title: "Free Shipping", note: `On Orders Above ${inrPaise(shipping.freeAbovePaise)}` }
      : { Icon: Truck, title: "Fast Shipping", note: "Across India" },
    { Icon: Headphones, title: "Customer Support", note: "We're Here to Help" },
  ];

  const hydrated = useHydrated();
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const clearWishlist = useStore((s) => s.clearWishlist);
  const add = useStore((s) => s.add);

  // Saved slugs that are no longer in the catalog simply drop out of view.
  const items = products.filter((p) => wishlist.includes(p.slug));
  const buyable = (p: Product) => p.status === "ACTIVE" && p.inStock;

  if (!hydrated) return <div className="container-vel py-20" aria-hidden />;

  return (
    <div className="container-vel py-10">
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <Heart className="mx-auto size-10 text-gold-500" />
          <h2 className="mt-5 font-display text-2xl text-plum-800">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Tap the heart on any product to save it for later.
          </p>
          <Button href="/shop" className="mt-7">
            Browse the Collection
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-plum-800">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={clearWishlist}
                className="inline-flex items-center gap-1.5 text-[0.72rem] text-ink-soft transition-colors hover:text-plum-800"
              >
                <Trash2 className="size-3.5" /> Clear Wishlist
              </button>
              <Button
                onClick={() =>
                  items.filter(buyable).forEach((p) => add(p.slug, 1, p.shades[0]?.name))
                }
              >
                <ShoppingBag className="size-3.5" /> Add All to Bag
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <li
                key={p.slug}
                className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100"
              >
                <button
                  onClick={() => toggleWish(p.slug)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="absolute right-3 top-3 z-10 text-plum-800"
                >
                  <Heart className="size-4" fill="currentColor" />
                </button>

                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative aspect-square bg-cream-200/40">
                    <Image
                      src={productImage(p)}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 18vw, 45vw"
                      className="object-contain p-3"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <Link
                    href={`/product/${p.slug}`}
                    className="text-[0.8rem] leading-snug text-plum-800 hover:text-gold-600"
                  >
                    {p.name}
                  </Link>
                  {p.descriptor && (
                    <p className="mt-0.5 text-[0.65rem] text-ink-soft">{p.descriptor}</p>
                  )}
                  <p className="mt-1.5 font-display text-lg font-semibold text-plum-800">
                    {inrPaise(p.pricePaise)}
                  </p>

                  <p className="mt-1.5 flex items-center gap-1.5 text-[0.65rem]">
                    <span
                      className={`size-1.5 rounded-full ${buyable(p) ? "bg-success" : "bg-gold-500"}`}
                    />
                    <span className={buyable(p) ? "text-success" : "text-ink-soft"}>
                      {buyable(p)
                        ? "In Stock"
                        : p.status === "COMING_SOON"
                          ? "Coming Soon"
                          : "Out of Stock"}
                    </span>
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={!buyable(p)}
                      onClick={() => {
                        add(p.slug, 1, p.shades[0]?.name);
                        toggleWish(p.slug);
                      }}
                    >
                      <ShoppingBag className="size-3" /> Move to Bag
                    </Button>
                    <button
                      onClick={() => toggleWish(p.slug)}
                      aria-label={`Remove ${p.name}`}
                      className="grid size-8 shrink-0 place-items-center rounded-sm border border-gold-200 text-ink-soft transition-colors hover:border-plum-800 hover:text-plum-800"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ul className="mt-10 grid grid-cols-2 gap-6 rounded-[var(--radius-card)] border border-gold-200/70 bg-cream-100 p-6 sm:grid-cols-3 lg:grid-cols-5">
        {assurances.map(({ Icon, title, note }) => (
          <li key={title} className="flex items-center gap-2.5">
            <Icon className="size-5 shrink-0 text-gold-600" />
            <span className="text-[0.66rem] leading-tight">
              <span className="block font-medium text-plum-800">{title}</span>
              <span className="text-ink-soft">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
