"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  offer: {
    code: string;
    percent: number;
    firstOrderOnly: boolean;
  };
  className?: string;
}

function Flare({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute select-none text-[#fffbe6] drop-shadow-[0_0_8px_rgba(255,240,180,0.95)] drop-shadow-[0_0_16px_rgba(225,170,60,0.85)]",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
        <path d="M12 0 L13.5 9.5 L24 12 L13.5 14.5 L12 24 L10.5 14.5 L0 12 L10.5 9.5 Z" />
      </svg>
    </span>
  );
}

export default function IntroductoryOfferMedallion({ offer, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Click to copy coupon code ${offer.code}`}
      className={cn(
        "group relative select-none cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 text-center focus:outline-none",
        className
      )}
    >
      {/* Outer 3D Polished Metallic Gold Ring */}
      <div className="relative size-[165px] sm:size-[178px] xl:size-[192px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#94611d] via-[#f7e2a4] via-[#dfb24e] to-[#7f4a13] shadow-[0_14px_32px_rgba(0,0,0,0.55),0_0_14px_rgba(212,175,55,0.25)]">
        
        {/* Subtle Outer Ring Glints / Flares */}
        <Flare className="top-[9%] left-[9%] size-3 sm:size-3.5 -translate-x-1/2 -translate-y-1/2" />
        <Flare className="bottom-[13%] right-[8%] size-2.5 sm:size-3 translate-x-1/2 translate-y-1/2 opacity-90" />
        <Flare className="bottom-[3%] left-[45%] size-2 sm:size-2.5 opacity-80" />

        {/* Inner Velvet Plum Disc with Radial Depth */}
        <div className="relative size-full rounded-full bg-[radial-gradient(circle_at_center,_#3e0a37_0%,_#280424_55%,_#170116_100%)] flex flex-col items-center justify-center px-3 py-2 overflow-hidden">
          
          {/* Concentric Inner Hairline Gold Ring */}
          <div className="pointer-events-none absolute inset-[4px] rounded-full border border-[#d4af37]/45" />

          {/* Top Line: INTRODUCTORY OFFER */}
          <p className="font-heading text-[0.40rem] sm:text-[0.43rem] xl:text-[0.46rem] font-semibold uppercase tracking-[0.13em] text-[#edd5a6]">
            INTRODUCTORY OFFER
          </p>

          {/* Top Ornamental Star Divider */}
          <div className="flex items-center justify-center gap-1 w-[58%] my-0.5 opacity-90">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/80 to-[#d4af37]" />
            <span className="text-[#f5e6c8] text-[0.38rem] select-none leading-none">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/80 to-[#d4af37]" />
          </div>

          {/* Giant Discount Numeral with Metallic Gold Gradient and Flare */}
          <div className="relative flex flex-col items-center leading-none select-none">
            {/* Number 1 Shoulder Sparkle */}
            <Flare className="top-0.5 left-0 size-2.5 sm:size-3" />

            <span
              className="text-[2.65rem] sm:text-[2.9rem] xl:text-[3.15rem] font-normal tracking-tight leading-[0.85] bg-gradient-to-b from-[#fffbe8] via-[#e8b654] via-[#dba23b] to-[#996214] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {offer.percent}%
            </span>

            {/* OFF */}
            <span
              className="text-[1.15rem] sm:text-[1.25rem] xl:text-[1.35rem] font-normal tracking-[0.06em] leading-[0.9] uppercase bg-gradient-to-b from-[#fffbe8] via-[#e8b654] to-[#996214] bg-clip-text text-transparent -mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              OFF
            </span>
          </div>

          {/* Middle Line: ON YOUR FIRST ORDER */}
          <p className="font-heading text-[0.36rem] sm:text-[0.39rem] xl:text-[0.42rem] font-semibold uppercase tracking-[0.12em] text-[#edd5a6] mt-0.5">
            {offer.firstOrderOnly ? "ON YOUR FIRST ORDER" : "ON YOUR ORDER"}
          </p>

          {/* Bottom Ornamental Star Divider */}
          <div className="flex items-center justify-center gap-1 w-[58%] my-0.5 opacity-90">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/80 to-[#d4af37]" />
            <span className="text-[#f5e6c8] text-[0.38rem] select-none leading-none">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#d4af37]/80 to-[#d4af37]" />
          </div>

          {/* Bottom Coupon Pill: CODE: VEL10 */}
          <div className="mt-0.5 px-2.5 py-0.5 rounded-full border border-[#d4af37]/80 bg-[#160216]/70 flex items-center justify-center gap-1 shadow-inner">
            <span className="font-heading text-[0.4rem] sm:text-[0.44rem] font-medium tracking-[0.1em] text-[#edd5a6]">
              CODE:
            </span>
            <span className="font-heading text-[0.52rem] sm:text-[0.56rem] font-bold tracking-[0.08em] text-[#ffe6a4] drop-shadow-[0_1px_3px_rgba(255,230,164,0.4)]">
              {offer.code}
            </span>
          </div>

          {/* Copied Feedback Overlay */}
          {copied && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-plum-950/95 backdrop-blur-md animate-in fade-in duration-200 border-2 border-gold-400 shadow-2xl z-30">
              <span className="font-heading text-[0.65rem] font-bold uppercase tracking-widest text-gold-300">
                COPIED!
              </span>
            </div>
          )}

        </div>
      </div>
    </button>
  );
}
