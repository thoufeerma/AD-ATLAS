"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  BadgeCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Check,
  Eye,
  Heart,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { inrPaise, cn, productImage } from "@/lib/utils";
import type { Product, ProductDetail as Detail } from "@/lib/api/types";

export type CollaboratorReel = {
  id: string;
  creatorName: string;
  creatorRole: string;
  creatorHandle: string;
  creatorAvatar: string;
  videoUrl: string;
  posterUrl: string;
  caption: string;
  views: string;
  likes: string;
  productSlug: string;
  productShade?: string;
  shadeHex?: string;
};

export type CollaboratorReelWithProduct = CollaboratorReel & {
  product: Product;
};

// Demo collaborator videos (as requested, with placeholders linking to products)
const DEMO_COLLABORATOR_REELS: CollaboratorReel[] = [
  {
    id: "reel-1",
    creatorName: "Malvika Sitlani",
    creatorRole: "Beauty Creator",
    creatorHandle: "@malvikasitlaniofficial",
    creatorAvatar: "/people/malvika.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "/people/malvika.png",
    caption: "The one-swipe pigmentation on this lipstick is actually unreal! Lasted through an 8-course dinner without a single touch-up.",
    views: "142K",
    likes: "18.4K",
    productSlug: "velvet-matte-lipstick",
    productShade: "04 Crimson Bloom",
    shadeHex: "#9e2a2b",
  },
  {
    id: "reel-2",
    creatorName: "Komal Pandey",
    creatorRole: "Fashion & Beauty Influencer",
    creatorHandle: "@komalpandeyofficial",
    creatorAvatar: "/people/komal.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "/people/komal.png",
    caption: "My secret lip overlining technique for French pillowy lips. The precision and glide of this lip liner is unmatched.",
    views: "295K",
    likes: "34.1K",
    productSlug: "lip-liner",
    productShade: "01 Rose Desire",
    shadeHex: "#a34343",
  },
  {
    id: "reel-3",
    creatorName: "Sakshi Sindwani",
    creatorRole: "Lifestyle & Beauty Creator",
    creatorHandle: "@stylemeupwithsakshi",
    creatorAvatar: "/people/sakshi.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    posterUrl: "/people/sakshi.png",
    caption: "Finding a nude lipstick for warm Indian skin tones that doesn't wash you out is rare. This formula feels like silk butter!",
    views: "118K",
    likes: "15.9K",
    productSlug: "velvet-matte-liquid-lipstick",
    productShade: "02 Velvet Nude",
    shadeHex: "#b56c5a",
  },
  {
    id: "reel-4",
    creatorName: "Sejal Kumar",
    creatorRole: "Creator & Musician",
    creatorHandle: "@sejalkumar1195",
    creatorAvatar: "/people/sejal.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "/people/sejal.png",
    caption: "All-day humidity test in Mumbai: no caking, no settling into fine lines. Skin still feels fresh after 12 hours.",
    views: "184K",
    likes: "22.3K",
    productSlug: "makeup-fixer",
    productShade: "Ultra Glow",
  },
  {
    id: "reel-5",
    creatorName: "Rishabh Sharma",
    creatorRole: "Celebrity Makeup Artist",
    creatorHandle: "@rishabhsharma_mua",
    creatorAvatar: "/people/rishabh.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "/people/rishabh.png",
    caption: "Pro artist breakdown: watch how this foundation blends into the skin without flash-back. Pure luxury in a bottle.",
    views: "94K",
    likes: "11.2K",
    productSlug: "radiance-foundation",
    productShade: "Warm Honey",
  },
];

export default function CollaboratorVideos({
  currentProduct,
  catalog,
}: {
  currentProduct: Detail;
  catalog: Product[];
}) {
  const add = useStore((s) => s.add);
  const [activeReel, setActiveReel] = useState<CollaboratorReelWithProduct | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Link each reel to its matching product in the catalog or fallback to currentProduct
  const reelsWithProducts = DEMO_COLLABORATOR_REELS.map((reel) => {
    // If the reel links to the current product, use currentProduct, otherwise find in catalog
    const matched =
      reel.productSlug === currentProduct.slug
        ? currentProduct
        : catalog.find((p) => p.slug === reel.productSlug) ?? currentProduct;
    return {
      ...reel,
      product: matched,
    };
  });

  function scroll(dir: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  function handleAddToCart(p: Product, shadeName?: string) {
    add(p.slug, 1, shadeName ?? p.shades[0]?.name, {
      name: p.name,
      pricePaise: p.pricePaise,
      image: productImage(p),
    });
    setAddedSlug(p.slug);
    setTimeout(() => setAddedSlug(null), 2000);
  }

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }

  function toggleMute() {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  }

  // Manage video playback when modal opens/closes
  useEffect(() => {
    if (activeReel) {
      setIsPlaying(true);
      const vid = videoRef.current;
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }, [activeReel]);

  return (
    <section className="bg-cream-100/70 border-t border-gold-200/60 py-14">
      <div className="container-vel">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-gold-600" />
              <span className="label-caps text-[0.62rem] text-gold-700 tracking-wider">
                Community & Creator Reels
              </span>
            </div>
            <h2 className="mt-1 font-heading font-bold text-2xl sm:text-3xl tracking-[0.04em] text-plum-800">
              VIDEOS BY OUR COLLABORATORS
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-ink-soft max-w-2xl leading-relaxed">
              Watch real tutorials, honest wear-tests, and shade swatches by leading creators.
              Tap any video to watch and shop the exact product featured.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="grid size-9 place-items-center rounded-full border border-gold-300/70 bg-cream-50 text-plum-800 shadow-sm transition-all hover:bg-gold-500 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="grid size-9 place-items-center rounded-full border border-gold-300/70 bg-cream-50 text-plum-800 shadow-sm transition-all hover:bg-gold-500 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Video Cards Reel Row */}
        <div
          ref={carouselRef}
          className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:px-0 sm:gap-5"
        >
          {reelsWithProducts.map((reel) => {
            const isCurrentProduct = reel.product.slug === currentProduct.slug;

            return (
              <div
                key={reel.id}
                className="group relative flex w-[260px] sm:w-[280px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-gold-300/50 bg-[#fffdf9] shadow-[0_4px_16px_rgba(32,8,45,0.08),0_1.5px_4px_rgba(32,8,45,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-[0_12px_28px_rgba(32,8,45,0.16),0_4px_12px_rgba(193,136,62,0.14)]"
              >
                {/* Video Media Area (9:14 Portrait Aspect) */}
                <div
                  onClick={() => setActiveReel(reel)}
                  className="relative aspect-[9/13] w-full cursor-pointer overflow-hidden bg-plum-950 select-none"
                >
                  <video
                    src={`${reel.videoUrl}#t=0.5`}
                    poster={reel.posterUrl}
                    muted
                    loop
                    playsInline
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlays */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

                  {/* Creator Info Tag (Top) */}
                  <div className="absolute left-3 top-3 right-3 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-plum-900/80 backdrop-blur px-2.5 py-1 text-cream-50 shadow-md">
                      <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-gold-400">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reel.creatorAvatar} alt={reel.creatorName} className="size-full object-cover" />
                      </div>
                      <span className="text-[0.7rem] font-semibold tracking-tight truncate max-w-[120px]">
                        {reel.creatorName}
                      </span>
                      <BadgeCheck className="size-3.5 fill-gold-400 text-plum-900 shrink-0" />
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] text-gold-300 backdrop-blur">
                      <Eye className="size-3" />
                      <span>{reel.views}</span>
                    </div>
                  </div>

                  {/* Big Play Button in Center */}
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="grid size-12 place-items-center rounded-full border-2 border-white/90 bg-plum-900/60 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-500 group-hover:border-gold-300">
                      <Play className="ml-1 size-5 fill-white" />
                    </span>
                  </div>

                  {/* Creator Caption on Video */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <p className="line-clamp-2 text-[0.75rem] font-medium leading-snug text-cream-50 drop-shadow">
                      &ldquo;{reel.caption}&rdquo;
                    </p>
                    <span className="mt-1 inline-block text-[0.65rem] text-gold-300/90 font-medium">
                      Tap to watch reel &amp; shop look
                    </span>
                  </div>
                </div>

                {/* Attached Linked Product Shelf */}
                <div className="flex flex-col border-t border-gold-200/70 bg-cream-50/80 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-gold-200/80 bg-white">
                        <Image
                          src={productImage(reel.product)}
                          alt={reel.product.name}
                          fill
                          sizes="48px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0">
                        {isCurrentProduct && (
                          <span className="inline-block rounded-xs bg-gold-600 px-1.5 py-0.2 text-[0.55rem] font-bold uppercase tracking-wider text-white">
                            This Product
                          </span>
                        )}
                        <h4 className="truncate text-xs font-bold text-plum-800 leading-tight">
                          {reel.product.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-ink-soft">
                          {reel.productShade && (
                            <span className="flex items-center gap-1 font-medium truncate">
                              {reel.shadeHex && (
                                <span
                                  className="size-2 rounded-full shrink-0 border border-black/10"
                                  style={{ backgroundColor: reel.shadeHex }}
                                />
                              )}
                              {reel.productShade}
                            </span>
                          )}
                          <span className="font-bold text-plum-800">
                            {inrPaise(reel.product.pricePaise)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <Button
                      onClick={() => handleAddToCart(reel.product, reel.productShade)}
                      size="sm"
                      className="h-8 flex-1 text-[0.68rem] font-medium"
                    >
                      {addedSlug === reel.product.slug ? (
                        <>
                          <Check className="size-3" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="size-3" /> Add to Bag
                        </>
                      )}
                    </Button>
                    <Link
                      href={`/product/${reel.product.slug}`}
                      className="grid h-8 place-items-center rounded-[3px] border border-gold-300/80 bg-white px-2.5 text-[0.68rem] font-semibold text-plum-800 transition-colors hover:border-gold-500 hover:text-gold-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Watch & Shop Reel Modal */}
      {activeReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setActiveReel(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-[850px] flex-col overflow-hidden rounded-2xl bg-plum-950 text-cream-50 shadow-2xl md:flex-row max-h-[92vh] border border-gold-500/30"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveReel(null)}
              aria-label="Close video"
              className="absolute right-3.5 top-3.5 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-cream-50 hover:bg-black/90 transition-colors"
            >
              <X className="size-4" />
            </button>

            {/* Video Player Column (9:16 vertical) */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[250px] sm:min-h-[360px] md:min-h-[560px] max-h-[52vh] md:max-h-[85vh]">
              <video
                ref={videoRef}
                src={activeReel.videoUrl}
                poster={activeReel.posterUrl}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onClick={togglePlay}
                className="size-full max-h-[52vh] md:max-h-[85vh] object-contain cursor-pointer"
              />

              {/* Floating Player Controls */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-white ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              </div>
            </div>

            {/* Creator & Linked Product Info Drawer (Right Side) */}
            <div className="flex w-full md:w-[340px] shrink-0 flex-col justify-between border-t border-gold-400/20 bg-cream-50 p-5 text-plum-900 md:border-t-0 md:border-l overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
              {/* Creator details */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-gold-400 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeReel.creatorAvatar}
                      alt={activeReel.creatorName}
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-heading font-bold text-sm text-plum-800 leading-tight">
                        {activeReel.creatorName}
                      </h3>
                      <BadgeCheck className="size-4 fill-gold-500 text-white" />
                    </div>
                    <p className="text-[0.72rem] text-gold-700 font-medium">{activeReel.creatorHandle}</p>
                    <p className="text-[0.65rem] text-ink-soft">{activeReel.creatorRole}</p>
                  </div>
                </div>

                <div className="mt-3.5 rounded-lg border border-gold-200/60 bg-cream-100/60 p-3">
                  <p className="text-xs text-ink-soft leading-relaxed italic">
                    &ldquo;{activeReel.caption}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-[0.65rem] text-ink-soft/80 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3 text-gold-600" /> {activeReel.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="size-3 text-gold-600 fill-gold-600" /> {activeReel.likes} likes
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Product Box */}
              <div className="mt-5 pt-4 border-t border-gold-200/80">
                <span className="label-caps block text-[0.62rem] font-bold text-gold-700">
                  Featured Linked Product
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-gold-300/70 bg-white p-3 shadow-sm">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-gold-200 bg-cream-50">
                    <Image
                      src={productImage(activeReel.product)}
                      alt={activeReel.product.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-bold text-xs text-plum-800 leading-tight truncate">
                      {activeReel.product.name}
                    </h4>
                    {activeReel.productShade && (
                      <p className="mt-0.5 text-[0.7rem] text-ink-soft flex items-center gap-1">
                        {activeReel.shadeHex && (
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: activeReel.shadeHex }}
                          />
                        )}
                        Shade: <span className="font-medium text-plum-800">{activeReel.productShade}</span>
                      </p>
                    )}
                    <p className="mt-1 font-heading text-sm font-bold text-plum-800">
                      {inrPaise(activeReel.product.pricePaise)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    onClick={() => handleAddToCart(activeReel.product, activeReel.productShade)}
                    className="w-full justify-center"
                  >
                    {addedSlug === activeReel.product.slug ? (
                      <>
                        <Check className="size-4" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="size-4" /> Shop This Product
                      </>
                    )}
                  </Button>
                  <Button
                    href={`/product/${activeReel.product.slug}`}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    View Product Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
