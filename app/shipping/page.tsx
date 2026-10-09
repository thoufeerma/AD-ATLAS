import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { 
  Truck, ShieldCheck, Clock, MapPin, Box, Headphones, Heart, Sparkles, 
  Map, Phone, Mail, MessageCircle, Info, FileText, CheckCircle2, ChevronRight, Check, Shield, RefreshCw, ShoppingBag, Home
} from "lucide-react";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Shipping Policy | Velastia",
  description: "Details about Velastia's shipping and delivery timelines."
};

export default function ShippingPage() {
  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col font-sans text-[#240b25]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-8 pb-8 lg:py-0 min-h-[450px] flex items-center border-b border-[#f3eadf] overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full">
           <img src="/images/shipping and delivery hero banner.png" alt="Shipping Hero" className="w-full h-full object-cover object-center" />
        </div>
        
        {/* Handled with care badge */}
        <div className="absolute right-[5%] lg:right-[8%] top-[10%] lg:top-[20%] z-20 rounded-full size-32 lg:size-40 bg-[#fdfbf9] border border-[#c8963c]/30 shadow-xl flex-col items-center justify-center text-center p-4 hidden md:flex">
           <span className="text-[#c8963c] text-[1rem] lg:text-[1.1rem] font-serif font-bold tracking-[0.15em] uppercase mb-1 leading-none">Handled</span>
           <span className="text-[#240b25] text-[0.75rem] lg:text-[0.85rem] font-serif font-bold uppercase tracking-widest leading-tight">With Care,<br/>Delivered<br/>With Love</span>
           <Heart className="w-4 h-4 text-[#c8963c] mt-2" strokeWidth={2} />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="w-full lg:w-[60%] lg:py-10">
             <h1 className="text-[#c8963c] font-serif font-bold uppercase tracking-[0.2em] text-[1.1rem] mb-2">SHIPPING & DELIVERY</h1>
             <h2 className="text-[#240b25] font-display text-[4rem] lg:text-[4.5rem] leading-[1.05] mb-2 font-medium">
               Because Beauty
             </h2>
             <h2 className="text-[#240b25] font-script text-[4rem] lg:text-[4.8rem] leading-[0.8] mb-4">
               Should Reach You
             </h2>
             <h2 className="text-[#240b25] font-display text-[4rem] lg:text-[4.5rem] leading-[1.05] mb-6 font-medium">
               With Love
             </h2>
             
             <p className="text-[#240b25]/80 text-[1.2rem] font-medium max-w-[420px] mb-8 leading-relaxed">
               We pack it with care. We deliver it with love.<br/>Your Velastia products, safely to your doorstep.
             </p>
             
             <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 xl:gap-8 mt-6">
               <div className="flex items-center gap-3">
                 <span className="grid size-12 rounded-full border-[1.5px] border-[#c8963c]/50 place-items-center shrink-0">
                   <Truck className="text-[#c8963c]" size={22} strokeWidth={1.5} />
                 </span>
                 <div className="flex flex-col">
                   <h4 className="text-[0.95rem] font-bold text-[#240b25] leading-tight">Fast Delivery</h4>
                   <p className="text-[0.85rem] text-[#240b25]/80 font-medium leading-tight mt-0.5">Right to your door</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="grid size-12 rounded-full border-[1.5px] border-[#c8963c]/50 place-items-center shrink-0">
                   <ShieldCheck className="text-[#c8963c]" size={22} strokeWidth={1.5} />
                 </span>
                 <div className="flex flex-col">
                   <h4 className="text-[0.95rem] font-bold text-[#240b25] leading-tight">Safe & Secure</h4>
                   <p className="text-[0.85rem] text-[#240b25]/80 font-medium leading-tight mt-0.5">Packaging</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="grid size-12 rounded-full border-[1.5px] border-[#c8963c]/50 place-items-center shrink-0">
                   <Clock className="text-[#c8963c]" size={22} strokeWidth={1.5} />
                 </span>
                 <div className="flex flex-col">
                   <h4 className="text-[0.95rem] font-bold text-[#240b25] leading-tight">Real-time Updates</h4>
                   <p className="text-[0.85rem] text-[#240b25]/80 font-medium leading-tight mt-0.5">Every step of the way</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. OUR DELIVERY PROMISE (Dark Purple Banner) */}
      <section className="bg-[#240b25] py-8 px-6 lg:px-12 w-full text-cream-50">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="text-[#c8963c] font-display font-extrabold uppercase tracking-widest text-[1.2rem] mb-3">OUR DELIVERY PROMISE</h3>
            <p className="text-[1rem] lg:text-[1.1rem] text-cream-50/90 leading-relaxed max-w-md">
              We are committed to delivering not just products, but happiness – on time, every time.
            </p>
          </div>

          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-0 lg:divide-x divide-[#c8963c]/30">
             <div className="flex flex-col items-center text-center gap-3 px-4">
                <Clock className="text-[#c8963c]" size={36} strokeWidth={1} />
                <span className="text-[0.95rem] font-medium leading-tight">On-time<br/>Delivery</span>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-4">
                <Box className="text-[#c8963c]" size={36} strokeWidth={1} />
                <span className="text-[0.95rem] font-medium leading-tight">Safe & Hygienic<br/>Packaging</span>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-4">
                <Truck className="text-[#c8963c]" size={36} strokeWidth={1} />
                <span className="text-[0.95rem] font-medium leading-tight">Doorstep<br/>Delivery</span>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-4">
                <MapPin className="text-[#c8963c]" size={36} strokeWidth={1} />
                <span className="text-[0.95rem] font-medium leading-tight">Live Order<br/>Tracking</span>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-4 md:col-span-1 col-span-2">
                <Sparkles className="text-[#c8963c]" size={36} strokeWidth={1} />
                <span className="text-[0.95rem] font-medium leading-tight">Hassle-free<br/>Experience</span>
             </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT (Information, Timeline, Estimation) */}
      <section className="py-8 px-6 lg:px-12 w-full">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: SHIPPING INFORMATION */}
          <div className="lg:col-span-3 flex flex-col items-center lg:border-r border-[#c8963c]/20 pr-4">
            <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.4rem] text-[#240b25] mb-1 text-center whitespace-nowrap">SHIPPING INFORMATION</h3>
            <div className="flex items-center justify-center w-full mb-6">
               <div className="h-px bg-[#c8963c]/50 w-12"></div>
               <Ornament className="w-10 mx-3 text-[#c8963c]" />
               <div className="h-px bg-[#c8963c]/50 w-12"></div>
            </div>

            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
                <span className="grid size-14 rounded-full border border-[#c8963c]/40 bg-[#fdfbf9] place-items-center shrink-0">
                  <Truck className="text-[#c8963c]" size={28} strokeWidth={1.2} />
                </span>
                <div className="text-center lg:text-left">
                  <h4 className="text-[1.1rem] font-bold text-[#240b25] mb-1">Free Shipping</h4>
                  <p className="text-[0.95rem] text-[#240b25]/70 font-medium">On all orders above ₹999</p>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
                <span className="grid size-14 rounded-full border border-[#c8963c]/40 bg-[#fdfbf9] place-items-center shrink-0">
                  <Sparkles className="text-[#c8963c]" size={28} strokeWidth={1.2} />
                </span>
                <div className="text-center lg:text-left">
                  <h4 className="text-[1.1rem] font-bold text-[#240b25] mb-1">Express Shipping</h4>
                  <p className="text-[0.95rem] text-[#240b25]/70 font-medium leading-snug">Get your order faster with<br/>priority delivery</p>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
                <span className="grid size-14 rounded-full border border-[#c8963c]/40 bg-[#fdfbf9] place-items-center shrink-0">
                  <Box className="text-[#c8963c]" size={28} strokeWidth={1.2} />
                </span>
                <div className="text-center lg:text-left">
                  <h4 className="text-[1.1rem] font-bold text-[#240b25] mb-1">Secure Packaging</h4>
                  <p className="text-[0.95rem] text-[#240b25]/70 font-medium leading-snug">All products are carefully packed<br/>to ensure they reach you safe<br/>and sound</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
                <span className="grid size-14 rounded-full border border-[#c8963c]/40 bg-[#fdfbf9] place-items-center shrink-0">
                  <MapPin className="text-[#c8963c]" size={28} strokeWidth={1.2} />
                </span>
                <div className="text-center lg:text-left">
                  <h4 className="text-[1.1rem] font-bold text-[#240b25] mb-1">Order Tracking</h4>
                  <p className="text-[0.95rem] text-[#240b25]/70 font-medium leading-snug">Track your order in real-time<br/>from dispatch to delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: DELIVERY TIMELINE */}
          <div className="lg:col-span-5 flex flex-col items-center text-center px-2">
            <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.4rem] text-[#240b25] mb-1">DELIVERY TIMELINE</h3>
            <div className="flex items-center justify-center w-full mb-4">
               <div className="h-px bg-[#c8963c]/50 w-16"></div>
               <Ornament className="w-10 mx-3 text-[#c8963c]" />
               <div className="h-px bg-[#c8963c]/50 w-16"></div>
            </div>
            <p className="text-[1.1rem] text-[#240b25]/80 max-w-[340px] mb-10 font-medium">
              We process and ship orders quickly so you can start your beauty journey without delay.
            </p>

            {/* Timeline Steps */}
            <div className="relative w-full flex justify-between items-start mb-10">
              {/* Connecting Line */}
              <div className="absolute top-[42px] left-[12.5%] right-[12.5%] h-px bg-[#c8963c] z-0">
                 {/* Dot 1 at 1/3 point (which corresponds to 25% of the full container) */}
                 <div className="absolute top-1/2 -translate-y-1/2 left-[16.66%] size-1.5 rounded-full bg-[#c8963c]"></div>
                 {/* Dot 2 at 1/2 point (which corresponds to 50% of the full container) */}
                 <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-[#c8963c]"></div>
                 {/* Dot 3 at 2/3 point (which corresponds to 75% of the full container) */}
                 <div className="absolute top-1/2 -translate-y-1/2 right-[16.66%] size-1.5 rounded-full bg-[#c8963c]"></div>
              </div>
              
              <div className="flex flex-col items-center gap-4 relative z-10 flex-1 px-1">
                 <div className="grid size-[84px] rounded-full border border-[#c8963c] bg-[#fcf9f5] place-items-center text-[#901835]">
                    <ShoppingBag size={34} strokeWidth={1.2} />
                 </div>
                 <div>
                   <h5 className="text-[#c8963c] font-bold text-[0.8rem] tracking-wider mb-1">STEP 1</h5>
                   <h4 className="text-[#240b25] font-extrabold text-[0.95rem] mb-1 whitespace-nowrap">Order Confirmed</h4>
                   <p className="text-[0.75rem] text-[#240b25]/70 font-medium leading-tight px-1">We receive your order and confirm it.</p>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10 flex-1 px-1">
                 <div className="grid size-[84px] rounded-full border border-[#c8963c] bg-[#fcf9f5] place-items-center text-[#901835]">
                    <Box size={34} strokeWidth={1.2} />
                 </div>
                 <div>
                   <h5 className="text-[#c8963c] font-bold text-[0.8rem] tracking-wider mb-1">STEP 2</h5>
                   <h4 className="text-[#240b25] font-extrabold text-[0.95rem] mb-1 whitespace-nowrap">Processing</h4>
                   <p className="text-[0.75rem] text-[#240b25]/70 font-medium leading-tight px-1">Your order is packed with love.</p>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10 flex-1 px-1">
                 <div className="grid size-[84px] rounded-full border border-[#c8963c] bg-[#fcf9f5] place-items-center text-[#901835]">
                    <Truck size={34} strokeWidth={1.2} />
                 </div>
                 <div>
                   <h5 className="text-[#c8963c] font-bold text-[0.8rem] tracking-wider mb-1">STEP 3</h5>
                   <h4 className="text-[#240b25] font-extrabold text-[0.95rem] mb-1 whitespace-nowrap">Shipped</h4>
                   <p className="text-[0.75rem] text-[#240b25]/70 font-medium leading-tight px-1">Your order is on its way to you.</p>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10 flex-1 px-1">
                 <div className="grid size-[84px] rounded-full border border-[#c8963c] bg-[#fcf9f5] place-items-center text-[#901835]">
                    <Home size={34} strokeWidth={1.2} />
                 </div>
                 <div>
                   <h5 className="text-[#c8963c] font-bold text-[0.8rem] tracking-wider mb-1">STEP 4</h5>
                   <h4 className="text-[#240b25] font-extrabold text-[0.95rem] mb-1 whitespace-nowrap">Delivered</h4>
                   <p className="text-[0.75rem] text-[#240b25]/70 font-medium leading-tight px-1">Happiness delivered to your doorstep!</p>
                 </div>
              </div>
            </div>

            <div className="bg-[#f9eee6] rounded-md py-6 px-10 border border-[#f3eadf] inline-block shadow-sm">
              <p className="text-[1.05rem] text-[#240b25] font-medium">
                Orders are usually delivered within <span className="text-[#c8963c] font-bold">3-7 business days</span><br/>depending on your location.
              </p>
            </div>
          </div>

          {/* Right: ESTIMATED DELIVERY TIME */}
          <div className="lg:col-span-4">
             <div className="bg-[#240b25] rounded-xl p-8 border border-[#3e1f4f] shadow-lg text-cream-50 h-full flex flex-col justify-start">
                <h3 className="text-[#c8963c] font-display font-extrabold uppercase tracking-widest text-[1.25rem] mb-6 text-center">ESTIMATED DELIVERY TIME</h3>
                
                <div className="flex flex-col">
                  <div className="border-b border-cream-50/10 pb-3 mb-3">
                    <p className="text-[1.05rem] font-medium mb-1">Metro Cities</p>
                    <p className="text-[0.9rem] text-cream-50/80 font-medium">2 - 4 Business Days</p>
                  </div>
                  <div className="border-b border-cream-50/10 pb-3 mb-3">
                    <p className="text-[1.05rem] font-medium mb-1">Major Cities</p>
                    <p className="text-[0.9rem] text-cream-50/80 font-medium">3 - 5 Business Days</p>
                  </div>
                  <div className="border-b border-cream-50/10 pb-3 mb-3">
                    <p className="text-[1.05rem] font-medium mb-1">Tier 2 & Tier 3 Cities</p>
                    <p className="text-[0.9rem] text-cream-50/80 font-medium">4 - 7 Business Days</p>
                  </div>
                  <div className="border-b border-cream-50/10 pb-3 mb-3 border-none">
                    <p className="text-[1.05rem] font-medium mb-1">Remote Areas</p>
                    <p className="text-[0.9rem] text-cream-50/80 font-medium">5 - 10 Business Days</p>
                  </div>
                </div>

                <div className="mt-2 flex items-start gap-3">
                  <Heart className="text-[#c8963c] shrink-0 mt-1" size={20} fill="#c8963c" />
                  <p className="text-[0.85rem] text-cream-50/80 font-medium leading-relaxed">
                    Delivery timelines may vary during festive seasons or unexpected delays.
                  </p>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 4. EVERY ORDER IS SPECIAL */}
      <section className="bg-[#fcf9f5] py-4 px-6 lg:px-12 w-full border-t border-[#f3eadf]">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center">
          <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.4rem] text-[#240b25] mb-1 text-center">EVERY ORDER IS SPECIAL</h3>
          <div className="flex items-center justify-center w-full mb-8">
             <div className="h-px bg-[#c8963c]/50 w-20"></div>
             <Ornament className="w-12 mx-3 text-[#c8963c]" />
             <div className="h-px bg-[#c8963c]/50 w-20"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {/* Card 1 */}
            <div className="bg-[#f5eee6] rounded-xl p-6 border border-[#f3eadf] flex flex-col items-center text-center shadow-sm">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[#eaddce]">
                <img src="https://placehold.co/400x300/eaddce/c8963c?text=Box" alt="Premium Packaging" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[1.15rem] font-extrabold text-[#240b25] mb-2">Premium Packaging</h4>
              <p className="text-[0.95rem] text-[#240b25]/75 font-medium leading-relaxed">Your products are packed in our signature Velastia packaging.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#f5eee6] rounded-xl p-6 border border-[#f3eadf] flex flex-col items-center text-center shadow-sm">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[#eaddce]">
                <img src="https://placehold.co/400x300/eaddce/c8963c?text=Products" alt="Safe & Secure" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[1.15rem] font-extrabold text-[#240b25] mb-2">Safe & Secure</h4>
              <p className="text-[0.95rem] text-[#240b25]/75 font-medium leading-relaxed">We use protective packaging to ensure your products arrive in perfect condition.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#f5eee6] rounded-xl p-6 border border-[#f3eadf] flex flex-col items-center text-center shadow-sm">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[#eaddce]">
                <img src="https://placehold.co/400x300/eaddce/c8963c?text=Card" alt="Personal Touch" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[1.15rem] font-extrabold text-[#240b25] mb-2">A Personal Touch</h4>
              <p className="text-[0.95rem] text-[#240b25]/75 font-medium leading-relaxed">Every order comes with a little note, because you're special to us.</p>
            </div>
            {/* Card 4 */}
            <div className="bg-[#f5eee6] rounded-xl p-6 border border-[#f3eadf] flex flex-col items-center text-center shadow-sm">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[#eaddce]">
                <img src="https://placehold.co/400x300/eaddce/c8963c?text=Phone" alt="Tracking" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-[1.15rem] font-extrabold text-[#240b25] mb-2">Real-time Tracking</h4>
              <p className="text-[0.95rem] text-[#240b25]/75 font-medium leading-relaxed">Stay updated with every step of your order journey.</p>
            </div>
            {/* Card 5 */}
            <div className="bg-[#f5eee6] rounded-xl p-6 border border-[#f3eadf] flex flex-col items-center text-center shadow-sm">
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 bg-[#240b25] flex items-center justify-center">
                 <Headphones className="text-[#c8963c] size-16" strokeWidth={1} />
              </div>
              <h4 className="text-[1.15rem] font-extrabold text-[#240b25] mb-2">Always Here for You</h4>
              <p className="text-[0.95rem] text-[#240b25]/75 font-medium leading-relaxed">Our support team is ready to help with any delivery queries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WE DELIVER ACROSS INDIA */}
      <section className="bg-[#fcf9f5] pb-4 px-6 lg:px-12 w-full">
        <div className="relative max-w-[1400px] mx-auto rounded-[10px] overflow-hidden shadow-md">
           <div className="absolute inset-0 z-0 w-full h-full">
              <img src="/images/WE DELIVER ACROSS INDIA banner.png" alt="We Deliver Across India" className="w-full h-full object-cover object-center" />
           </div>
           
           <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-8 py-10 px-6 lg:px-12">
               <div className="lg:w-1/3 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.6rem] text-[#240b25] mb-1">WE DELIVER ACROSS INDIA</h3>
                  <p className="text-[1.1rem] text-[#240b25]/80 font-medium">
                    From metros to the most remote corners, Velastia delivers beauty everywhere.
                  </p>
               </div>

               <div className="lg:w-1/3 flex items-center justify-center gap-6 lg:gap-10">
                  <div className="flex flex-col items-center text-center gap-2">
                     <MapPin className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                     <h4 className="text-[1.25rem] font-bold text-[#240b25]">29,000+</h4>
                     <p className="text-[0.9rem] text-[#240b25]/70 font-medium">Pincodes Covered</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8963c]/50"></div>
                  <div className="flex flex-col items-center text-center gap-2">
                     <Heart className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                     <h4 className="text-[1.25rem] font-bold text-[#240b25]">100%</h4>
                     <p className="text-[0.9rem] text-[#240b25]/70 font-medium">Pan India Delivery</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c8963c]/50"></div>
                  <div className="flex flex-col items-center text-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8963c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                     <h4 className="text-[1.25rem] font-bold text-[#240b25]">1000+</h4>
                     <p className="text-[0.9rem] text-[#240b25]/70 font-medium">Happy Deliveries Daily</p>
                  </div>
               </div>

               <div className="lg:w-1/3 flex justify-center lg:justify-end">
                  <img src="https://placehold.co/400x200/fcf9f5/c8963c?text=India+Map+Graphic" alt="Map of India" className="max-w-[280px]" />
               </div>
           </div>
        </div>
      </section>

      {/* 6. YOUR HAPPINESS, OUR PRIORITY + NEED HELP       {/* 6. YOUR HAPPINESS, OUR PRIORITY + NEED HELP */}
      {/* 6. YOUR HAPPINESS, OUR PRIORITY + NEED HELP */}
      <section className="bg-[#fcf9f5] w-full border-t border-[#f3eadf] overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col xl:flex-row items-stretch justify-between">
          
          {/* Left Image (0 padding) */}
          <div className="hidden xl:flex xl:w-[24%] shrink-0 items-end justify-start">
             <img src="/images/happpy customer.png" alt="Happy Customer" className="w-full max-w-[380px] h-auto object-cover object-bottom" />
          </div>

          {/* Middle Text Block */}
          <div className="w-full xl:w-[22%] flex flex-col justify-center py-6 xl:py-8 text-center xl:text-left items-center xl:items-start shrink-0 px-6 xl:px-0 z-10">
             <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.6rem] text-[#240b25] mb-2 leading-tight">YOUR HAPPINESS,<br/>OUR PRIORITY</h3>
             <div className="flex items-center w-full mb-6 justify-center xl:justify-start">
                <Ornament className="w-10 text-[#c8963c]" />
                <div className="h-px bg-[#c8963c]/50 w-16 ml-3"></div>
             </div>

             <div className="flex flex-col gap-4 max-w-[280px] text-left">
                <div className="flex items-start gap-4">
                   <div className="mt-0.5 shrink-0 grid size-5 place-items-center rounded-full border-[1.5px] border-[#c8963c] text-[#c8963c]">
                     <Check size={12} strokeWidth={2.5} />
                   </div>
                   <p className="text-[0.95rem] text-[#240b25]/80 font-medium leading-snug">We ensure your products reach you safely and on time.</p>
                </div>
                <div className="flex items-start gap-4">
                   <div className="mt-0.5 shrink-0 grid size-5 place-items-center rounded-full border-[1.5px] border-[#c8963c] text-[#c8963c]">
                     <Check size={12} strokeWidth={2.5} />
                   </div>
                   <p className="text-[0.95rem] text-[#240b25]/80 font-medium leading-snug">If there's any delay, we're here to make it right.</p>
                </div>
                <div className="flex items-start gap-4">
                   <div className="mt-0.5 shrink-0 grid size-5 place-items-center rounded-full border-[1.5px] border-[#c8963c] text-[#c8963c]">
                     <Check size={12} strokeWidth={2.5} />
                   </div>
                   <p className="text-[0.95rem] text-[#240b25]/80 font-medium leading-snug">Your trust means the world to us.</p>
                </div>
             </div>
          </div>

          {/* Right Dark Box */}
          <div className="w-full xl:w-[54%] flex flex-col justify-center py-6 xl:py-8 shrink-0 px-6 xl:pr-12 z-10">
             <div className="bg-[#240b25] rounded-[16px] py-7 px-8 lg:px-10 text-center text-cream-50 w-full shadow-2xl">
               <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.45rem] text-white mb-1">NEED HELP WITH YOUR ORDER?</h3>
               <p className="text-[1rem] text-cream-50/80 mb-7">Our support team is just a message away!</p>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                  <div className="border-[1.5px] border-[#c8963c]/30 rounded-xl py-4 px-2 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer justify-center text-center">
                     <MessageCircle className="text-[#c8963c]" size={30} strokeWidth={1.2} />
                     <div className="flex flex-col items-center">
                       <p className="text-[0.65rem] uppercase tracking-wider font-bold mb-1">WHATSAPP</p>
                       <p className="text-[0.75rem] text-cream-50/80 leading-tight">+91 98765 43210</p>
                     </div>
                  </div>
                  <div className="border-[1.5px] border-[#c8963c]/30 rounded-xl py-4 px-2 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer justify-center text-center">
                     <Mail className="text-[#c8963c]" size={30} strokeWidth={1.2} />
                     <div className="flex flex-col items-center">
                       <p className="text-[0.65rem] uppercase tracking-wider font-bold mb-1">EMAIL</p>
                       <p className="text-[0.75rem] text-cream-50/80 leading-tight whitespace-nowrap">hello@velastia.com</p>
                     </div>
                  </div>
                  <div className="border-[1.5px] border-[#c8963c]/30 rounded-xl py-4 px-2 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer justify-center text-center">
                     <Phone className="text-[#c8963c]" size={30} strokeWidth={1.2} />
                     <div className="flex flex-col items-center">
                       <p className="text-[0.65rem] uppercase tracking-wider font-bold mb-1">CALL US</p>
                       <p className="text-[0.75rem] text-cream-50/80 leading-tight">+91 98765 43210</p>
                       <p className="text-[0.55rem] text-cream-50/50 mt-1 leading-tight">(Mon - Sat | 10AM - 7PM)</p>
                     </div>
                  </div>
                  <div className="border-[1.5px] border-[#c8963c]/30 rounded-xl py-4 px-2 flex flex-col items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer justify-center text-center">
                     <MessageCircle className="text-[#c8963c]" size={30} strokeWidth={1.2} />
                     <div className="flex flex-col items-center">
                       <p className="text-[0.65rem] uppercase tracking-wider font-bold mb-1">LIVE CHAT</p>
                       <p className="text-[0.75rem] text-cream-50/80 leading-tight">Available on<br/>our website</p>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM TRUST STRIP */}
      <section className="bg-[#fcf9f5] py-8 px-6 border-y border-[#f3eadf] w-full">
         <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-8 lg:gap-0">
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <ShieldCheck size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">100% Original<br/>Products</p>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <Shield size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">Secure<br/>Payments</p>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <RefreshCw size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">Easy Returns<br/>& Refunds</p>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <Clock size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">7 Days<br/>Return Policy</p>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <Heart size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">Loved by<br/>Thousands</p>
            </div>
            <div className="flex items-center gap-4 flex-1 min-w-[180px]">
               <span className="grid size-12 rounded-full border border-[#c8963c]/40 text-[#c8963c] place-items-center shrink-0">
                  <MapPin size={24} strokeWidth={1.5} />
               </span>
               <p className="text-[0.95rem] font-bold text-[#240b25] leading-snug">Made with Love<br/>in India</p>
            </div>
         </div>
      </section>

      {/* 8. FOOTER BANNER */}
      <section className="bg-[#240b25] py-4 lg:py-0 w-full text-cream-50 relative overflow-hidden flex items-center min-h-[100px]">
        {/* Left Flower Image */}
        <div className="hidden lg:block absolute left-0 bottom-0 h-full w-[220px] z-0">
           <img src="/images/Blush Pink Cosmos Still Life.png" alt="Flowers" className="w-full h-[150%] object-contain object-left-bottom absolute bottom-0 -left-6" />
        </div>

        <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 px-6 lg:px-12 lg:pl-[240px]">
           <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 py-4 lg:py-6">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-1">
                 <h2 className="font-display font-medium text-[1.3rem] lg:text-[1.5rem] tracking-wider uppercase text-[#c8963c]">THANK YOU FOR CHOOSING VELASTIA</h2>
                 <ScriptHeart className="w-8 h-8 text-[#c8963c] shrink-0" />
              </div>
              <p className="text-[0.95rem] text-cream-50/90 font-medium">
                 We can't wait for you to experience the joy of beauty!
              </p>
           </div>
           
           <div className="flex items-center justify-center lg:justify-end gap-6 lg:gap-8 h-full border-l border-[#c8963c]/30 pl-8 py-4 lg:py-6">
              <div className="text-right">
                 <p className="text-[0.9rem] font-bold tracking-wide leading-snug">Safe. Fast. Reliable.</p>
                 <p className="text-[0.9rem] font-medium leading-snug">Delivered With Love.</p>
              </div>
              <div className="shrink-0">
                 <img src="/images/faq footer logo.png" alt="Velastia Logo" className="size-12 lg:size-14 object-contain rounded-full" />
              </div>
           </div>
        </div>
      </section>

    </div>
  );
}
