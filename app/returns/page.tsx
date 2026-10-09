import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { 
  Package, Tag, ShieldCheck, User, Calendar, MessageSquare, Cog, Heart,
  CheckCircle2, XCircle, Smartphone, FileText, Truck, Search, Banknote,
  Lock, Award, Users, Headphones, Shield, Box, CreditCard, Check, Phone, ArrowRight,
  ChevronDown, RefreshCcw
} from "lucide-react";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Returns & Refunds | Velastia",
  description: "Our comprehensive Returns and Refunds policy."
};

export default function ReturnsPage() {
  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col font-sans text-[#240b25]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-12 pb-16 lg:py-0 min-h-[500px] flex items-center border-b border-[#f3eadf]">
        <div className="absolute inset-0 z-0 w-full h-full">
           <img src="/images/banner for returns and refund.png" alt="Hero Banner" className="w-full h-full object-cover object-right" />
        </div>

        {/* Beauty that cares badge */}
        <div className="absolute right-[5%] lg:right-[8%] top-[20%] lg:top-[25%] z-20 rounded-full size-40 lg:size-[200px] bg-[#fcf9f5]/95 backdrop-blur-sm flex items-center justify-center p-2.5 hidden md:flex shadow-xl">
           <div className="w-full h-full rounded-full border-[1.5px] border-[#c8963c] flex flex-col items-center justify-center text-center px-2">
             <span className="text-[#240b25] text-[0.95rem] lg:text-[1.05rem] font-serif uppercase tracking-wide leading-[1.5] mt-1">
               BEAUTY THAT<br/>CARES FOR YOU,<br/>ALWAYS.
             </span>
             <Heart className="w-5 h-5 text-[#c8963c] mt-3 mb-1" strokeWidth={1.5} />
           </div>
        </div>

        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="w-full lg:w-[50%] lg:py-16 bg-[#fcf9f5]/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-6 rounded-2xl lg:p-0">
             <h1 className="text-[#c8963c] font-serif font-bold uppercase tracking-[0.2em] text-[1.1rem] mb-3">RETURN & REFUNDS</h1>
             <h2 className="text-[#240b25] font-display text-[4.5rem] lg:text-[5rem] leading-[1.05] mb-1 font-medium">
               Your Happiness
             </h2>
             <div className="flex items-center gap-4 mb-6">
               <h2 className="text-[#240b25] font-script text-[5rem] lg:text-[5.5rem] leading-[0.8]">
                 Means Everything
               </h2>
               <ScriptHeart className="w-12 h-12 text-[#c8963c] shrink-0" />
             </div>
             
             <p className="text-[#240b25]/80 text-[1.3rem] font-medium max-w-[460px] mb-10 leading-relaxed">
               We want you to love what you ordered.<br/>
               But if something isn't right,<br/>
               we'll make it right - promise.
             </p>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-[600px]">
               <div className="flex flex-col items-center text-center gap-3">
                 <div className="size-16 rounded-full border-[1.5px] border-[#c8963c]/50 flex items-center justify-center bg-white shadow-sm hover:scale-105 transition-transform">
                   <Package className="text-[#c8963c]" size={28} strokeWidth={1.5} />
                 </div>
                 <p className="text-[1rem] font-bold text-[#240b25] leading-tight">Hassle-Free<br/>Returns</p>
               </div>
               
               <div className="flex flex-col items-center text-center gap-3">
                 <div className="size-16 rounded-full border-[1.5px] border-[#c8963c]/50 flex items-center justify-center bg-white shadow-sm hover:scale-105 transition-transform">
                   <Tag className="text-[#c8963c]" size={28} strokeWidth={1.5} />
                 </div>
                 <p className="text-[1rem] font-bold text-[#240b25] leading-tight">Quick<br/>Refunds</p>
               </div>
               
               <div className="flex flex-col items-center text-center gap-3">
                 <div className="size-16 rounded-full border-[1.5px] border-[#c8963c]/50 flex items-center justify-center bg-white shadow-sm hover:scale-105 transition-transform">
                   <ShieldCheck className="text-[#c8963c]" size={28} strokeWidth={1.5} />
                 </div>
                 <p className="text-[1rem] font-bold text-[#240b25] leading-tight">100% Safe<br/>& Secure</p>
               </div>
               
               <div className="flex flex-col items-center text-center gap-3">
                 <div className="size-16 rounded-full border-[1.5px] border-[#c8963c]/50 flex items-center justify-center bg-white shadow-sm hover:scale-105 transition-transform">
                   <User className="text-[#c8963c]" size={28} strokeWidth={1.5} />
                 </div>
                 <p className="text-[1rem] font-bold text-[#240b25] leading-tight">Customer First<br/>Always</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. OUR PROMISE TO YOU (Dark Banner) */}
      <section className="bg-[#240b25] w-full text-cream-50 py-10 px-6 lg:px-12 border-t border-[#f3eadf] relative z-20 lg:-mt-6 mx-auto max-w-[1500px] rounded-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6">
           {/* Left side */}
           <div className="flex items-start gap-6 lg:w-[40%]">
             <div className="grid size-16 rounded-full border-[1.5px] border-[#c8963c] place-items-center shrink-0">
               <Heart className="text-[#c8963c]" size={30} strokeWidth={1.5} />
             </div>
             <div className="flex flex-col">
               <h3 className="font-display font-medium uppercase tracking-widest text-[1.4rem] text-[#c8963c] mb-2">OUR PROMISE TO YOU</h3>
               <p className="text-[1.1rem] text-cream-50/90 leading-relaxed font-medium">
                 Every Velastia product is crafted with love and care. If it doesn't meet your expectations, we're here to help.
               </p>
             </div>
           </div>
           
           {/* Right side (4 columns) */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 lg:w-[60%] lg:border-l border-[#c8963c]/40 lg:pl-6 lg:divide-x divide-[#c8963c]/20">
             <div className="flex flex-col items-center text-center gap-3 px-2 lg:px-4">
                <Calendar className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                <p className="text-[1.05rem] font-medium leading-tight text-white">Easy 7-Day<br/>Return</p>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-2 lg:px-4 border-l border-[#c8963c]/20 lg:border-l-0">
                <MessageSquare className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                <p className="text-[1.05rem] font-medium leading-tight text-white">No Questions<br/>Asked*</p>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-2 lg:px-4">
                <Cog className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                <p className="text-[1.05rem] font-medium leading-tight text-white">Quick<br/>Resolution</p>
             </div>
             <div className="flex flex-col items-center text-center gap-3 px-2 lg:px-4 border-l border-[#c8963c]/20 lg:border-l-0">
                <ShieldCheck className="text-[#c8963c]" size={36} strokeWidth={1.2} />
                <p className="text-[1.05rem] font-medium leading-tight text-white">Peace of Mind<br/>Guaranteed</p>
             </div>
           </div>
        </div>
      </section>

      {/* 3. 3-COLUMN SECTION (Eligibility, How to Return, Not Eligible) */}
      <section className="w-full py-6 lg:py-8 px-6 lg:px-12 bg-transparent relative">
        <div className="absolute top-0 right-0 z-0 opacity-40">
           <img src="/images/Blush Pink Cosmos Still Life.png" alt="Decor" className="w-[300px]" />
        </div>
        <div className="absolute bottom-0 left-0 z-0 opacity-40">
           <img src="/images/Blush Pink Cosmos Still Life.png" alt="Decor" className="w-[300px] scale-x-[-1]" />
        </div>

        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          
          {/* Column 1: Return Eligibility */}
          <div className="flex flex-col lg:border-r border-[#c8963c]/40 lg:pr-6 lg:col-span-1">
            <h3 className="font-display font-bold uppercase tracking-widest text-[1.2rem] text-[#240b25] text-center mb-1">RETURN ELIGIBILITY</h3>
            <div className="flex justify-center mb-8">
               <Ornament className="w-12 text-[#c8963c]" />
            </div>
            
            <div className="flex flex-col gap-6">
               {[
                 "You can request a return within 7 days of delivery.",
                 "Item must be unused, unopened, and in original packaging.",
                 "All original tags, seals and invoices must be intact.",
                 "Products damaged during delivery or wrong items are eligible for return.",
                 "Hygiene & safety of our customers is our top priority."
               ].map((text, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <div className="mt-0.5 shrink-0 grid size-[22px] place-items-center rounded-full border-[1.2px] border-[#c8963c]">
                     <Check size={14} strokeWidth={3} className="text-[#c8963c]" />
                   </div>
                   <p className="text-[0.95rem] text-[#240b25]/85 font-medium leading-snug">{text}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Column 2: How to Return */}
          <div className="flex flex-col items-center lg:col-span-2 lg:px-4">
            <h3 className="font-display font-bold uppercase tracking-widest text-[1.2rem] text-[#240b25] text-center mb-1">HOW TO RETURN</h3>
            <div className="flex justify-center mb-12">
               <Ornament className="w-12 text-[#c8963c]" />
            </div>

            <div className="w-full relative flex items-start justify-center mt-6">
               
               {/* Step 1 */}
               <div className="relative z-10 flex flex-col items-center text-center w-[100px] shrink-0">
                 <div className="size-[72px] rounded-full bg-white border-[3px] border-[#f3eadf] flex items-center justify-center mb-4">
                   <Smartphone className="text-[#c8963c]" size={32} strokeWidth={1.5} />
                 </div>
                 <h5 className="text-[#c8963c] font-bold text-[0.75rem] uppercase tracking-widest mb-1">STEP 1</h5>
                 <p className="text-[0.9rem] font-bold text-[#240b25] mb-1.5 leading-tight">Raise Request</p>
                 <p className="text-[0.8rem] text-[#240b25]/70 font-medium leading-tight">Go to 'My Orders' and select the item you want to return.</p>
               </div>

               {/* Line 1 */}
               <div className="flex-1 flex items-center h-[72px] max-w-[50px] min-w-[10px]">
                 <div className="w-full border-t-[1.5px] border-dashed border-[#c8963c]/50 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#c8963c]"></div>
                 </div>
               </div>

               {/* Step 2 */}
               <div className="relative z-10 flex flex-col items-center text-center w-[100px] shrink-0">
                 <div className="size-[72px] rounded-full bg-white border-[3px] border-[#f3eadf] flex items-center justify-center mb-4">
                   <FileText className="text-[#c8963c]" size={32} strokeWidth={1.5} />
                 </div>
                 <h5 className="text-[#c8963c] font-bold text-[0.75rem] uppercase tracking-widest mb-1">STEP 2</h5>
                 <p className="text-[0.9rem] font-bold text-[#240b25] mb-1.5 leading-tight">Submit Details</p>
                 <p className="text-[0.8rem] text-[#240b25]/70 font-medium leading-tight">Tell us the reason and upload images (if required).</p>
               </div>

               {/* Line 2 */}
               <div className="flex-1 flex items-center h-[72px] max-w-[50px] min-w-[10px]">
                 <div className="w-full border-t-[1.5px] border-dashed border-[#c8963c]/50 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#c8963c]"></div>
                 </div>
               </div>

               {/* Step 3 */}
               <div className="relative z-10 flex flex-col items-center text-center w-[100px] shrink-0">
                 <div className="size-[72px] rounded-full bg-white border-[3px] border-[#f3eadf] flex items-center justify-center mb-4">
                   <Package className="text-[#c8963c]" size={32} strokeWidth={1.5} />
                 </div>
                 <h5 className="text-[#c8963c] font-bold text-[0.75rem] uppercase tracking-widest mb-1">STEP 3</h5>
                 <p className="text-[0.9rem] font-bold text-[#240b25] mb-1.5 leading-tight">Pick Up</p>
                 <p className="text-[0.8rem] text-[#240b25]/70 font-medium leading-tight">We'll schedule a free pick up from your location.</p>
               </div>

               {/* Line 3 */}
               <div className="flex-1 flex items-center h-[72px] max-w-[50px] min-w-[10px]">
                 <div className="w-full border-t-[1.5px] border-dashed border-[#c8963c]/50 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#c8963c]"></div>
                 </div>
               </div>

               {/* Step 4 */}
               <div className="relative z-10 flex flex-col items-center text-center w-[100px] shrink-0">
                 <div className="size-[72px] rounded-full bg-white border-[3px] border-[#f3eadf] flex items-center justify-center mb-4">
                   <Search className="text-[#c8963c]" size={32} strokeWidth={1.5} />
                 </div>
                 <h5 className="text-[#c8963c] font-bold text-[0.75rem] uppercase tracking-widest mb-1">STEP 4</h5>
                 <p className="text-[0.9rem] font-bold text-[#240b25] mb-1.5 leading-tight">Quality Check</p>
                 <p className="text-[0.8rem] text-[#240b25]/70 font-medium leading-tight">Our team will verify the item at our facility.</p>
               </div>

               {/* Line 4 */}
               <div className="flex-1 flex items-center h-[72px] max-w-[50px] min-w-[10px]">
                 <div className="w-full border-t-[1.5px] border-dashed border-[#c8963c]/50 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[#c8963c]"></div>
                 </div>
               </div>

               {/* Step 5 */}
               <div className="relative z-10 flex flex-col items-center text-center w-[100px] shrink-0">
                 <div className="size-[72px] rounded-full bg-white border-[3px] border-[#f3eadf] flex items-center justify-center mb-4">
                   <Banknote className="text-[#c8963c]" size={32} strokeWidth={1.5} />
                 </div>
                 <h5 className="text-[#c8963c] font-bold text-[0.75rem] uppercase tracking-widest mb-1">STEP 5</h5>
                 <p className="text-[0.9rem] font-bold text-[#240b25] mb-1.5 leading-tight">Refund Processed</p>
                 <p className="text-[0.8rem] text-[#240b25]/70 font-medium leading-tight">Once approved, your refund will be initiated instantly.</p>
               </div>
            </div>

            <div className="mt-14 bg-[#f5eee6] rounded-xl py-4 px-8 text-center max-w-[90%] w-full">
               <p className="text-[1.05rem] text-[#240b25]/90 font-medium leading-relaxed">
                 Once your return is picked up, it usually takes<br/>2-3 business days for quality check.
               </p>
            </div>
          </div>

          {/* Column 3: Not Eligible */}
          <div className="flex flex-col lg:border-l border-[#c8963c]/40 lg:pl-6 lg:col-span-1">
            <h3 className="font-display font-bold uppercase tracking-widest text-[1.2rem] text-[#240b25] text-center mb-1">NOT ELIGIBLE FOR RETURN</h3>
            <div className="flex justify-center mb-8">
               <Ornament className="w-12 text-[#c8963c]" />
            </div>

            <div className="flex flex-col gap-6">
               {[
                 "Opened or used products.",
                 "Products without original packaging, seals or tags.",
                 "Products purchased during Sale / Offers.",
                 "Gift cards, vouchers & promotional items.",
                 "Products damaged due to incorrect usage."
               ].map((text, i) => (
                 <div key={i} className="flex items-start gap-3">
                   <div className="mt-0.5 shrink-0 grid size-[22px] place-items-center rounded-full border-[1.2px] border-[#c8963c]">
                     <XCircle size={16} strokeWidth={2.5} className="text-[#c8963c]" />
                   </div>
                   <p className="text-[0.95rem] text-[#240b25]/85 font-medium leading-snug">{text}</p>
                 </div>
               ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* 4. REFUND INFORMATION */}
      <section className="w-full py-4 px-6 lg:px-12 bg-transparent">
        <div 
          className="max-w-[1500px] mx-auto rounded-[1.5rem] shadow-sm flex flex-col lg:flex-row items-stretch overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/images/REFUND INFORMATION products.png')" }}
        >
           
           {/* Empty Left Space for Background Image */}
           <div className="w-full lg:w-[32%] min-h-[150px] lg:min-h-[auto]">
           </div>
           
           {/* Middle Content */}
           <div className="w-full lg:w-[42%] flex flex-col justify-center px-4 lg:px-6 py-6 lg:py-8">
              <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.2rem] text-[#240b25] mb-5 text-center lg:text-left">REFUND INFORMATION</h3>
              <div className="flex flex-col gap-4">
                 {[
                   "Refunds are initiated within 24-48 hours after approval.",
                   "The amount will be credited to your original payment method.",
                   "Bank refunds may take 3-7 business days to reflect in your account.",
                   "For COD orders, refunds are processed to your bank account or as store credit (as preferred)."
                 ].map((text, i) => (
                   <div key={i} className="flex items-start gap-4">
                     <div className="mt-0.5 shrink-0 grid size-5 place-items-center rounded-full border-[1.2px] border-[#c8963c] bg-transparent">
                       <Check size={14} className="text-[#c8963c]" strokeWidth={3} />
                     </div>
                     <p className="text-[0.9rem] text-[#240b25]/90 font-medium leading-snug">{text}</p>
                   </div>
                 ))}
              </div>
           </div>
           
           {/* Right Light Pink Box */}
           <div className="w-full lg:w-[30%] p-4 lg:p-5 flex flex-col justify-center">
             <div className="bg-[#fcf5f7] rounded-2xl w-full h-full py-6 px-5 flex flex-row items-center gap-4">
                <div className="w-[30%] flex-shrink-0 flex items-center justify-center">
                   <img src="https://placehold.co/200x200/fcf5f7/c8963c?text=Icon" alt="Icon" className="w-full h-auto object-contain" />
                </div>
                <div className="w-[70%] flex flex-col justify-center">
                   <p className="text-[0.9rem] text-[#240b25]/90 font-medium leading-tight mb-3">
                     We believe in building trust that lasts longer than a single purchase.
                   </p>
                   <div className="flex flex-col items-start relative w-fit mt-1">
                     <h3 className="font-script text-[1.7rem] leading-tight text-[#240b25]">
                        Thank you for being <br/> a part of Velastia.
                     </h3>
                     <ScriptHeart className="w-5 h-5 text-[#c8963c] absolute -right-4 bottom-1" />
                   </div>
                </div>
             </div>
           </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full py-12 px-6 lg:px-12 bg-[#fcf9f5]">
        <div className="max-w-[1300px] mx-auto flex flex-col items-center">
          <h3 className="font-display font-extrabold uppercase tracking-widest text-[1.2rem] text-[#240b25] mb-1 text-center">FREQUENTLY ASKED QUESTIONS</h3>
          <div className="flex justify-center mb-8">
             <Ornament className="w-12 text-[#c8963c]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 w-full">
            {[
              { q: "How many days do I have to return a product?", a: "You have 7 days from the date of delivery to request a return." },
              { q: "Can I exchange a product instead of returning it?", a: "Currently, we only process returns. You can return the item for a refund and place a new order for the desired product." },
              { q: "How do I initiate a return?", a: "You can initiate a return by going to 'My Orders' in your account, selecting the order, and clicking 'Return Item'." },
              { q: "What if I received a damaged or wrong item?", a: "If you receive a damaged or incorrect item, please raise a return request within 48 hours of delivery with images of the product." },
              { q: "Will I have to pay for return shipping?", a: "No, return shipping is completely free for eligible returns." },
              { q: "Can I return a product purchased during sale?", a: "Products purchased during promotional sales or clearance events are not eligible for returns." },
              { q: "When will I get my refund?", a: "Once your return is picked up and passes our quality check, your refund will be processed within 24-48 hours. Bank refunds may take 3-7 business days to reflect." },
              { q: "Who can I contact for return related queries?", a: "You can reach out to our support team at support@velastia.com or call us directly. We are available Monday to Saturday." }
            ].map((faq, i) => (
              <details key={i} className="group bg-[#fdfbf9] border border-[#f3eadf] rounded-xl overflow-hidden hover:bg-[#f3eadf]/40 transition-colors">
                 <summary className="py-3 px-5 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden outline-none">
                    <p className="text-[0.95rem] font-medium text-[#240b25]/85">{faq.q}</p>
                    <div className="grid size-6 place-items-center rounded-full border border-[#c8963c]/50 shrink-0 group-open:rotate-180 transition-transform duration-300">
                       <ChevronDown className="text-[#c8963c]" size={14} strokeWidth={2} />
                    </div>
                 </summary>
                 <div className="px-5 pb-4 pt-1">
                    <p className="text-[#240b25]/70 text-[0.85rem] leading-relaxed">
                       {faq.a}
                    </p>
                 </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRUST BANNER & BOTTOM FOOTER */}
      <section className="w-full relative overflow-hidden border-t-2 border-[#f3eadf]">
         
         {/* Top Dark Bar */}
         <div className="bg-[#240b25] py-8 px-6 lg:px-12 text-cream-50 relative z-0">
            <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
               <div className="lg:w-[35%] flex flex-col">
                  <h3 className="font-display uppercase tracking-widest text-[0.95rem] text-[#c8963c] mb-1">WE DON'T JUST SELL BEAUTY,</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-script text-[2.6rem] text-[#c8963c] leading-none">We Stand Behind It.</h2>
                    <ScriptHeart className="w-6 h-6 text-[#c8963c]" />
                  </div>
                  <p className="text-[0.9rem] font-medium text-cream-50/90 leading-snug">
                    Your satisfaction is our success.<br/>Shop with confidence. We've got you!
                  </p>
               </div>

               <div className="lg:w-[65%] flex flex-row items-start justify-between">
                  {[
                    { icon: Lock, t1: "Safe & Secure", t2: "Transactions" },
                    { icon: Award, t1: "100% Authentic", t2: "Products" },
                    { icon: Heart, t1: "Loved by", t2: "Thousands" },
                    { icon: Headphones, t1: "Dedicated Support", t2: "Always Here" },
                  ].map((item, i) => (
                    <div key={i} className={`flex flex-col items-center text-center gap-2 px-2 lg:px-4 w-1/4 ${i !== 0 ? 'border-l-[0.5px] border-[#c8963c]/40' : ''}`}>
                      <div className="size-9 rounded-full border border-[#c8963c] flex items-center justify-center mb-1">
                        <item.icon className="text-[#c8963c]" size={16} strokeWidth={1.5} />
                      </div>
                      <p className="text-[0.75rem] font-medium leading-snug text-cream-50/90">{item.t1}<br/>{item.t2}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Middle Cream Bar */}
         <div className="bg-[#fdfbf9] py-5 px-6 lg:px-12 relative z-0 border-y border-[#eaddce]/60">
            <div className="max-w-[1500px] mx-auto flex items-center justify-between w-full">
               {[
                 { icon: Shield, t1: "100% Original", t2: "Products" },
                 { icon: RefreshCcw, t1: "7 Days Easy", t2: "Returns" },
                 { icon: Truck, t1: "Free Shipping", t2: "Above ₹999" },
                 { icon: Lock, t1: "Secure", t2: "Payments" },
                 { icon: Box, t1: "Packed with", t2: "Care" },
                 { icon: Heart, t1: "Proudly Made", t2: "in India" },
               ].map((item, i) => (
                 <div key={i} className={`flex items-center gap-3 w-1/6 px-2 lg:px-4 ${i !== 0 ? 'border-l-[0.5px] border-[#eaddce]' : ''}`}>
                    <div className="size-10 shrink-0 rounded-full border border-[#c8963c]/50 flex items-center justify-center bg-transparent">
                      <item.icon className="text-[#240b25]" size={16} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[0.85rem] font-bold text-[#240b25] leading-tight">{item.t1}</p>
                      <p className="text-[0.85rem] font-medium text-[#240b25]/70 leading-tight">{item.t2}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Bottom Dark Bar */}
         <div className="bg-[#240b25] py-6 px-6 lg:px-12 text-cream-50 relative z-0">
            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
               
               {/* Left Logo */}
               <div className="flex items-center justify-center lg:justify-start lg:w-1/3">
                  <img src="/brand/footer-logo-light.png" alt="Velastia" className="w-[180px] lg:w-[260px] h-auto object-contain" />
               </div>
               
               {/* Middle Text */}
               <div className="flex flex-col items-center lg:items-start lg:w-1/3 border-y lg:border-y-0 lg:border-x border-[#c8963c]/30 py-4 lg:py-0 px-6 lg:px-12">
                  <p className="text-[0.95rem] font-medium leading-relaxed text-cream-50/90">Beauty that cares, returns that don't.</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[0.95rem] font-medium leading-relaxed text-cream-50/90">Because you deserve the best - always.</p>
                    <ScriptHeart className="w-5 h-5 text-[#c8963c]" />
                  </div>
               </div>

               {/* Right Button */}
               <div className="flex flex-col items-center lg:items-start gap-1 lg:w-1/3 pl-0 lg:pl-12">
                  <p className="text-[0.85rem] font-bold tracking-wider uppercase text-cream-50/90">NEED HELP?</p>
                  <p className="text-[0.95rem] font-medium text-cream-50/90 mb-2">We're just a message away!</p>
                  <button className="bg-[#fdfbf9] text-[#936636] font-bold uppercase tracking-widest text-[0.85rem] py-2 px-6 rounded-md flex items-center gap-2 hover:bg-[#c8963c] hover:text-white transition-colors">
                     WHATSAPP US <Phone size={16} />
                  </button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
