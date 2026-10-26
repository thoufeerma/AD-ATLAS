"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Tag, Gift, ShieldCheck, Sparkles, Check, Copy } from "lucide-react";

interface OfferItem {
  id: string;
  text: string;
  code?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: "free-shipping",
    text: "FREE SHIPPING ON ORDERS ABOVE ₹999",
    href: "/shop",
    icon: Truck,
  },
  {
    id: "vel10",
    text: "10% OFF ON FIRST ORDER – USE CODE:",
    code: "VEL10",
    icon: Tag,
  },
  {
    id: "complimentary-samples",
    text: "COMPLIMENTARY LUXURY SAMPLES WITH EVERY ORDER",
    href: "/shop",
    icon: Gift,
  },
  {
    id: "cod-available",
    text: "CASH ON DELIVERY AVAILABLE ACROSS INDIA",
    href: "/shipping",
    icon: ShieldCheck,
  },
  {
    id: "clean-beauty",
    text: "100% CLEAN, VEGAN & DERMATOLOGICALLY TESTED",
    href: "/about",
    icon: Sparkles,
  },
];

export default function AnnouncementBar({
  announcements = [],
  socials = null,
}: {
  announcements?: string[];
  socials?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  // Helper to ensure promotional spacing (e.g. 10% OFF, CODE: VEL10)
  const normalizePromo = (t: string) =>
    t
      .replace(/10%OFF/gi, "10% OFF")
      .replace(/(\d+%)OFF/gi, "$1 OFF")
      .replace(/CODE:([A-Za-z0-9]+)/g, "CODE: $1");

  // Combine backend announcements with default offers while deduplicating
  const baseOffers: OfferItem[] = DEFAULT_OFFERS.map((o) => ({
    ...o,
    text: normalizePromo(o.text),
  }));

  if (announcements && announcements.length > 0) {
    announcements.forEach((ann, idx) => {
      const trimmed = normalizePromo(ann.trim());
      const exists = baseOffers.some(
        (o) =>
          o.text.toLowerCase().includes(trimmed.toLowerCase()) ||
          trimmed.toLowerCase().includes(o.text.toLowerCase())
      );
      if (!exists && trimmed) {
        baseOffers.push({
          id: `custom-${idx}`,
          text: trimmed,
          icon: Sparkles,
        });
      }
    });
  }

  // Duplicate offers 2 times per track to ensure it spans across even wide 4K screens
  const trackOffers = [...baseOffers, ...baseOffers];

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Render a single continuous track
  const renderTrack = (ariaHidden: boolean = false) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-8 py-1 animate-marquee-slide"
    >
      {trackOffers.map((offer, idx) => {
        const IconComponent = offer.icon;
        return (
          <div
            key={`${offer.id}-${idx}-${ariaHidden ? "clone" : "orig"}`}
            className="flex items-center gap-2 whitespace-nowrap font-heading text-[0.66rem] font-bold uppercase tracking-[0.12em] text-cream-200/95"
          >
            {IconComponent && (
              <IconComponent className="size-3 text-gold-400 shrink-0" />
            )}

            {offer.href ? (
              <Link
                href={offer.href}
                className="hover:text-gold-300 transition-colors cursor-pointer"
              >
                {offer.text}
              </Link>
            ) : (
              <span>{offer.text}</span>
            )}

            {offer.code && (
              <button
                type="button"
                onClick={(e) => handleCopyCode(e, offer.code!)}
                title="Click to copy coupon code"
                className="group/btn relative ml-1 inline-flex items-center gap-1 rounded border border-gold-400/50 bg-gold-500/15 px-1.5 py-0.5 text-[0.62rem] font-bold text-gold-300 hover:bg-gold-500/25 hover:border-gold-300 transition-all cursor-pointer"
              >
                <span>{copied ? "COPIED!" : offer.code}</span>
                {copied ? (
                  <Check className="size-2.5 text-gold-300" />
                ) : (
                  <Copy className="size-2.5 text-gold-400 opacity-70 group-hover/btn:opacity-100" />
                )}
              </button>
            )}

            {/* Gold separator */}
            <span className="ml-6 text-gold-400/60 select-none text-[0.65rem]">✦</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative group bg-[#20082d] text-cream-100 border-b border-[#20082d] overflow-hidden">
      <div className="flex h-9 items-center justify-between">
        
        {/* Continuous Infinite Sliding Marquee Track */}
        <div
          className="relative flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]"
          title="Hover to pause offers"
        >
          <div className="flex w-max">
            {/* Track 1 */}
            {renderTrack(false)}
            {/* Track 2 (Seamless loop duplicate) */}
            {renderTrack(true)}
          </div>
        </div>

        {/* Social Profiles on Desktop */}
        {socials && (
          <div className="hidden lg:flex items-center gap-3 text-gold-300 pr-6 pl-4 shrink-0 bg-[#20082d] z-10 border-l border-white/10">
            {socials}
          </div>
        )}
      </div>
    </div>
  );
}
