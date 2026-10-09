import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { 
  ShieldCheck, Award, Heart, Lock, CheckCircle2,
  FileText, Beaker, ShoppingBag, CreditCard, Truck, Box, Droplets, Copyright, UserCheck, Link, AlertTriangle, FileClock, RefreshCcw, Mail, Phone, MapPin, Shield
} from "lucide-react";
import { Instagram, Youtube, Facebook, XIcon, Pinterest } from "@/components/ui/SocialIcons";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Terms & Conditions | Velastia",
  description: "Terms and Conditions for using Velastia services."
};

export default function TermsPage() {
  const terms = [
    {
      id: "01",
      title: "GENERAL",
      desc: "By accessing or using the Velastia website and purchasing our products, you agree to be bound by these Terms & Conditions and our Privacy Policy.",
      icon: FileText
    },
    {
      id: "02",
      title: "PRODUCT INFORMATION",
      desc: "We strive to ensure that all product descriptions, images, and information on our website are accurate. However, colors and results may vary slightly.",
      icon: Beaker
    },
    {
      id: "03",
      title: "ORDERS & ACCEPTANCE",
      desc: "All orders are subject to availability and acceptance. We reserve the right to refuse or cancel any order for any reason at our discretion.",
      icon: ShoppingBag
    },
    {
      id: "04",
      title: "PRICING & PAYMENT",
      desc: "All prices are listed in INR and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice.",
      icon: CreditCard
    },
    {
      id: "05",
      title: "SHIPPING & DELIVERY",
      desc: "We dispatch orders within the estimated time. Delivery timelines may vary based on your location and external factors.",
      icon: Truck
    },
    {
      id: "06",
      title: "RETURNS & REFUNDS",
      desc: "We have a 7-day easy return policy for unused, unopened products in their original condition. Refunds are processed as per our Return Policy.",
      icon: Box
    },
    {
      id: "07",
      title: "USE OF PRODUCTS",
      desc: "Our products are for external use only. Perform a patch test before first use. Discontinue use if irritation occurs and consult a professional if needed.",
      icon: Droplets
    },
    {
      id: "08",
      title: "INTELLECTUAL PROPERTY",
      desc: "All content on this website, including logos, images, text, and graphics, is the property of Velastia and is protected under copyright laws.",
      icon: Copyright
    },
    {
      id: "09",
      title: "USER RESPONSIBILITIES",
      desc: "You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use.",
      icon: UserCheck
    },
    {
      id: "10",
      title: "THIRD-PARTY LINKS",
      desc: "Our website may contain links to third-party websites. We are not responsible for their content, policies, or practices.",
      icon: Link
    },
    {
      id: "11",
      title: "LIMITATION OF LIABILITY",
      desc: "Velastia shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.",
      icon: AlertTriangle
    },
    {
      id: "12",
      title: "CHANGES TO TERMS",
      desc: "We may update these Terms & Conditions from time to time. Changes will be posted on this page with the updated date.",
      icon: FileClock
    }
  ];

  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col font-sans text-[#240b25]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-16 pb-20 lg:py-0 min-h-[550px] flex items-center border-b border-[#f3eadf]">
        <div className="absolute inset-0 z-0 w-full h-full">
           <img src="/images/hero section banner ingrediants.png" alt="Terms Banner" className="w-full h-full object-cover object-right" />
        </div>
        <div className="max-w-[1500px] mx-auto w-full px-6 lg:px-16 relative z-10">
           <div className="w-full lg:w-[45%] flex flex-col pt-10 lg:pt-0">
             <h3 className="font-display font-bold uppercase tracking-[0.2em] text-[#c8963c] text-[1rem] mb-4">TERMS & CONDITIONS</h3>
             <h1 className="font-display text-[3.5rem] lg:text-[4.5rem] leading-[1.05] text-[#240b25] mb-2">
               Transparency<br/>Builds Trust.
             </h1>
             <div className="flex items-center gap-4 mb-8">
               <h2 className="font-script text-[2.8rem] lg:text-[3.2rem] leading-none text-[#240b25]">
                 Here's everything you <br/> need to know.
               </h2>
               <ScriptHeart className="w-8 h-8 text-[#c8963c] mt-8 -ml-6" />
             </div>
             
             <p className="text-[1.1rem] lg:text-[1.2rem] text-[#240b25]/90 leading-relaxed font-medium max-w-lg">
               By using our website and purchasing our products, you agree to the following Terms & Conditions. We encourage you to read them carefully.
             </p>
           </div>
        </div>
      </section>

      {/* 2. DARK TRUST BANNER STRIP */}
      <section className="w-full bg-[#240b25] py-5 px-6 lg:px-12 text-cream-50 border-b-2 border-[#f3eadf]">
        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
           {/* Left Icons */}
           <div className="lg:w-[80%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:border-r border-[#c8963c]/40 lg:pr-8">
              {[
                { icon: ShieldCheck, t1: "SAFE & SECURE", t2: "Your information is always protected." },
                { icon: Award, t1: "AUTHENTIC PRODUCTS", t2: "100% genuine, responsibly sourced ingredients." },
                { icon: Heart, t1: "MADE WITH CARE", t2: "Crafted with science, driven by love." },
                { icon: Lock, t1: "YOUR TRUST", t2: "Matters to us, always." },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 ${i !== 0 ? 'lg:border-l border-[#c8963c]/30 lg:pl-6' : ''}`}>
                  <div className="size-12 shrink-0 rounded-full border-[1.5px] border-[#c8963c] flex items-center justify-center">
                    <item.icon className="text-[#c8963c]" size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[0.85rem] font-display uppercase tracking-widest text-cream-50 font-semibold mb-0.5">{item.t1}</p>
                    <p className="text-[0.8rem] font-medium leading-snug text-cream-50/80 pr-2">{item.t2}</p>
                  </div>
                </div>
              ))}
           </div>
           
           {/* Right Script Text */}
           <div className="lg:w-[20%] flex items-center justify-center lg:justify-end pl-2">
              <div className="flex items-end gap-2 relative w-fit">
                <h3 className="font-script text-[1.8rem] lg:text-[2.2rem] text-[#c8963c] leading-[1.1] whitespace-nowrap">
                  Thank you for being<br/> a part of Velastia.
                </h3>
                <ScriptHeart className="w-6 h-6 text-[#c8963c] absolute -bottom-3 right-0" />
              </div>
           </div>
        </div>
      </section>

      {/* 3. TERMS GRID SECTION */}
      <section className="w-full py-16 px-6 lg:px-12 relative bg-[#fcf9f5]">
        <div className="max-w-[1500px] mx-auto flex flex-col items-center">
          
          {/* Section Header */}
          <div className="flex flex-col items-center mb-12 text-center">
            <h3 className="font-display font-extrabold uppercase tracking-[0.2em] text-[1.4rem] text-[#240b25] mb-2">
              TERMS & CONDITIONS
            </h3>
            <Ornament className="w-12 text-[#c8963c]" />
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {terms.map((term, i) => (
              <div key={i} className="bg-[#fdfbf9] border border-[#f3eadf] rounded-[1.2rem] p-8 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 relative group overflow-hidden h-full min-h-[300px]">
                 
                 {/* Top Content */}
                 <div className="flex flex-col z-10">
                   <div className="size-10 rounded-full bg-[#240b25] text-cream-50 font-display font-bold text-[1rem] flex items-center justify-center mb-6">
                     {term.id}
                   </div>
                   <h4 className="font-display font-bold uppercase tracking-widest text-[1.1rem] text-[#240b25] mb-3">
                     {term.title}
                   </h4>
                   <p className="text-[0.95rem] text-[#240b25]/85 font-medium leading-relaxed">
                     {term.desc}
                   </p>
                 </div>
                 
                 {/* Bottom Icon */}
                 <div className="mt-8 z-10">
                   <term.icon className="text-[#c8963c]/40 w-14 h-14" strokeWidth={1} />
                 </div>
                 
                 {/* Decorative background circle */}
                 <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#c8963c]/5 rounded-full blur-xl group-hover:bg-[#c8963c]/10 transition-colors" />
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. TRUST INSPIRES BANNER */}
      <section className="w-full pb-12 px-6 lg:px-12 bg-[#fcf9f5]">
        <div 
          className="max-w-[1400px] mx-auto rounded-[1.5rem] py-8 px-8 lg:px-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 bg-cover bg-center bg-no-repeat relative overflow-hidden"
          style={{ backgroundImage: "url('/images/decor terms and conditions.png')" }}
        >
           {/* Fallback overlay in case text needs contrast, though image is light */}
           <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-[1.5rem]"></div>
           
           {/* Space for background image graphics on left */}
           <div className="lg:w-[25%] hidden lg:block"></div>

           {/* Middle Text */}
           <div className="lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left relative z-10">
              <h3 className="font-display font-bold text-[1.6rem] lg:text-[1.7rem] text-[#240b25] mb-2">
                Your trust inspires everything we do.
              </h3>
              <p className="text-[0.95rem] font-medium text-[#240b25]/80 mb-6">
                We believe in honesty, quality, and care – in our products and our promises.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start">
                 {[
                   { icon: CheckCircle2, t: "Honest Ingredients" },
                   { icon: Award, t: "Real Results" },
                   { icon: Heart, t: "Always With You" }
                 ].map((feat, i) => (
                   <div key={i} className={`flex items-center gap-2 px-3 lg:px-4 ${i !== 0 ? 'border-l border-[#c8963c]/20' : 'pl-0'}`}>
                     <div className="size-8 rounded-full border border-[#c8963c] flex items-center justify-center">
                       <feat.icon className="text-[#c8963c]" size={14} strokeWidth={1.5} />
                     </div>
                     <p className="text-[0.8rem] font-bold text-[#240b25] whitespace-nowrap">{feat.t}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Right Script Text */}
           <div className="lg:w-[30%] flex justify-center lg:justify-end relative z-10">
              <div className="relative w-fit">
                <h3 className="font-script text-[2rem] lg:text-[2.2rem] leading-[1.2] text-[#240b25] text-center lg:text-right whitespace-nowrap pr-2">
                  Thank you for choosing<br/>Velastia. We're honored to<br/>be part of your journey
                </h3>
                <ScriptHeart className="w-8 h-8 text-[#c8963c] absolute -right-2 bottom-0" />
              </div>
           </div>
        </div>
      </section>

      {/* 5. CUSTOM FOOTER FOR TERMS PAGE */}
      <section className="w-full bg-[#240b25] text-cream-50 pt-12">
        {/* Top Feature Bar */}
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-10 border-b border-[#c8963c]/30">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { icon: Award, t1: "100% AUTHENTIC", t2: "Original products, always." },
                { icon: CreditCard, t1: "SECURE PAYMENTS", t2: "Multiple safe payment options." },
                { icon: RefreshCcw, t1: "EASY RETURNS", t2: "7 days easy return policy." },
                { icon: Truck, t1: "FAST DELIVERY", t2: "Delivered with care and on time." },
                { icon: Heart, t1: "DEDICATED SUPPORT", t2: "We're here for you, always." },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 lg:justify-center ${i !== 0 ? 'lg:border-l border-[#c8963c]/20 lg:pl-6' : ''}`}>
                  <div className="size-10 lg:size-12 shrink-0 rounded-full border border-[#c8963c] flex items-center justify-center">
                    <item.icon className="text-[#c8963c]" size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[0.8rem] font-display uppercase tracking-widest text-cream-50 font-semibold mb-0.5">{item.t1}</p>
                    <p className="text-[0.75rem] font-medium leading-snug text-cream-50/80">{item.t2}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Middle Main Footer Content */}
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-6">
              
              {/* Brand Column */}
              <div className="lg:col-span-3 flex flex-col items-start pr-4">
                 <img src="/brand/footer-logo-light.png" alt="Velastia" className="w-[180px] h-auto object-contain mb-6" />
                 <p className="text-[0.9rem] leading-relaxed text-cream-50/90 mb-6 font-medium">
                   Clean beauty backed by science and made to make you feel beautiful, every day.
                 </p>
                 <div className="flex items-center gap-3">
                   {[Instagram, Youtube, Facebook, XIcon, Pinterest].map((Icon, i) => (
                     <div key={i} className="size-8 rounded-full border border-cream-50/40 flex items-center justify-center hover:border-[#c8963c] hover:text-[#c8963c] transition-colors cursor-pointer">
                       <Icon className="size-4" />
                     </div>
                   ))}
                 </div>
              </div>

              {/* Quick Links Column */}
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-6 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[1rem] text-cream-50 mb-6">QUICK LINKS</h4>
                 <div className="flex flex-col gap-3">
                   {[
                     { label: "Shop All", href: "/shop" },
                     { label: "Best Sellers", href: "/shop" },
                     { label: "New Arrivals", href: "/shop" },
                     { label: "Offers", href: "/shop" },
                     { label: "Gift Cards", href: "/shop" }
                   ].map(link => (
                     <a key={link.label} href={link.href} className="text-[0.9rem] font-medium text-cream-50/80 hover:text-[#c8963c] transition-colors">{link.label}</a>
                   ))}
                 </div>
              </div>

              {/* Help Column */}
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-6 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[1rem] text-cream-50 mb-6">HELP</h4>
                 <div className="flex flex-col gap-3">
                   {[
                     { label: "FAQs", href: "/faqs" },
                     { label: "Shipping & Delivery", href: "/shipping" },
                     { label: "Return & Refunds", href: "/returns" },
                     { label: "Terms & Conditions", href: "/terms" },
                     { label: "Privacy Policy", href: "/privacy" }
                   ].map(link => (
                     <a key={link.label} href={link.href} className="text-[0.9rem] font-medium text-cream-50/80 hover:text-[#c8963c] transition-colors">{link.label}</a>
                   ))}
                 </div>
              </div>

              {/* Contact Us Column */}
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-6 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[1rem] text-cream-50 mb-6">CONTACT US</h4>
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 text-[0.9rem] font-medium text-cream-50/80">
                     <Mail size={16} className="text-[#c8963c]" /> hello@velastia.com
                   </div>
                   <div className="flex flex-col gap-1 text-[0.9rem] font-medium text-cream-50/80">
                     <div className="flex items-center gap-3">
                       <Phone size={16} className="text-[#c8963c]" /> +91 98765 43210
                     </div>
                     <span className="pl-7 text-[0.8rem] text-cream-50/60">(Mon - Sat | 10AM - 7PM)</span>
                   </div>
                   <div className="flex items-center gap-3 text-[0.9rem] font-medium text-cream-50/80">
                     <MapPin size={16} className="text-[#c8963c]" /> Mumbai, India
                   </div>
                 </div>
              </div>

              {/* Newsletter Column */}
              <div className="lg:col-span-3 flex flex-col items-start lg:pl-6 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[1rem] text-cream-50 mb-4">NEWSLETTER</h4>
                 <p className="text-[0.9rem] font-medium text-cream-50/80 mb-6 leading-relaxed">
                   Be the first to know about new launches and exclusive offers.
                 </p>
                 <div className="w-full flex flex-col gap-3">
                   <input type="email" placeholder="Enter your email address" className="w-full bg-transparent border border-cream-50/30 rounded-md py-2.5 px-4 text-[0.9rem] text-cream-50 placeholder:text-cream-50/50 focus:outline-none focus:border-[#c8963c]" />
                   <button className="w-full bg-[#c8963c] text-white font-bold uppercase tracking-widest text-[0.9rem] py-2.5 rounded-md hover:bg-[#a67c30] transition-colors">
                     SUBSCRIBE
                   </button>
                 </div>
                 <div className="flex items-center gap-2 mt-4 text-[0.8rem] font-medium text-cream-50/60">
                   <Shield size={14} className="text-[#c8963c]" /> We respect your privacy.
                 </div>
              </div>

           </div>
        </div>

        {/* Bottom Cream Bar */}
        <div className="w-full bg-[#fdfbf9] py-4 px-6">
          <div className="max-w-[1500px] mx-auto flex items-center justify-center gap-3">
             <Heart size={18} className="text-[#c8963c]" strokeWidth={2} />
             <p className="text-[0.95rem] font-medium text-[#240b25]">
               Made with love for your skin. Thank you for being a part of the Velastia family.
             </p>
             <ScriptHeart className="w-6 h-6 text-[#c8963c]" />
          </div>
        </div>
      </section>

    </div>
  );
}
