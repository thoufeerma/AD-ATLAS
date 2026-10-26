"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useStore, type CartToastItem } from "@/lib/store";
import { inrPaise } from "@/lib/utils";

const TOAST_DURATION = 4500; // 4.5 seconds

export default function CartNotification() {
  const notification = useStore((s) => s.notification);
  const dismiss = useStore((s) => s.dismissNotification);
  const lines = useStore((s) => s.lines);

  const [activeItem, setActiveItem] = useState<CartToastItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const totalCartCount = lines.reduce((n, l) => n + l.qty, 0);

  // When a new item is added to cart
  useEffect(() => {
    if (!notification) return;

    setActiveItem(notification);
    setIsVisible(true);
    setProgress(100);

    const intervalTime = 50;
    const decrement = (intervalTime / TOAST_DURATION) * 100;

    const timer = setInterval(() => {
      if (isPausedRef.current) return;

      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dismiss();
      setActiveItem(null);
    }, 250);
  };

  if (!activeItem) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="Item added to cart notification"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed top-18 sm:top-22 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[390px] max-w-sm rounded-xl border border-gold-300/40 bg-[#1e0728]/95 backdrop-blur-md shadow-[0_16px_48px_rgba(15,3,20,0.55),0_0_1px_rgba(200,150,60,0.4)] text-cream-50 overflow-hidden transition-all duration-300 ease-out ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-x-6 sm:translate-x-10 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Top status bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Check className="size-3 stroke-[3]" />
          </span>
          <span className="label-caps text-[0.7rem] font-bold tracking-wider text-gold-300">
            Added to Bag
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[0.68rem] text-cream-200/70 font-medium">
            {totalCartCount} {totalCartCount === 1 ? "item" : "items"}
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close notification"
            className="grid size-6 place-items-center rounded-full text-cream-200/70 transition-colors hover:bg-white/10 hover:text-cream-50"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Product snippet */}
      <div className="flex items-center gap-3.5 p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-gold-300/25 bg-cream-100/10 shadow-xs">
          {activeItem.image ? (
            <Image
              src={activeItem.image}
              alt={activeItem.name ?? "Product image"}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-plum-900/60">
              <ShoppingBag className="size-6 text-gold-400" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-heading text-[0.88rem] sm:text-[0.92rem] font-semibold leading-snug text-cream-50 line-clamp-2">
            {activeItem.name || activeItem.slug}
          </h4>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.72rem] text-cream-200/80">
            {activeItem.shade && (
              <span className="inline-flex items-center gap-1 font-medium text-gold-200">
                Shade: <span className="text-white font-semibold">{activeItem.shade}</span>
              </span>
            )}
            <span className="text-cream-200/70">Qty: {activeItem.qty}</span>
            {activeItem.pricePaise != null && activeItem.pricePaise > 0 && (
              <span className="font-price font-bold text-gold-300">
                {inrPaise(activeItem.pricePaise * activeItem.qty)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 bg-black/20 px-4 py-3">
        <Link
          href="/cart"
          onClick={handleClose}
          className="inline-flex items-center justify-center rounded-md border border-gold-300/40 bg-white/5 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-cream-100 transition-all hover:bg-white/10 hover:text-white text-center"
        >
          View Cart
        </Link>
        <Link
          href="/checkout"
          onClick={handleClose}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-gold-500 to-gold-600 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99] text-center"
        >
          Checkout <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Auto-dismiss Countdown Progress Bar */}
      <div className="h-[2.5px] w-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
}
