import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ShieldCheck, Headset, FileCheck, FileText, ChevronLeft, ChevronRight, FlaskConical, MapPin, Award, TrendingUp } from "lucide-react";
import { getFaqs, getHomeContent } from "@/lib/api/server";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";
import OptionalPhoto from "@/components/ui/OptionalPhoto";
import FaqInteractiveLayout from "./FaqInteractiveLayout";
import TestimonialsSlider from "./TestimonialsSlider";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("faqs");
}

export default async function FaqsPage() {
  const [faqs, homeContent] = await Promise.all([getFaqs(), getHomeContent()]);

  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#f6ece2] lg:bg-transparent pt-12 pb-16 lg:py-0 min-h-[550px] flex items-center">
        <div className="absolute inset-0 z-0 hidden lg:block">
          <img src="/images/faqs section hero banner.png" alt="FAQs" className="w-full h-full object-cover object-[center_right]" />
        </div>
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
          <div className="w-full lg:w-[45%] lg:py-24">
             <h1 className="text-[#c8963c] font-bold uppercase tracking-[0.2em] text-[0.8rem] mb-4">FAQS</h1>
             <h2 className="text-[#240b25] font-display text-[3.5rem] lg:text-[4.5rem] leading-[1.05] font-medium mb-3">
               Everything You<br/>Need to Know.
             </h2>
             <div className="flex items-center gap-2 mb-6">
               <p className="text-[#c8963c] text-3xl lg:text-4xl font-script -rotate-2 origin-left mt-2">
                 Clear answers. Real care.
               </p>
               <ScriptHeart className="w-8 h-8 text-[#c8963c] mt-2" />
             </div>
             <p className="text-[#240b25]/80 text-[0.95rem] font-medium max-w-[320px] mb-12 leading-relaxed">
               We're here to make your Velastia experience smooth, easy and worry-free.
             </p>
             
             <div className="flex flex-wrap lg:flex-nowrap gap-6 lg:gap-8 items-start">
               <div className="flex flex-col items-center text-center gap-3 w-16 lg:w-20">
                 <span className="grid size-12 lg:size-14 rounded-full border border-[#c8963c]/30 bg-white/40 backdrop-blur-sm place-items-center shrink-0">
                   <FileText className="text-[#240b25]/80" size={24} strokeWidth={1.5} />
                 </span>
                 <span className="text-[0.6rem] uppercase tracking-wide font-bold text-[#240b25] leading-tight">Honest<br/>Information</span>
               </div>
               <div className="flex flex-col items-center text-center gap-3 w-16 lg:w-20">
                 <span className="grid size-12 lg:size-14 rounded-full border border-[#c8963c]/30 bg-white/40 backdrop-blur-sm place-items-center shrink-0">
                   <Headset className="text-[#240b25]/80" size={24} strokeWidth={1.5} />
                 </span>
                 <span className="text-[0.6rem] uppercase tracking-wide font-bold text-[#240b25] leading-tight">Real<br/>Support</span>
               </div>
               <div className="flex flex-col items-center text-center gap-3 w-16 lg:w-20">
                 <span className="grid size-12 lg:size-14 rounded-full border border-[#c8963c]/30 bg-white/40 backdrop-blur-sm place-items-center shrink-0">
                   <FileCheck className="text-[#240b25]/80" size={24} strokeWidth={1.5} />
                 </span>
                 <span className="text-[0.6rem] uppercase tracking-wide font-bold text-[#240b25] leading-tight">Transparent<br/>Policies</span>
               </div>
               <div className="flex flex-col items-center text-center gap-3 w-16 lg:w-20">
                 <span className="grid size-12 lg:size-14 rounded-full border border-[#c8963c]/30 bg-white/40 backdrop-blur-sm place-items-center shrink-0">
                   <ShieldCheck className="text-[#240b25]/80" size={24} strokeWidth={1.5} />
                 </span>
                 <span className="text-[0.6rem] uppercase tracking-wide font-bold text-[#240b25] leading-tight">Your Safety<br/>First</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. Main FAQs Interactive Section */}
      <section className="bg-[#fcf9f5] py-10 px-6 w-full">
         <FaqInteractiveLayout />
      </section>

      {/* 3. Trust Badges Band */}
      <section className="bg-[#f9eee6] py-10 px-6 w-full border-y border-[#f3eadf]">
        <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-y-10 lg:gap-0">
           {/* Item 1 */}
           <div className="flex flex-col items-center text-center gap-3 flex-1 relative px-1 lg:px-2">
              <span className="grid size-14 lg:size-16 place-items-center rounded-full border border-[#240b25]/40 bg-transparent text-[#240b25]">
                 <FlaskConical size={28} strokeWidth={1} />
              </span>
              <div>
                <h4 className="text-[0.75rem] lg:text-[0.85rem] font-display font-extrabold uppercase tracking-widest text-[#240b25] mb-1 lg:mb-2 whitespace-nowrap">SAFE INGREDIENTS</h4>
                <p className="text-[0.65rem] lg:text-[0.75rem] text-[#240b25]/80 leading-snug font-medium">Carefully chosen for your<br/>skin & health.</p>
              </div>
              <div className="hidden lg:block absolute right-0 top-[10%] bottom-[10%] w-px bg-[#240b25]/10" />
           </div>
           
           {/* Item 2 */}
           <div className="flex flex-col items-center text-center gap-3 flex-1 relative px-1 lg:px-2">
              <span className="grid size-14 lg:size-16 place-items-center rounded-full border border-[#240b25]/40 bg-transparent text-[#240b25]">
                 <ShieldCheck size={28} strokeWidth={1} />
              </span>
              <div>
                <h4 className="text-[0.75rem] lg:text-[0.85rem] font-display font-extrabold uppercase tracking-widest text-[#240b25] mb-1 lg:mb-2 whitespace-nowrap">DERMATOLOGICALLY TESTED</h4>
                <p className="text-[0.65rem] lg:text-[0.75rem] text-[#240b25]/80 leading-snug font-medium">Each product is tested<br/>for safety.</p>
              </div>
              <div className="hidden lg:block absolute right-0 top-[10%] bottom-[10%] w-px bg-[#240b25]/10" />
           </div>
           
           {/* Item 3 */}
           <div className="flex flex-col items-center text-center gap-3 flex-1 relative px-1 lg:px-2">
              <span className="grid size-14 lg:size-16 place-items-center rounded-full border border-[#240b25]/40 bg-transparent text-[#240b25]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M13 16a3 3 0 0 1 2.24 5"/><path d="M18 12h.01"/><path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3"/><path d="M20 8.54V4a2 2 0 1 0-4 0v3"/><path d="M7.612 12.524a3 3 0 1 0-1.6 4.3"/></svg>
              </span>
              <div>
                <h4 className="text-[0.75rem] lg:text-[0.85rem] font-display font-extrabold uppercase tracking-widest text-[#240b25] mb-1 lg:mb-2 whitespace-nowrap">CRUELTY FREE & VEGAN</h4>
                <p className="text-[0.65rem] lg:text-[0.75rem] text-[#240b25]/80 leading-snug font-medium">We love animals as much<br/>as you do.</p>
              </div>
               <div className="hidden lg:block absolute right-0 top-[10%] bottom-[10%] w-px bg-[#240b25]/10" />
           </div>
           
           {/* Item 4 */}
           <div className="flex flex-col items-center text-center gap-3 flex-1 relative px-1 lg:px-2">
              <span className="grid size-14 lg:size-16 place-items-center rounded-full border border-[#240b25]/40 bg-transparent text-[#240b25]">
                 <MapPin size={28} strokeWidth={1} />
              </span>
              <div>
                <h4 className="text-[0.75rem] lg:text-[0.85rem] font-display font-extrabold uppercase tracking-widest text-[#240b25] mb-1 lg:mb-2 whitespace-nowrap">MADE IN INDIA</h4>
                <p className="text-[0.65rem] lg:text-[0.75rem] text-[#240b25]/80 leading-snug font-medium">Proudly formulated<br/>for Indian skin.</p>
              </div>
              <div className="hidden lg:block absolute right-0 top-[10%] bottom-[10%] w-px bg-[#240b25]/10" />
           </div>
           
           {/* Item 5 */}
           <div className="flex flex-col items-center text-center gap-3 flex-1 relative px-1 lg:px-2">
              <span className="grid size-14 lg:size-16 place-items-center rounded-full border border-[#240b25]/40 bg-transparent text-[#240b25]">
                 <Award size={28} strokeWidth={1} />
              </span>
              <div>
                <h4 className="text-[0.75rem] lg:text-[0.85rem] font-display font-semibold uppercase tracking-widest text-[#240b25] mb-1 lg:mb-2 whitespace-nowrap">QUALITY YOU CAN TRUST</h4>
                <p className="text-[0.65rem] lg:text-[0.75rem] text-[#240b25]/80 leading-snug font-medium">Luxury care with complete<br/>transparency.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. LOVED BY THOUSANDS Testimonials */}
      <section className="bg-white py-10 px-6 w-full border-t border-[#f3eadf]">
         <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-10">
               <h3 className="text-[#240b25] font-display text-[1.5rem] uppercase tracking-widest font-extrabold">LOVED BY THOUSANDS OF BEAUTIFUL YOU</h3>
               <div className="flex items-center justify-center w-full mt-4">
                  <div className="h-px bg-[#c8963c]/50 w-16"></div>
                  <Ornament className="w-12 mx-3 text-[#c8963c]" />
                  <div className="h-px bg-[#c8963c]/50 w-16"></div>
               </div>
            </div>

            <TestimonialsSlider />
         </div>
      </section>

      {/* 5. Banner Section (Moved to be ABOVE the trust strip) */}
      <section className="bg-[#240b25] py-10 px-6 w-full text-cream-50">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
           <div className="lg:w-auto flex flex-col items-center lg:items-start text-center lg:text-left pr-10">
              <h2 className="font-display font-medium text-[1.4rem] lg:text-[1.6rem] tracking-wider uppercase mb-3 text-white">BEAUTY SHOULD BE SAFE. ALWAYS.</h2>
              <p className="text-[0.95rem] text-cream-50/90 leading-relaxed font-medium mb-6 max-w-md">
                 That's why every Velastia product is created with love, backed by science and inspired by you.
              </p>
              <div className="flex items-center gap-3">
                 <p className="text-[#d4af37] font-script text-3xl lg:text-[1.8rem] whitespace-nowrap">Thank you for being a part of our journey.</p>
                 <ScriptHeart className="w-5 h-5 text-[#d4af37] shrink-0" />
              </div>
           </div>
           
           <div className="lg:w-auto flex items-center justify-center lg:justify-end gap-6 lg:gap-8 h-full">
              <div className="hidden lg:block w-px h-32 border-l border-dashed border-[#d4af37]/30 mx-2"></div>
              
              <div className="flex flex-col items-center gap-3 text-center w-20">
                 <span className="grid size-14 place-items-center rounded-full border border-[#d4af37]/60 bg-transparent">
                    <ShieldCheck className="text-[#d4af37]" size={26} strokeWidth={1.2} />
                 </span>
                 <span className="text-[0.7rem] font-medium text-cream-50/90 leading-tight">Safe for Daily Use</span>
              </div>
              
              <div className="hidden lg:block w-px h-32 border-l border-dashed border-[#d4af37]/30 mx-2"></div>
              
              <div className="flex flex-col items-center gap-3 text-center w-20">
                 <span className="grid size-14 place-items-center rounded-full border border-[#d4af37]/60 bg-transparent">
                    <FlaskConical className="text-[#d4af37]" size={26} strokeWidth={1.2} />
                 </span>
                 <span className="text-[0.7rem] font-medium text-cream-50/90 leading-tight">Science Backed</span>
              </div>
              
              <div className="hidden lg:block w-px h-32 border-l border-dashed border-[#d4af37]/30 mx-2"></div>
              
              <div className="flex flex-col items-center gap-3 text-center w-20">
                 <span className="grid size-14 place-items-center rounded-full border border-[#d4af37]/60 bg-transparent">
                    <TrendingUp className="text-[#d4af37]" size={26} strokeWidth={1.2} />
                 </span>
                 <span className="text-[0.7rem] font-medium text-cream-50/90 leading-tight">Real Results</span>
              </div>
              
              <div className="hidden lg:block w-px h-32 border-l border-dashed border-[#d4af37]/30 mx-2"></div>
              
              <div className="flex flex-col items-center gap-3 text-center w-20">
                 <span className="grid size-14 place-items-center rounded-full border border-[#d4af37]/60 bg-transparent">
                    <ScriptHeart className="text-[#d4af37] w-7 h-7" />
                 </span>
                 <span className="text-[0.7rem] font-medium text-cream-50/90 leading-tight">Loved by Thousands</span>
              </div>
              
              <div className="hidden lg:block w-px h-32 border-l border-dashed border-[#d4af37]/30 mx-2"></div>
              
              <div className="ml-4 hidden lg:block">
                 <img src="/images/faq footer logo.png" alt="Velastia Logo" className="w-[100px] h-[100px] lg:w-[130px] lg:h-[130px] object-contain" />
              </div>
           </div>
        </div>
      </section>

      {/* 6. White Trust Strip (Moved to be BELOW the banner) */}
      <section className="bg-white py-10 px-6 border-t border-[#f3eadf] w-full">
         <div className="max-w-[1400px] mx-auto flex justify-between items-center flex-wrap gap-8">
            <div className="flex items-center gap-4">
               <span className="grid size-12 rounded-full bg-[#fdfbf9] border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
               </span>
               <div>
                  <h4 className="text-[1.05rem] font-semibold text-[#240b25]">100% Secure</h4>
                  <p className="text-[0.9rem] font-medium text-[#240b25]/70">Payments</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="grid size-12 rounded-full bg-[#fdfbf9] border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <ShieldCheck size={24} strokeWidth={1.5} />
               </span>
               <div>
                  <h4 className="text-[1.05rem] font-semibold text-[#240b25]">Easy Returns</h4>
                  <p className="text-[0.9rem] font-medium text-[#240b25]/70">(7 Days)</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="grid size-12 rounded-full bg-[#fdfbf9] border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="2" y="6" rx="2"/><path d="M18 12.5V10c0-1.1.9-2 2-2h2v6.5"/><path d="M22 14.5A2.5 2.5 0 0 1 19.5 17a2.5 2.5 0 0 1-2.5-2.5"/><path d="M7 14.5A2.5 2.5 0 0 1 4.5 17a2.5 2.5 0 0 1-2.5-2.5"/></svg>
               </span>
               <div>
                  <h4 className="text-[1.05rem] font-semibold text-[#240b25]">Free Shipping</h4>
                  <p className="text-[0.9rem] font-medium text-[#240b25]/70">Above ₹999</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="grid size-12 rounded-full bg-[#fdfbf9] border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
               </span>
               <div>
                  <h4 className="text-[1.05rem] font-semibold text-[#240b25]">Exclusive Offers</h4>
                  <p className="text-[0.9rem] font-medium text-[#240b25]/70">For You</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="grid size-12 rounded-full bg-[#fdfbf9] border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <Headset size={24} strokeWidth={1.5} />
               </span>
               <div>
                  <h4 className="text-[1.05rem] font-semibold text-[#240b25]">Dedicated Support</h4>
                  <p className="text-[0.9rem] font-medium text-[#240b25]/70">Always Here</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
