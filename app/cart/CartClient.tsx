"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ArrowLeft, Minus, Plus, X, 
  ShieldCheck, RefreshCcw, Lock, Truck, Heart, 
  Leaf, Ban, PawPrint, Star, Tag, ChevronLeft
} from 'lucide-react';
import { ScriptHeart } from "@/components/ui/Ornament";
import { useStore, useHydrated, MAX_QTY } from "@/lib/store";
import { resolveCart, quoteItems, useQuote } from "@/lib/cart";
import { inr } from "@/lib/utils";
import type { Product, Review } from "@/lib/api/types";
import Link from 'next/link';
import { Visa, Mastercard, Upi, Paytm, Razorpay } from "@/components/ui/PaymentLogos";

export function CartClient({ products, reviews }: { products: Product[], reviews: Review[] }) {
  const hydrated = useHydrated();
  const { lines, add, setQty, remove, coupon, setCoupon, removeCoupon } = useStore();
  const [couponInput, setCouponInput] = useState(coupon || "");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const baseOffers = [
    { title: "Complimentary gift on orders above ₹1,999", desc: "Luxury deserves a little extra. Treat yourself!", bgImg: "/images/Complimentary gift on orders your cart.png" },
    { title: "Complimentary gift on orders above ₹1,999", desc: "Luxury deserves a little extra. Treat yourself! (2)", bgImg: "/images/Complimentary gift on orders your cart.png" },
    { title: "Complimentary gift on orders above ₹1,999", desc: "Luxury deserves a little extra. Treat yourself! (3)", bgImg: "/images/Complimentary gift on orders your cart.png" }
  ];
  
  const offers = [...baseOffers, baseOffers[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setBannerIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (bannerIndex === baseOffers.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setBannerIndex(0);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [bannerIndex, baseOffers.length]);

  const handlePrevBanner = () => {
    if (bannerIndex === 0) {
      setIsTransitioning(false);
      setBannerIndex(baseOffers.length);
      setTimeout(() => {
        setIsTransitioning(true);
        setBannerIndex(baseOffers.length - 1);
      }, 30);
    } else {
      setIsTransitioning(true);
      setBannerIndex(prev => prev - 1);
    }
  };

  const handleNextBanner = () => {
    setIsTransitioning(true);
    setBannerIndex(prev => prev + 1);
  };

  const rows = hydrated ? resolveCart(lines, products) : [];
  const quoteReq = hydrated && rows.length > 0 ? { items: quoteItems(rows), couponCode: coupon } : null;
  const { quote, error, stale } = useQuote(quoteReq);

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      setCoupon(couponInput);
    } else {
      removeCoupon();
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  // Convert paise to rupee for INR formatting if inr adds ₹ symbol. If not, just use ₹ template.
  const formatMoney = (paise: number) => {
    return "₹" + (paise / 100).toLocaleString("en-IN", {
      minimumFractionDigits: (paise % 100 !== 0) ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-[#fcf9f5] w-full min-h-screen flex flex-col font-sans text-[#240b25]">
      
      {/* 1. CART BANNER SECTION */}
      <section className="w-full pt-8 pb-0 lg:pt-10 lg:pb-0 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto relative rounded-2xl overflow-hidden shadow-sm flex items-center min-h-[220px] lg:min-h-[280px]">
           {/* Background Image */}
           <div className="absolute inset-0 z-0">
              <img src="/images/your cart banner.png" alt="Cart Banner" className="w-full h-full object-cover object-right lg:object-center" />
           </div>
           
           {/* Left Content overlaid on the banner */}
           <div className="relative z-10 w-full lg:w-[50%] flex flex-col py-8 px-8 lg:px-12">
             <div className="flex items-center gap-4 mb-1">
               <h1 className="font-display font-bold text-[3.2rem] lg:text-[4rem] leading-[1.05] text-[#240b25] tracking-tight">
                 Your Cart
               </h1>
               <ScriptHeart className="w-10 h-10 text-[#c8963c] mt-1 shrink-0" />
             </div>
             
             {/* Breadcrumbs */}
             <div className="flex items-center gap-2 text-[0.8rem] text-[#240b25]/70 mb-6 font-medium">
                <Link href="/">Home</Link>
                <ChevronRight size={14} />
                <span className="text-[#240b25]">Cart</span>
             </div>
             
             <p className="text-[1.05rem] lg:text-[1.15rem] text-[#240b25]/80 font-medium max-w-[400px] leading-relaxed">
               Great choices! You're just a step away from <span className="text-[#c8963c] font-bold">flawless beauty.</span>
             </p>
           </div>
        </div>
      </section>

      {/* 2. MAIN CART CONTENT */}
      <section className="w-full pt-4 pb-12 lg:pt-5 lg:pb-12 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-8">
           
           {/* LEFT COLUMN: Cart Items & Badges */}
           <div className="flex flex-col bg-[#fdfbf9] border border-[#eaddce] rounded-xl p-6 lg:p-10 shadow-sm h-fit">
              
              {/* Table Header */}
              <div className="flex items-center w-full pb-5 border-b border-[#eaddce] text-[0.95rem] font-bold uppercase tracking-widest text-[#240b25]/90">
                 <div className="w-[45%]">PRODUCT</div>
                 <div className="w-[15%] text-center">PRICE</div>
                 <div className="w-[20%] text-center">QUANTITY</div>
                 <div className="w-[20%] text-center">TOTAL</div>
              </div>

              {/* Items List */}
              <div className="flex flex-col w-full min-h-[200px]">
                 {!hydrated ? (
                   <div className="py-12 text-center text-[#240b25]/50">Loading your cart...</div>
                 ) : rows.length === 0 ? (
                   <div className="py-12 text-center text-[#240b25]/50 flex flex-col items-center">
                     <p className="mb-4">Your cart is empty.</p>
                     <Link href="/shop">
                       <button className="border border-[#240b25] text-[#240b25] font-bold uppercase tracking-widest text-[0.8rem] py-2 px-6 rounded-md hover:bg-[#240b25] hover:text-white transition-colors">
                          Start Shopping
                       </button>
                     </Link>
                   </div>
                 ) : (
                   rows.map((row, i) => {
                     const isProblem = !!row.problem;
                     const quoteLine = quote?.lines.find(l => l.slug === row.slug && l.shadeName === (row.shade || null));
                     const price = row.product?.pricePaise || 0;
                     const total = quoteLine ? quoteLine.lineTotalPaise : price * row.qty;

                     return (
                       <div key={`${row.slug}-${row.shade}-${i}`} className={`flex items-center w-full py-6 border-b border-[#eaddce] ${isProblem ? 'opacity-50' : ''}`}>
                          <div className="w-[45%] flex items-center gap-4">
                             <div className="size-28 lg:size-32 shrink-0 bg-[#f4ece4] rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                                {row.product?.images[0] ? (
                                  <img src={row.product.images[0].url} alt={row.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={`https://placehold.co/150x150/f4ece4/c8963c?text=Product`} alt={row.slug} className="w-full h-full object-cover" />
                                )}
                             </div>
                             <div className="flex flex-col pr-2">
                                <Link href={`/shop/${row.slug}`}>
                                  <h4 className="font-sans font-medium text-[#240b25] text-[1.1rem] mb-1 hover:text-[#c8963c] transition-colors">
                                    {row.product ? row.product.name : row.slug}
                                  </h4>
                                </Link>
                                <p className="text-[0.75rem] text-[#240b25]/70 font-medium">
                                  {row.product?.descriptor || "Velastia Beauty"}
                                </p>
                                {(row.shade || row.product?.size) && (
                                  <p className="text-[0.75rem] text-[#240b25]/70 font-medium mt-0.5">
                                    {row.shade || row.product?.size}
                                  </p>
                                )}
                                {isProblem && (
                                  <p className="text-[0.7rem] text-red-600 font-bold mt-1">{row.problem}</p>
                                )}
                             </div>
                          </div>
                          
                          <div className="w-[15%] text-center font-bold text-[#240b25] text-[1.15rem]">
                             {formatMoney(price)}
                          </div>
                          
                          <div className="w-[20%] flex flex-col items-center">
                             <div className="flex items-center border border-[#eaddce] rounded-full px-5 py-2 gap-6">
                                <button 
                                  onClick={() => setQty(row.slug, row.shade, row.qty - 1)}
                                  className="text-[#240b25]/50 hover:text-[#240b25] transition-colors disabled:opacity-30"
                                >
                                  <Minus size={14} strokeWidth={2.5} />
                                </button>
                                <span className="text-[1.1rem] font-bold text-[#240b25] min-w-[1.2rem] text-center">{row.qty}</span>
                                <button 
                                  onClick={() => setQty(row.slug, row.shade, row.qty + 1)}
                                  disabled={row.qty >= MAX_QTY}
                                  className="text-[#240b25]/50 hover:text-[#240b25] transition-colors disabled:opacity-30"
                                >
                                  <Plus size={14} strokeWidth={2.5} />
                                </button>
                             </div>
                             <button 
                                onClick={() => remove(row.slug, row.shade)}
                                className="text-[0.75rem] font-medium text-[#240b25]/60 mt-1.5 hover:text-[#240b25] transition-colors"
                             >
                               Remove
                             </button>
                          </div>
                          
                          <div className="w-[15%] text-center font-bold text-[#240b25] text-[1.15rem]">
                             {formatMoney(total)}
                          </div>

                          <div className="w-[5%] flex justify-end">
                             <button 
                                onClick={() => remove(row.slug, row.shade)}
                                className="rounded-full border border-[#eaddce] p-1.5 text-[#240b25]/40 hover:text-[#240b25] hover:border-[#240b25] transition-all"
                             >
                                <X size={14} strokeWidth={2.5} />
                             </button>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>

              {/* Continue Shopping Button */}
              <div className="mt-8 flex justify-start">
                 <Link href="/shop">
                   <button className="flex items-center gap-2 border border-[#240b25] text-[#240b25] font-bold uppercase tracking-widest text-[0.8rem] py-3 px-6 rounded-md hover:bg-[#240b25] hover:text-white transition-colors">
                      <ArrowLeft size={16} /> CONTINUE SHOPPING
                   </button>
                 </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-6 py-5 border-y border-[#eaddce]">
                 {[
                   { icon: ShieldCheck, t1: "100% Authentic", t2: "Products" },
                   { icon: RefreshCcw, t1: "Easy Returns", t2: "& Refunds" },
                   { icon: Lock, t1: "Secure Payments", t2: "Razorpay" },
                   { icon: Truck, t1: "Free Shipping", t2: "Above ₹999" },
                 ].map((badge, i) => (
                   <div key={i} className={`flex items-center gap-3 ${i !== 0 && i !== 2 ? 'lg:border-l border-[#eaddce] lg:pl-6' : ''} ${i === 2 ? 'lg:border-l border-[#eaddce] lg:pl-6' : ''}`}>
                      <div className="size-10 rounded-full border border-[#c8963c]/50 flex items-center justify-center shrink-0">
                         <badge.icon className="text-[#c8963c]" size={18} strokeWidth={1.5} />
                      </div>
                      <p className="text-[0.75rem] font-medium text-[#240b25] leading-snug">
                        {badge.t1}<br/>{badge.t2}
                      </p>
                   </div>
                 ))}
              </div>

              {/* Coupon Code Banner */}
              <div className="mt-6 bg-[#240b25] rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
                 <div className="flex items-center gap-4 w-full lg:w-1/2">
                    <div className="size-12 shrink-0 border border-[#c8963c]/50 rotate-45 rounded flex items-center justify-center">
                       <Tag className="text-[#c8963c] -rotate-45" size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                       <h4 className="font-sans font-bold text-cream-50 text-[1rem]">Have a coupon code?</h4>
                       <p className="text-cream-50/70 text-[0.8rem] mt-0.5 font-medium">Apply your code for instant discounts</p>
                    </div>
                 </div>
                 <div className="flex flex-col w-full lg:w-1/2">
                    <div className="flex items-center gap-3 relative">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon code" 
                        className="w-full bg-transparent border border-cream-50/20 rounded-md py-3 px-4 text-[0.9rem] text-cream-50 placeholder:text-cream-50/40 focus:outline-none focus:border-[#c8963c]"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="bg-[#c8963c] text-white font-bold uppercase tracking-widest text-[0.8rem] py-3 px-8 rounded-md hover:bg-[#a67c30] transition-colors shrink-0"
                      >
                        {coupon ? "REMOVE" : "APPLY"}
                      </button>
                    </div>
                    {error && <p className="text-red-400 text-[0.75rem] mt-2 ml-1">{error}</p>}
                    {quote?.couponError && <p className="text-red-400 text-[0.75rem] mt-2 ml-1">{quote.couponError}</p>}
                    {coupon && !quote?.couponError && !error && <p className="text-green-400 text-[0.75rem] mt-2 ml-1">Coupon applied!</p>}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: Summary & Trust */}
           <div className="flex flex-col gap-8">
              
              {/* Order Summary Box */}
              <div className={`w-full bg-[#fdfbf9] border border-[#eaddce] rounded-xl p-6 lg:p-8 shadow-sm transition-opacity ${stale ? 'opacity-50' : ''}`}>
                 <h3 className="font-serif font-medium text-[1.4rem] lg:text-[1.6rem] text-[#240b25] mb-8">
                   Order Summary
                 </h3>
                 
                 <div className="flex flex-col gap-5 mb-8">
                    <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                       <span>Subtotal ({quote?.itemCount || rows.length} Items)</span>
                       <span className="font-bold text-[#240b25]">{formatMoney(quote?.subtotalPaise || 0)}</span>
                    </div>
                    {quote?.discountPaise ? (
                      <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                         <span>Discount</span>
                         <span className="font-bold text-[#1ea838]">- {formatMoney(quote.discountPaise)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between items-center text-[0.95rem] font-medium text-[#240b25]/80">
                       <span>Shipping</span>
                       <span className="font-bold text-[#1ea838]">
                         {quote?.shippingPaise ? formatMoney(quote.shippingPaise) : "FREE"}
                       </span>
                    </div>
                 </div>

                 {(quote?.discountPaise && quote.discountPaise > 0) ? (
                   <div className="flex justify-between items-center text-[0.95rem] font-medium mb-6">
                      <span className="text-[#1ea838]">You Save</span>
                      <span className="font-bold text-[#1ea838]">{formatMoney(quote.discountPaise)}</span>
                   </div>
                 ) : null}

                 <div className="w-full border-t border-[#eaddce] my-6"></div>

                 <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                       <span className="font-bold text-[#240b25] text-[1.05rem]">Estimated Total</span>
                       <p className="text-[0.7rem] text-[#240b25]/60 font-medium mt-0.5">Inclusive of all taxes</p>
                    </div>
                    <span className="font-bold text-[#240b25] text-[1.5rem] leading-none">{formatMoney(quote?.totalPaise || 0)}</span>
                 </div>

                 <button 
                   onClick={handleCheckout}
                   disabled={rows.length === 0 || stale || !!error || quote?.lines.length === 0}
                   className="w-full bg-[#240b25] text-white flex items-center justify-center gap-3 py-4 rounded font-bold uppercase tracking-widest text-[0.8rem] hover:bg-[#3a133d] transition-colors mb-4 disabled:opacity-50"
                 >
                    <Lock size={16} /> PROCEED TO CHECKOUT
                 </button>

                 <p className="text-center text-[0.7rem] text-[#240b25]/60 font-medium mb-6">
                    Guaranteed safe & secure checkout
                 </p>

                 {/* Payment Methods */}
                 <div className="flex items-center justify-center gap-3 mt-2">
                    <Razorpay className="h-5 w-auto" />
                    <Visa className="h-5 w-auto" />
                    <Mastercard className="h-5 w-auto" />
                    <Upi className="h-5 w-auto text-[#240b25]" />
                    <Paytm className="h-4 w-auto" />
                 </div>
              </div>

              {/* Why Velastia Box */}
              <div className="w-full bg-[#fdfbf9] border border-[#eaddce] rounded-xl p-6 lg:p-8 shadow-sm">
                 <h3 className="font-serif font-bold text-[1.2rem] lg:text-[1.3rem] text-[#240b25] mb-5">Why Velastia?</h3>
                 <div className="flex flex-col gap-5">
                    {[
                      { icon: Leaf, text: "Dermatologically Tested" },
                      { icon: Ban, text: "No Harmful Chemicals" },
                      { icon: PawPrint, text: "Cruelty Free" },
                      { icon: Heart, text: "Loved by Thousands" },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className="flex items-center justify-center shrink-0">
                            <feature.icon className="text-[#c8963c]" size={20} strokeWidth={1.5} />
                         </div>
                         <span className="text-[0.9rem] font-medium text-[#240b25]/80">{feature.text}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. COMPLIMENTARY GIFT BANNER */}
      <section className="w-full px-6 lg:px-12 py-4">
         <div className="max-w-[1400px] mx-auto rounded-2xl relative overflow-hidden shadow-sm">
            
            {/* Carousel Slider */}
            <div 
               className={`w-full h-full flex relative z-10 ease-in-out ${isTransitioning ? 'transition-transform duration-700' : ''}`}
               style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
            >
               {offers.map((offer, idx) => (
                  <div key={idx} className="min-w-full relative flex flex-col md:flex-row items-center justify-between py-5 px-6 lg:py-6 lg:px-10 shrink-0">
                     {/* Background Image (slides with the content) */}
                     <div className="absolute inset-0 z-0">
                        <img src={offer.bgImg} alt="Gift Banner Background" className="w-full h-full object-cover object-right lg:object-center" />
                     </div>

                     <div className="flex flex-col relative z-10 lg:pl-32 xl:pl-40 text-center md:text-left w-full md:w-1/2">
                        <h3 className="font-serif text-[1.8rem] lg:text-[2.2rem] text-[#240b25] mb-2">
                          {offer.title}
                        </h3>
                        <p className="text-[1rem] font-medium text-[#240b25]/80">
                          {offer.desc}
                        </p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Controls */}
            <div className="absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 hidden lg:flex gap-2 z-20">
               <button 
                  onClick={handlePrevBanner}
                  className="size-8 rounded-full border border-[#240b25]/20 flex items-center justify-center text-[#240b25]/50 hover:bg-[#240b25] hover:text-white transition-colors bg-white/40 backdrop-blur-sm"
               >
                  <ChevronLeft size={16} />
               </button>
               <button 
                  onClick={handleNextBanner}
                  className="size-8 rounded-full border border-[#240b25]/20 flex items-center justify-center text-[#240b25]/50 hover:bg-[#240b25] hover:text-white transition-colors bg-white/40 backdrop-blur-sm"
               >
                  <ChevronRight size={16} />
               </button>
            </div>
         </div>
      </section>

      {/* 4. TRUSTED REVIEWS SECTION */}
      <section className="w-full pb-16 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto bg-[#fcf9f5] border border-[#eaddce] rounded-xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 shadow-sm">
           
           {/* Left Total Reviews */}
           <div className="flex flex-col shrink-0 lg:border-r border-[#eaddce] lg:pr-12 lg:py-2">
              <h3 className="font-serif font-semibold text-[1.25rem] lg:text-[1.35rem] text-[#240b25] mb-4 whitespace-nowrap">
                Trusted by 10,000+ Beautiful Souls
              </h3>
              <div className="flex items-center gap-3">
                 <div className="flex text-[#c8963c]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
                    ))}
                 </div>
                 <span className="font-bold text-[0.95rem] text-[#240b25]">4.8/5</span>
                 <span className="text-[0.85rem] font-medium text-[#240b25]/70">(2,345 Reviews)</span>
              </div>
           </div>

           {/* 3 Review Cards */}
           <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review, i) => (
                <div key={i} className={`flex flex-col ${i !== 0 ? 'md:border-l border-[#eaddce] md:pl-8' : ''}`}>
                   <div className="flex items-center gap-4 mb-4">
                      {/* Placeholder Avatar */}
                      <div className="size-12 rounded-full bg-[#eaddce]/40 flex items-center justify-center font-bold text-[#c8963c] text-lg shrink-0">
                        {review.authorName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-[1rem] text-[#240b25]">{review.authorName}</span>
                         <div className="flex text-[#c8963c] mt-1 gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} size={14} fill={idx < review.rating ? "currentColor" : "none"} strokeWidth={idx < review.rating ? 0 : 1.5} />
                            ))}
                         </div>
                      </div>
                   </div>
                   <p className="text-[0.9rem] text-[#240b25]/80 font-medium leading-relaxed">
                     "{review.body}"
                   </p>
                </div>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
}
