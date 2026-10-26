"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { inrPaise, cn, productImage } from "@/lib/utils";
import { getProductSaleBadge, getDiscountPercentage } from "@/lib/campaign";
import type { Product } from "@/lib/api/types";
import StarRating from "./StarRating";

export default function ProductCard({
  product,
  showRating = false,
  className,
}: {
  product: Product;
  showRating?: boolean;
  className?: string;
}) {
  const add = useStore((s) => s.add);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const hydrated = useHydrated();
  const wished = hydrated && wishlist.includes(product.slug);
  const comingSoon = product.status === "COMING_SOON";
  const soldOut = !comingSoon && !product.inStock;

  const saleBadge = getProductSaleBadge(product);
  const discountPct = getDiscountPercentage(product.pricePaise, product.compareAtPaise);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white border border-gold-300/40 shadow-[0_4px_16px_rgba(32,8,45,0.12),0_1.5px_4px_rgba(32,8,45,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(32,8,45,0.2),0_4px_12px_rgba(193,136,62,0.18)] hover:border-gold-400/80",
        className,
      )}
    >
      {saleBadge ? (
        <span className="label-caps pointer-events-none absolute left-0 top-3 z-10 bg-[#cc0c39] px-2.5 xl:px-3 py-1 text-[0.55rem] xl:text-[0.62rem] 2xl:text-[0.66rem] font-bold text-white shadow-sm">
          {saleBadge}
        </span>
      ) : product.isBestseller ? (
        <span className="label-caps pointer-events-none absolute left-0 top-3 z-10 bg-plum-800 px-2.5 xl:px-3.5 py-1 text-[0.55rem] xl:text-[0.68rem] 2xl:text-[0.72rem] text-gold-300 shadow-sm">
          Best Seller
        </span>
      ) : null}

      <button
        onClick={() => toggleWish(product.slug)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 grid size-8 xl:size-9.5 2xl:size-10.5 place-items-center rounded-full bg-cream-50/90 shadow-sm backdrop-blur transition-all hover:bg-white hover:scale-105"
      >
        <Heart
          className={cn("size-3.5 lg:size-[15px] xl:size-4.5 2xl:size-5", wished ? "text-plum-800" : "text-ink-soft")}
          fill={wished ? "currentColor" : "none"}
        />
      </button>

      <div className="relative aspect-4/3 lg:aspect-square xl:aspect-[1/1.02] 2xl:aspect-[1/1.05] overflow-hidden bg-cream-100/60 border-b border-black/[0.04]">
        <Image
          src={productImage(product)}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className={cn(
            "object-cover transition-all duration-500 group-hover:scale-[1.04]",
            product.images && product.images.length > 1 ? "group-hover:opacity-0" : "",
          )}
        />
        {product.images && product.images.length > 1 && (
          <Image
            src={product.images[1].url}
            alt={product.images[1].alt ?? product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-3 pb-3.5 pt-3 xl:px-4.5 xl:pb-5 xl:pt-4 2xl:px-5 2xl:pb-6 2xl:pt-4.5 text-center">
        <Link
          href={`/product/${product.slug}`}
          // below is pushed down by mt-auto, so the cards still line up.
          // The after: overlay stretches this link over the whole card, so a
          // click anywhere opens the product; the heart and Add to Cart sit
          // above it (z-10) and keep doing their own job.
          className="font-sans text-balance text-[0.78rem] lg:text-[0.84rem] xl:text-[1.02rem] 2xl:text-[1.08rem] font-semibold leading-snug text-ink transition-colors group-hover:text-gold-600 after:absolute after:inset-0 line-clamp-2"
        >
          {product.name}
        </Link>

        {showRating && product.rating.count > 0 && (
          <StarRating value={product.rating.average} size={14} className="mt-1.5" />
        )}

        <p className="mt-1.5 xl:mt-2 font-price text-[0.88rem] lg:text-[0.98rem] xl:text-[1.18rem] 2xl:text-[1.26rem] font-bold text-plum-800">
          {discountPct > 0 && (
            <span className="mr-1.5 font-sans text-[0.76rem] lg:text-[0.84rem] xl:text-[0.92rem] font-semibold text-[#cc0c39]">
              -{discountPct}%
            </span>
          )}
          {inrPaise(product.pricePaise)}
          {product.compareAtPaise != null && product.compareAtPaise > product.pricePaise && (
            <span className="ml-1.5 text-[0.65rem] lg:text-[0.72rem] xl:text-[0.82rem] font-normal text-ink-soft line-through">
              {inrPaise(product.compareAtPaise)}
            </span>
          )}
        </p>

        <div className="mt-auto w-full pt-3 xl:pt-4">
          {comingSoon || soldOut ? (
            <span className="label-caps block w-full rounded-md bg-cream-300 py-2.5 xl:py-3.5 2xl:py-4 text-[0.6rem] xl:text-[0.7rem] text-ink-soft">
              {comingSoon ? "Coming Soon" : "Out of Stock"}
            </span>
          ) : (
            <button
              onClick={() =>
                add(product.slug, 1, product.shades[0]?.name, {
                  name: product.name,
                  pricePaise: product.pricePaise,
                  image: productImage(product),
                })
              }
              className="label-caps relative z-10 block w-full rounded-md bg-[#20082d] py-2.5 xl:py-3.5 2xl:py-4 text-[0.62rem] xl:text-[0.74rem] 2xl:text-[0.78rem] font-semibold text-cream-50 shadow-sm transition-all hover:bg-[#340d4a] hover:shadow active:scale-[0.99]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
