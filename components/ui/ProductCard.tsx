"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import { inrPaise, cn, productImage } from "@/lib/utils";
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
  const wished = wishlist.includes(product.slug);
  const comingSoon = product.status === "COMING_SOON";
  const soldOut = !comingSoon && !product.inStock;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-gold-200/60 bg-cream-100 transition-shadow hover:shadow-[0_10px_30px_-18px_rgba(42,18,43,0.45)]",
        className,
      )}
    >
      {product.isBestseller && (
        <span className="label-caps absolute left-0 top-3 z-10 bg-plum-800 px-2.5 py-1 text-[0.55rem] text-gold-300">
          Best Seller
        </span>
      )}

      <button
        onClick={() => toggleWish(product.slug)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full bg-cream-50/85 backdrop-blur transition-colors hover:bg-cream-50"
      >
        <Heart
          className={cn("size-[15px]", wished ? "text-plum-800" : "text-ink-soft")}
          fill={wished ? "currentColor" : "none"}
        />
      </button>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-cream-200/50">
          <Image
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col items-center px-3 pb-3.5 pt-3 text-center">
        <Link
          href={`/product/${product.slug}`}
          // Names run to three lines in the narrow home-page cards; the button
          // below is pushed down by mt-auto, so the cards still line up.
          className="text-balance text-[0.82rem] leading-snug text-ink transition-colors hover:text-gold-600"
        >
          {product.name}
        </Link>

        {showRating && product.rating.count > 0 && (
          <StarRating value={product.rating.average} size={12} className="mt-1.5" />
        )}

        <p className="mt-1.5 font-display text-[1.05rem] font-semibold text-plum-800">
          {inrPaise(product.pricePaise)}
          {product.compareAtPaise != null && product.compareAtPaise > product.pricePaise && (
            <span className="ml-1.5 font-sans text-[0.72rem] font-normal text-ink-soft line-through">
              {inrPaise(product.compareAtPaise)}
            </span>
          )}
        </p>

        <div className="mt-auto w-full pt-3">
          {comingSoon || soldOut ? (
            <span className="label-caps block w-full rounded-sm bg-cream-300 py-2.5 text-[0.6rem] text-ink-soft">
              {comingSoon ? "Coming Soon" : "Out of Stock"}
            </span>
          ) : (
            <button
              onClick={() => add(product.slug, 1, product.shades[0]?.name)}
              className="label-caps block w-full rounded-sm bg-plum-800 py-2.5 text-[0.6rem] text-cream-50 transition-colors hover:bg-gold-600"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
