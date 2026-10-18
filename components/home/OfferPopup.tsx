"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, Copy, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { cn, looksLikeEmail } from "@/lib/utils";

const STORAGE_KEY = "velastia_offer_popup_dismissed_until";

interface OfferPopupProps {
  welcomeOffer?: {
    code: string;
    percent: number;
    firstOrderOnly: boolean;
    minOrderPaise: number;
  } | null;
}

export default function OfferPopup({ welcomeOffer }: OfferPopupProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Discount percentage and coupon code from settings or defaults matching Velastia's brand
  const percent = welcomeOffer?.percent ?? 10;
  const couponCode = welcomeOffer?.code ?? "VEL10";

  // Check if popup should open with a smooth 3-second delay
  useEffect(() => {
    const isDev = process.env.NODE_ENV !== "production";
    
    // In dev, clear any previous dismissal lock so refreshing displays the popup
    if (isDev) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }

    const dismissedUntil = isDev ? null : localStorage.getItem(STORAGE_KEY);
    const isForcePreview = typeof window !== "undefined" && window.location.search.includes("popup=true");
    const isNoPopup = typeof window !== "undefined" && window.location.search.includes("nopopup=1");

    if (isNoPopup || (!isDev && !isForcePreview && dismissedUntil && Number(dismissedUntil) > Date.now())) {
      return;
    }

    // 1.6s delay: comfortable and prompt without waiting too long
    const timer = setTimeout(() => {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const closePopup = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
    }, 500);

    // Dismiss for 24 hours on close (in production)
    if (process.env.NODE_ENV === "production") {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          String(Date.now() + 24 * 60 * 60 * 1000)
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isMounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, closePopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!looksLikeEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setStatus("loading");

    try {
      await api("POST", "/newsletter", {
        email: email.trim(),
        source: "popup",
      });
      setStatus("success");
      // Dismiss for 30 days after successful subscription
      try {
        localStorage.setItem(
          STORAGE_KEY,
          String(Date.now() + 30 * 24 * 60 * 60 * 1000)
        );
      } catch {
        // Ignore storage errors
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setStatus("idle");
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-plum-950/80 backdrop-blur-md transition-opacity duration-700 ease-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={(e) => {
        // Close when clicking the outer backdrop
        if (e.target === e.currentTarget) closePopup();
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-[780px] max-h-[92vh] overflow-y-auto rounded-[20px] bg-gradient-to-br from-[#260c33] via-[#1d0829] to-[#14041e] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] border border-gold-400/40 flex flex-col md:flex-row transition-all duration-700 ease-out transform",
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-[0.96]"
        )}
      >
        
        {/* Circular Close Button (X) */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close offer popup"
          className="absolute top-3 right-3 z-30 size-11 rounded-full bg-plum-950/85 text-cream-100 border border-gold-400/40 shadow-lg flex items-center justify-center hover:bg-plum-900 hover:text-gold-300 hover:border-gold-300 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
        >
          <X className="size-5 stroke-[2.2]" />
        </button>

        {/* Left Column: Form & Offer Copy */}
        <div className="w-full md:w-[52%] flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-10 md:px-10 md:py-12 text-center">
          {status !== "success" ? (
            <>
              {/* Gold Eyebrow - Jost */}
              <div className="flex items-center justify-center gap-2 mb-2.5">
                <span className="text-gold-400/70 text-[0.65rem] select-none">✦</span>
                <p className="text-[0.68rem] font-heading font-semibold uppercase tracking-[0.24em] text-gold-400">
                  Introductory Privilege
                </p>
                <span className="text-gold-400/70 text-[0.65rem] select-none">✦</span>
              </div>

              {/* Headline with Jost font */}
              <h2
                id="popup-title"
                className="font-heading text-[2.2rem] sm:text-[2.5rem] md:text-[2.75rem] font-bold leading-[1.1] tracking-[-0.01em] text-cream-50"
              >
                Limited Time
                <span className="block text-gold-300 font-bold mt-1">
                  {percent}% Off
                </span>
              </h2>

              {/* Subtitle with Jost font */}
              <p className="mt-3.5 text-[0.88rem] sm:text-[0.92rem] font-heading font-normal leading-relaxed text-cream-200/85 max-w-[320px] mx-auto">
                Subscribe to receive updates on new arrivals, special offers and other discounts.
              </p>

              {/* Email Form */}
              <form onSubmit={handleSubmit} noValidate className="mt-6 w-full max-w-[320px] mx-auto space-y-3">
                <div>
                  <label htmlFor="popup-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="popup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={status === "loading"}
                    className="w-full h-11 sm:h-12 px-4 rounded-sm border border-gold-500/40 bg-plum-950/70 text-cream-50 placeholder:text-cream-200/40 text-[0.92rem] focus:outline-none focus:border-gold-300 focus:ring-1 focus:ring-gold-300/40 transition-all shadow-inner"
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-rose-300 font-medium text-left">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-11 sm:h-12 rounded-sm bg-[#20082d] hover:bg-[#2c0c3d] text-cream-50 border border-gold-400/50 font-heading font-semibold text-[0.76rem] tracking-[0.16em] uppercase transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-white" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>

              {/* Legal Disclaimer */}
              <p className="mt-5 text-[0.62rem] sm:text-[0.65rem] leading-[1.45] text-cream-300/60 max-w-[320px] mx-auto">
                By clicking the button below, you agree to receive recurring automated marketing text msgs (e.g. cart reminders) which may be automated, to the email provided at opt-in from Velastia. Consent is not a condition of purchase. Msg frequency may vary. Msg &amp; data rates may apply.
                <br />
                See{" "}
                <Link
                  href="/terms"
                  onClick={closePopup}
                  className="text-gold-300/90 underline hover:text-gold-200 transition-colors"
                >
                  Terms and Conditions
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  onClick={closePopup}
                  className="text-gold-300/90 underline hover:text-gold-200 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ) : (
            /* Success State */
            <div className="py-4 space-y-4 max-w-[320px] mx-auto animate-in fade-in duration-300">
              <div className="size-12 mx-auto rounded-full bg-gold-500/15 border border-gold-400/60 flex items-center justify-center text-gold-300">
                <Check className="size-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-heading text-[1.85rem] font-semibold text-cream-50">
                  You&apos;re On The List
                </h3>
                <p className="mt-1.5 text-xs text-cream-200/80 leading-relaxed">
                  Use your exclusive coupon code at checkout to claim your {percent}% off:
                </p>
              </div>

              {/* Coupon Box */}
              <div className="flex items-center justify-between rounded-md border border-dashed border-gold-400/80 bg-plum-950/80 p-3.5 shadow-inner">
                <div className="text-left">
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-gold-400 block">
                    Coupon Code
                  </span>
                  <span className="font-mono text-base font-bold text-cream-50">
                    {couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-gold-600 hover:bg-gold-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-white" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href="/shop"
                onClick={closePopup}
                className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-sm bg-gold-600 hover:bg-gold-500 text-white font-heading font-semibold text-[0.76rem] tracking-[0.16em] uppercase transition-all shadow-[0_4px_16px_rgba(193,136,62,0.3)] cursor-pointer"
              >
                <span>Start Shopping</span>
                <ArrowRight className="size-4 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Editorial Beauty Portrait Image */}
        <div className="relative w-full md:w-[48%] aspect-[16/10] sm:aspect-video md:aspect-auto md:min-h-[480px] bg-plum-950">
          <Image
            src="/images/popup-model.jpg"
            alt="Velastia luxury beauty model showcasing cosmetics with radiant glowing skin"
            fill
            sizes="(min-width: 768px) 380px, 100vw"
            priority
            className="object-cover object-center"
          />
          {/* Subtle blend vignette on the edge to merge with the deep plum left panel */}
          <div className="hidden md:block pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#1d0829] to-transparent" />
        </div>

      </div>
    </div>
  );
}
