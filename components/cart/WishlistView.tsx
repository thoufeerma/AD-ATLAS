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
import { useAccount } from "@/lib/account";
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
  const status = useAccount((s) => s.status);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const clearWishlist = useStore((s) => s.clearWishlist);
  const add = useStore((s) => s.add);

  // Saved slugs that are no longer in the catalog simply drop out of view.
  const items = products.filter((p) => wishlist.includes(p.slug));
  const buyable = (p: Product) => p.status === "ACTIVE" && p.inStock;

  if (!hydrated) return <div className="max-w-[1536px] mx-auto px-6 py-20" aria-hidden />;

  return (
    <div className="max-w-[1536px] mx-auto px-4 lg:px-10 py-4 pb-4">
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <Heart className="mx-auto size-10 text-[#c8963c]" />
          <h2 className="mt-5 font-serif font-bold text-3xl text-[#240b25]">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-[1rem] font-medium text-[#240b25]/70">
            Tap the heart on any product to save it for later.
          </p>
          <Link href="/shop">
            <button className="mt-7 bg-[#240b25] text-white py-3 px-8 rounded-lg font-bold uppercase tracking-widest text-[0.85rem] hover:bg-[#3a133d] transition-colors shadow-md">
              Browse the Collection
            </button>
          </Link>
        </div>
      ) : (
        <>
          {status === "guest" && (
            <p className="mb-6 rounded-lg bg-[#fdf2ee] border border-[#eaddce] px-6 py-4 text-[0.9rem] font-medium text-[#240b25]/80 shadow-sm">
              <Link href="/login?next=/wishlist" className="font-bold text-[#240b25] hover:text-[#c8963c]">
                Sign in
              </Link>{" "}
              and we'll keep this wishlist with your account, so it's there on your other devices too.
            </p>
          )}
          <div className="rounded-2xl border border-gold-200/70 p-3 lg:p-4">
            {/* Controls Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#eaddce] pb-4">
              <p className="font-bold text-[1.15rem] text-[#240b25]">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </p>
              <div className="flex items-center gap-6 lg:gap-8">
                <button
                  onClick={clearWishlist}
                  className="inline-flex items-center gap-2 font-bold text-[0.9rem] text-[#240b25] transition-colors hover:text-[#c8963c]"
                >
                  <Trash2 className="size-4" strokeWidth={2.5} /> Clear Wishlist
                </button>
                <button
                  onClick={() =>
                    items.filter(buyable).forEach((p) => add(p.slug, 1, p.shades[0]?.name))
                  }
                  className="bg-[#240b25] text-white flex items-center justify-center gap-2 py-3 px-8 rounded-lg font-bold uppercase tracking-widest text-[0.8rem] hover:bg-[#3a133d] transition-colors shadow-md"
                >
                  <ShoppingBag className="size-4" strokeWidth={2} /> ADD ALL TO BAG
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <ul className="grid grid-cols-2 gap-2 lg:gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {items.map((p) => (
                <li
                  key={p.slug}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-[#eaddce] bg-[#fdfbf9] group"
                >
                  {/* Heart Button */}
                  <button
                    onClick={() => toggleWish(p.slug)}
                    aria-label={`Remove ${p.name} from wishlist`}
                    className="absolute right-4 top-4 z-10 text-[#240b25] transition-transform hover:scale-110"
                  >
                    <Heart className="size-5" fill="currentColor" strokeWidth={0} />
                  </button>

                  {/* Product Image */}
                  <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-[#fcf9f5] flex items-center justify-center pt-6">
                    <div className="relative w-[85%] h-[85%]">
                      <Image
                        src={productImage(p)}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 18vw, 45vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-3 lg:p-4 bg-[#fdfbf9]">
                    <Link
                      href={`/product/${p.slug}`}
                      className="font-sans font-semibold text-[0.85rem] leading-snug text-[#240b25] hover:text-[#c8963c] transition-colors block truncate"
                    >
                      {p.name}
                    </Link>
                    {p.descriptor && (
                      <p className="mt-0.5 text-[0.75rem] font-normal text-[#240b25]/70 truncate">{p.descriptor}</p>
                    )}
                    <p className="mt-1 font-bold text-[1.2rem] text-[#240b25]">
                      {inrPaise(p.pricePaise)}
                    </p>
                    
                    <p className="mt-1 flex items-center gap-2 text-[0.8rem] font-bold">
                      <span
                        className={`size-2.5 rounded-full ${buyable(p) ? "bg-[#1ea838]" : "bg-[#c8963c]"}`}
                      />
                      <span className={buyable(p) ? "text-[#1ea838]" : "text-[#240b25]/60"}>
                        {buyable(p)
                          ? "In Stock"
                          : p.status === "COMING_SOON"
                            ? "Coming Soon"
                            : "Out of Stock"}
                      </span>
                    </p>

                    {/* Actions */}
                    <div className="mt-auto flex items-center gap-3 pt-3">
                      <button
                        disabled={!buyable(p)}
                        onClick={() => {
                          add(p.slug, 1, p.shades[0]?.name);
                          toggleWish(p.slug);
                        }}
                        className="flex-1 border border-[#c8963c]/50 bg-transparent text-[#240b25] font-bold uppercase tracking-widest text-[0.7rem] py-2 rounded-lg text-center flex items-center justify-center gap-2 hover:bg-[#fcf9f5] transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <ShoppingBag className="size-3.5" strokeWidth={2} /> MOVE TO BAG
                      </button>
                      <button
                        onClick={() => toggleWish(p.slug)}
                        aria-label={`Remove ${p.name}`}
                        className="h-[2.35rem] w-[2.35rem] shrink-0 flex items-center justify-center rounded-lg border border-[#c8963c]/50 bg-transparent text-[#240b25] transition-colors hover:bg-[#fcf9f5] hover:text-[#c8963c]"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Assurances Banner */}
      <ul className="mt-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 rounded-2xl border border-[#eaddce] bg-transparent py-6 px-6 lg:px-10">
        {assurances.map(({ Icon, title, note }) => (
          <li key={title} className="flex flex-col xl:flex-row items-center xl:items-start justify-center xl:justify-start gap-4 flex-1">
             <div className="flex items-center justify-center mt-0.5">
               <Icon className="size-8 text-[#c8963c] shrink-0" strokeWidth={1.5} />
             </div>
             <div className="flex flex-col items-center xl:items-start text-center xl:text-left">
               <span className="block font-bold text-[#240b25] text-[0.9rem] leading-tight mb-1">{title}</span>
               <span className="text-[0.8rem] font-medium text-[#240b25]/70 leading-tight">{note}</span>
             </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
