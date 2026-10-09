"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useRef, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Check,
  Package,
  Truck,
  Home,
  ClipboardCheck,
  MapPin,
  CreditCard,
  BadgeCheck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { Product } from "@/lib/api/types";
import { inrPaise, productImage } from "@/lib/utils";
import { LAST_ORDER_KEY, type LastOrder } from "./lastOrder";
import { useAccount } from "@/lib/account";
import { ScriptHeart } from "@/components/ui/Ornament";

const TRACKER = [
  { Icon: ClipboardCheck, title: "Order Confirmed", note: "We've received your order" },
  { Icon: Package, title: "Processing", note: "We're preparing your items" },
  { Icon: Truck, title: "On The Way", note: "Your order is on the way" },
  { Icon: Home, title: "Delivered", note: "Enjoy your Velastia beauty" },
];

const METHOD_LABEL: Record<string, string> = {
  UPI: "UPI",
  CARD: "Credit / Debit Card",
  NETBANKING: "Net Banking",
  WALLET: "Wallet",
  COD: "Cash on Delivery",
};

const subscribe = () => () => {};
const readOrder = () => {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
};

export default function OrderSuccess({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const { shipping } = useSettings();
  const [copied, setCopied] = useState(false);
  const me = useAccount((s) => s.me);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const number = params.get("order") ?? "";

  const raw = useSyncExternalStore(subscribe, readOrder, () => null);
  const saved = useMemo<LastOrder | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as LastOrder;
      return parsed.order?.number === number ? parsed : null;
    } catch {
      return null;
    }
  }, [raw, number]);

  const order = saved?.order;
  const isCod = order?.paymentMethod === "COD";
  const itemCount = order?.items.reduce((n, l) => n + l.quantity, 0) ?? 0;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const placedAt = order
    ? new Date(order.placedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + " | " + new Date(order.placedAt).toLocaleString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    : "";

  const suggestions = products.filter((p) => p.status === "ACTIVE" && p.inStock).slice(0, 5);

  const assurances = [
    { Icon: BadgeCheck, title: "100% Authentic", note: "Products" },
    { Icon: RotateCcw, title: "Easy Returns", note: "& Refunds" },
    { Icon: ShieldCheck, title: "Secure Payments", note: "Razorpay" },
    shipping?.freeAbovePaise != null
      ? { Icon: Truck, title: "Free Shipping", note: `Above ${inrPaise(shipping.freeAbovePaise)}` }
      : { Icon: Truck, title: "Fast Shipping", note: "Across India" },
  ];

  function copyNumber() {
    navigator.clipboard?.writeText(number).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const trackHref = number ? `/track-order?order=${encodeURIComponent(number)}` : "/track-order";

  return (
    <div className="bg-[#fcf9f5] w-full min-h-screen font-sans text-[#240b25]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-16 pb-32 overflow-hidden">
        {/* Confetti / Flowers Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <Image src="/images/order success hero image.png" alt="Decor" fill priority className="object-cover object-top" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-4">
           <div className="size-16 lg:size-20 rounded-full border-[2.5px] border-[#1ea838] flex items-center justify-center bg-white mb-5 shadow-sm">
             <Check strokeWidth={2.5} className="text-[#1ea838] size-8 lg:size-10" />
           </div>
           <h1 className="font-serif font-bold text-[3rem] lg:text-[3.8rem] text-[#240b25] leading-tight tracking-wide mb-1.5">
             Thank You!
           </h1>
           <div className="flex items-center justify-center gap-2 mb-5">
             <p className="font-script text-[2rem] lg:text-[2.5rem] text-[#240b25]">Your order has been placed successfully.</p>
             <ScriptHeart className="w-5 h-5 lg:w-7 lg:h-7 text-[#c8963c] mt-2" />
           </div>
           <p className="text-[0.95rem] lg:text-[1rem] font-medium text-[#240b25]/80 mb-10 max-w-lg">
             We've received your order and it's now being processed.<br/>You will receive an email confirmation shortly.
           </p>

           {number && (
             <div className="bg-[#fdfbf9] border border-[#eaddce] rounded-xl px-12 py-6 shadow-sm flex flex-col items-center min-w-[280px]">
               <p className="text-[0.75rem] font-bold uppercase tracking-widest text-[#240b25]/80 mb-1.5">Order Number</p>
               <div className="flex items-center gap-3 mb-1.5">
                 <span className="font-bold text-[1.5rem] lg:text-[1.8rem] tracking-wide text-[#240b25]">#{number}</span>
                 <button onClick={copyNumber} className="text-[#240b25]/50 hover:text-[#240b25] transition-colors pb-1" title="Copy Order Number">
                   {copied ? <Check size={20} /> : <Copy size={20} />}
                 </button>
               </div>
               {placedAt && <p className="text-[0.85rem] font-medium text-[#240b25]/70">{placedAt}</p>}
             </div>
           )}
        </div>
      </section>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="max-w-[1250px] mx-auto px-6 pb-20 relative -mt-16">
        
        {/* Floating Tracker Box */}
        <section className="mb-14">
          <div className="bg-white rounded-xl shadow-sm py-6 px-8 lg:px-12 flex flex-col lg:flex-row justify-between items-center gap-6 relative w-full mx-auto z-20 border border-[#eaddce]/40">
            {TRACKER.map(({ Icon, title, note }, i) => (
              <div key={title} className="flex items-center gap-3">
                <div className="size-12 rounded-full border-[1.5px] border-[#c8963c] flex items-center justify-center shrink-0 bg-white">
                  <Icon className="size-[1.35rem] text-[#c8963c]" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[0.9rem] text-[#240b25]">{title}</span>
                  <span className="text-[0.75rem] font-medium text-[#240b25]/70">{note}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* Order Details Box */}
            <div className="bg-[#fdfbf9] border border-[#eaddce] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 lg:p-8 flex items-start gap-4 border-b border-[#eaddce]">
                <ClipboardCheck className="size-8 text-[#240b25] shrink-0 mt-1" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <h2 className="font-serif font-medium text-[1.5rem] text-[#240b25] mb-1.5">Order Details</h2>
                  {saved ? (
                    <p className="text-[0.9rem] font-medium text-[#240b25]/70">
                      We'll send shipping and delivery updates to<br/>
                      <span className="font-bold text-[#240b25]">{saved.email}</span>
                    </p>
                  ) : (
                    <p className="text-[0.9rem] font-medium text-[#240b25]/70">
                      Track this order any time with your order number and the email you used.
                    </p>
                  )}
                </div>
              </div>
              
              {saved && (
                <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Delivery Address */}
                  <div className="flex gap-3">
                    <MapPin className="size-5 text-[#240b25]/60 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex flex-col">
                      <h3 className="font-black text-[1.05rem] text-[#240b25] mb-2">Delivery Address</h3>
                      <p className="text-[0.85rem] font-medium leading-relaxed text-[#240b25]/80">
                        {saved.address.name}
                        <br />
                        {saved.address.line1}
                        {saved.address.line2 && <><br />{saved.address.line2}</>}
                        <br />
                        {saved.address.city}, {saved.address.state} – {saved.address.pincode}
                        <br />
                        India
                        <br />
                        {saved.address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping & Payment */}
                  <div className="flex flex-col gap-8">
                    <div className="flex gap-3">
                      <Truck className="size-5 text-[#240b25]/60 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="flex flex-col">
                        <h3 className="font-black text-[1.05rem] text-[#240b25] mb-2">Shipping Method</h3>
                        <p className="text-[0.85rem] font-medium leading-relaxed text-[#240b25]/80">
                          {saved.order.shippingMethod ?? "Standard Shipping"}<br/>
                          3 – 5 Business Days<br/>
                          {saved.order.shippingPaise === 0 ? "(Free Shipping)" : inrPaise(saved.order.shippingPaise)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <CreditCard className="size-5 text-[#240b25]/60 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="flex flex-col w-full">
                        <h3 className="font-black text-[1.05rem] text-[#240b25] mb-2">Payment Method</h3>
                        <div className="flex items-center justify-between w-full">
                          <p className="text-[0.85rem] font-medium leading-relaxed text-[#240b25]/80">
                            Paid via Razorpay<br/>
                            {METHOD_LABEL[saved.order.paymentMethod] ?? saved.order.paymentMethod}
                          </p>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 w-auto object-contain opacity-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* What's Next Box */}
            <div className="bg-[#f5eeed] rounded-2xl p-8 shadow-sm flex items-center justify-between overflow-hidden relative">
              <div className="flex flex-col relative z-10 max-w-[65%]">
                <h3 className="font-serif font-medium text-[1.5rem] text-[#240b25] mb-2">What's Next?</h3>
                <p className="text-[0.85rem] font-medium text-[#240b25]/80 mb-6 leading-relaxed pr-2">
                  You will receive an email & SMS with your order details and tracking link once your order is shipped.
                </p>
                <div className="flex flex-col items-start gap-4">
                  <Link href={trackHref}>
                    <button className="bg-[#240b25] text-white flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold uppercase tracking-widest text-[0.75rem] hover:bg-[#3a133d] transition-colors shadow-md">
                      <Truck size={16} strokeWidth={2} /> TRACK YOUR ORDER
                    </button>
                  </Link>
                  <Link href="/shop" className="text-[0.85rem] font-bold text-[#240b25] hover:text-[#c8963c] transition-colors flex items-center gap-1">
                    Continue Shopping <ChevronRight size={14} strokeWidth={3} />
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 h-full w-[35%] flex items-end justify-end pointer-events-none">
                <img src="https://placehold.co/400x400/f5eeed/240b25?text=Shopping+Bag" alt="Bag" className="object-cover h-[130%] object-bottom mix-blend-multiply" />
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="bg-[#fdfbf9] border border-[#eaddce] rounded-2xl p-6 lg:p-8 shadow-sm h-fit">
            <h2 className="font-serif font-medium text-[1.5rem] text-[#240b25] mb-6 flex items-center gap-2.5">
              <Package size={22} strokeWidth={2} className="text-[#240b25]" /> Order Summary
            </h2>
            
            {order ? (
              <>
                {/* Items */}
                <div className="flex flex-col gap-5 mb-6">
                  {order.items.map((l, i) => {
                    const p = l.slug ? bySlug.get(l.slug) : undefined;
                    return (
                      <div key={`${l.slug ?? l.name}-${l.shade ?? ""}-${i}`} className="flex items-center gap-4">
                        <div className="size-16 rounded-lg bg-[#f4ece4] overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-[#eaddce]/50">
                          {p && <img src={productImage(p)} alt={p.name} className="w-[85%] h-[85%] object-cover" />}
                        </div>
                        <div className="flex flex-col flex-1">
                          <h4 className="font-sans font-bold text-[#240b25] text-[0.9rem] mb-0.5">{l.name}</h4>
                          <p className="text-[0.8rem] font-medium text-[#240b25]/60 mb-0.5">
                            {[l.shade, p?.size].filter(Boolean).join(" · ")}
                          </p>
                          <p className="text-[0.8rem] font-medium text-[#240b25]/60">Qty: {l.quantity}</p>
                        </div>
                        <div className="font-bold text-[#240b25] text-[1rem]">
                          {inrPaise(l.lineTotalPaise)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="w-full border-t border-[#eaddce] mb-5"></div>

                {/* Subtotals */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-bold text-[#240b25]">{inrPaise(order.subtotalPaise)}</span>
                  </div>
                  {order.discountPaise > 0 && (
                    <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                      <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                      <span className="font-bold text-[#1ea838]">– {inrPaise(order.discountPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                    <span>Shipping</span>
                    <span className="font-bold text-[#1ea838]">
                      {order.shippingPaise === 0 ? "FREE" : inrPaise(order.shippingPaise)}
                    </span>
                  </div>
                </div>

                <div className="w-full border-t border-[#eaddce] mb-6"></div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-serif font-medium text-[#240b25] text-[1.4rem]">
                      {isCod ? "Pay on Delivery" : "Total Paid"}
                    </span>
                    <span className="text-[0.75rem] font-medium text-[#240b25]/60">(Inclusive of all taxes)</span>
                  </div>
                  <span className="font-bold text-[#240b25] text-[1.8rem]">{inrPaise(order.totalPaise)}</span>
                </div>
              </>
            ) : (
              <p className="text-[0.9rem] font-medium text-[#240b25]/70">
                Your itemised summary is on the <Link href={trackHref} className="font-bold underline hover:text-[#c8963c]">Track Order</Link> page.
              </p>
            )}
          </div>

        </div>

        {/* 3. ASSURANCES BANNER */}
        <section className="mt-12 bg-[#fdf2ee] rounded-2xl overflow-hidden relative shadow-sm border border-[#eaddce]/40 py-8 px-10">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image src="/images/You're One Step Closer to Flawless Beauty banner.png" alt="Banner Background" fill className="object-cover object-center" />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col">
              <h2 className="font-serif font-medium text-[2rem] lg:text-[2.2rem] text-[#240b25] leading-tight mb-2">
                You're One Step Closer<br/>to Flawless Beauty!
              </h2>
              <div className="flex items-end gap-2">
                <p className="text-[0.95rem] font-medium text-[#240b25]/80 leading-relaxed">
                  Thank you for choosing Velastia.<br/>We can't wait for you to experience the magic.
                </p>
                <ScriptHeart className="w-5 h-5 text-[#c8963c] mb-1" />
              </div>
            </div>
            
            <div className="flex flex-wrap lg:flex-nowrap justify-center gap-8 lg:gap-12 bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/50">
              {assurances.map(({ Icon, title, note }) => (
                <div key={title} className="flex flex-col items-center text-center max-w-[80px]">
                  <Icon className="size-7 text-[#c8963c] mb-2.5" strokeWidth={1.5} />
                  <span className="font-bold text-[#240b25] text-[0.75rem] leading-tight mb-1">{title}</span>
                  <span className="text-[0.7rem] font-medium text-[#240b25]/60 leading-tight">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. YOU MAY ALSO LOVE (SUGGESTIONS) */}
        {suggestions.length > 0 && (
          <section className="mt-20 relative">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-medium text-[2rem] text-[#240b25] text-center w-full">
                You May Also Love
              </h2>
            </div>
            
            {/* Arrows */}
            <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 size-10 rounded-full border border-[#eaddce] bg-white text-[#240b25] flex items-center justify-center hover:bg-[#fcf9f5] transition-colors z-10 shadow-sm hidden lg:flex">
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 size-10 rounded-full border border-[#eaddce] bg-white text-[#240b25] flex items-center justify-center hover:bg-[#fcf9f5] transition-colors z-10 shadow-sm hidden lg:flex">
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>

            <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-5 pb-4">
              {suggestions.map((p) => (
                <div key={p.slug} className="min-w-[160px] w-[45%] sm:w-[30%] lg:w-[calc(20%-16px)] shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            
            {/* Pagination Dots (Placeholder for UI) */}
            <div className="flex items-center justify-center gap-2 mt-10">
              <div className="size-2 rounded-full bg-[#c8963c]"></div>
              <div className="size-2 rounded-full bg-[#240b25]/20"></div>
              <div className="size-2 rounded-full bg-[#240b25]/20"></div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
