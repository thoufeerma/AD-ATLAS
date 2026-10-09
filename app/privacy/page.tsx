import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { 
  ShieldCheck, Lock, User, Heart, FileText, BadgeCheck, AppWindow, Globe, 
  Mail, Eye, MousePointer2, ChevronDown, CheckCircle2, Award, Truck, Box, 
  Phone, MapPin, Shield, RefreshCcw, Cookie
} from "lucide-react";
import { Instagram, Youtube, Facebook, XIcon, Pinterest } from "@/components/ui/SocialIcons";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Privacy Policy | Velastia",
  description: "Read our Privacy Policy to understand how Velastia protects your data."
};

export default function PrivacyPage() {
  const policies = [
    {
      id: "01", icon: User, title: "INFORMATION WE COLLECT",
      desc: "We collect personal information you provide to us such as your name, email address, phone number, shipping address, payment details, and order history when you shop with us or contact us."
    },
    {
      id: "02", icon: AppWindow, title: "HOW WE USE YOUR INFORMATION",
      desc: "We use your information to process your orders, provide customer support, improve your experience, send important updates, and personalize our services for you."
    },
    {
      id: "03", icon: ShieldCheck, title: "INFORMATION SHARING",
      desc: "We do not sell or rent your personal information. We only share your data with trusted third parties who help us operate our website and deliver our services – always under strict confidentiality."
    },
    {
      id: "04", icon: Lock, title: "DATA SECURITY",
      desc: "We implement advanced security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. Your information is stored securely and access is restricted."
    },
    {
      id: "05", icon: Cookie, title: "COOKIES & TRACKING",
      desc: "We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can choose to disable cookies in your browser settings at any time."
    },
    {
      id: "06", icon: Mail, title: "YOUR CHOICES",
      desc: "You have the right to access, update, or delete your personal information at any time. You can also opt-out of marketing communications from us whenever you like."
    },
    {
      id: "07", icon: Globe, title: "THIRD-PARTY LINKS",
      desc: "Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their policies before sharing any personal information."
    },
    {
      id: "08", icon: FileText, title: "CHANGES TO THIS POLICY",
      desc: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date. We encourage you to review it periodically."
    }
  ];

  const faqs = [
    { q: "What personal information do you collect?", a: "We collect information you provide such as your name, email, and shipping address when making a purchase or signing up for our newsletter." },
    { q: "Can I request to delete my data?", a: "Yes, you can request data deletion at any time by contacting our support team via email." },
    { q: "How do you use my information?", a: "We use your information to process transactions, improve our products, and communicate with you about your orders or exclusive offers." },
    { q: "Do you use cookies?", a: "Yes, we use cookies to personalize your shopping experience and analyze site traffic. You can disable them in your browser settings." },
    { q: "Do you share my information with anyone?", a: "We never sell your data. We only share it with trusted third-party partners (like shipping providers) necessary to fulfill your orders." },
    { q: "How can I contact you about privacy concerns?", a: "You can reach our dedicated privacy team anytime at hello@velastia.com." },
    { q: "How do you protect my data?", a: "We use industry-standard encryption and strict access controls to ensure your personal and payment data is kept secure." },
    { q: "Is my payment information safe?", a: "Absolutely. All payments are processed through secure, PCI-compliant payment gateways, and we do not store your credit card details." }
  ];

  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col font-sans text-[#240b25]">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-12 pb-12 lg:pb-16 min-h-[500px] flex items-center border-b border-[#f3eadf] overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full">
           <img src="/images/faqs section hero banner.png" alt="Privacy Banner" className="w-full h-full object-cover object-right lg:object-center" />
        </div>
        <div className="max-w-[1500px] mx-auto w-full px-6 lg:px-16 flex flex-col relative z-10 pt-10 lg:pt-0">
           
           {/* Content (Left aligned over background) */}
           <div className="w-full lg:w-[45%] flex flex-col relative z-10">
             <h3 className="font-display font-bold uppercase tracking-[0.2em] text-[#240b25] text-[1.1rem] mb-4">PRIVACY POLICY</h3>
             <h1 className="font-display text-[4rem] lg:text-[5rem] leading-[1.05] text-[#240b25] mb-2 flex flex-col">
               <span>Your Privacy.</span>
               <span className="text-[#c8963c] italic font-serif">Our Promise.</span>
             </h1>
             <div className="flex items-center gap-4 mb-8">
               <h2 className="font-script text-[2.6rem] lg:text-[3rem] leading-none text-[#240b25]">
                 Because your trust means everything.
               </h2>
               <ScriptHeart className="w-8 h-8 text-[#c8963c] mt-4" />
             </div>
             
             <p className="text-[1.1rem] lg:text-[1.2rem] text-[#240b25]/90 leading-relaxed font-medium max-w-lg mb-10">
               At Velastia, we believe beauty is personal – and so is your privacy. We are committed to protecting your information and being transparent about how we use it.
             </p>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[
                  { icon: ShieldCheck, t1: "Your Data is", t2: "Safe with Us" },
                  { icon: Lock, t1: "We Never Share", t2: "Without Consent" },
                  { icon: User, t1: "You're Always", t2: "in Control" },
                  { icon: Heart, t1: "Transparency is", t2: "Our Standard" },
                ].map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 ${i !== 0 ? 'lg:border-l border-[#c8963c]/30 lg:pl-4' : ''}`}>
                     <div className="size-10 rounded-full border-[1.5px] border-[#c8963c] flex items-center justify-center shrink-0">
                        <f.icon className="text-[#c8963c]" size={18} strokeWidth={1.5} />
                     </div>
                     <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#240b25] leading-tight">
                       {f.t1}<br/>{f.t2}
                     </p>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </section>

      {/* 2. DARK BANNER */}
      <section className="w-full bg-[#240b25] py-6 px-6 lg:px-12 text-cream-50 border-b-2 border-[#f3eadf]">
        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
           <div className="lg:w-[45%] flex flex-col">
              <h3 className="font-display font-bold uppercase tracking-[0.15em] text-[#c8963c] text-[1.1rem] mb-3">
                OUR COMMITMENT TO YOU
              </h3>
              <p className="text-[0.95rem] font-medium leading-relaxed text-cream-50/90">
                We follow strict security measures and industry best practices to ensure your personal information remains confidential and protected. Your trust inspires us to always do better.
              </p>
           </div>
           
           <div className="lg:w-[50%] grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
              {[
                { icon: Lock, t: "Secure" },
                { icon: FileText, t: "Transparent" },
                { icon: Heart, t: "Responsible" },
                { icon: BadgeCheck, t: "Trustworthy" },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col items-center justify-center gap-3 ${i !== 0 ? 'md:border-l border-[#c8963c]/20' : ''}`}>
                  <item.icon className="text-[#c8963c]" size={36} strokeWidth={1} />
                  <p className="text-[0.85rem] font-display uppercase tracking-widest text-cream-50 font-semibold">{item.t}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. POLICY GRID SECTION */}
      <section className="w-full py-10 px-6 lg:px-12 relative bg-[#fcf9f5]">
        <div className="max-w-[1400px] mx-auto flex flex-col items-center">
          <h3 className="font-display font-extrabold uppercase tracking-[0.2em] text-[1.4rem] text-[#240b25] mb-8 text-center">
            HOW WE PROTECT & RESPECT YOUR PRIVACY
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {policies.map((pol, i) => (
              <div key={i} className="bg-white border border-[#f3eadf] rounded-[1.2rem] p-8 flex flex-col hover:shadow-lg transition-shadow duration-300 relative group min-h-[280px]">
                 <div className="size-8 rounded-full bg-[#240b25] text-cream-50 font-display font-bold text-[0.85rem] flex items-center justify-center absolute top-6 left-6">
                   {pol.id}
                 </div>
                 <div className="flex justify-center mb-6 mt-2">
                   <pol.icon className="text-[#c8963c]" size={32} strokeWidth={1.2} />
                 </div>
                 <h4 className="font-display font-bold uppercase tracking-widest text-[1rem] text-[#240b25] mb-3 text-center">
                   {pol.title}
                 </h4>
                 <p className="text-[0.9rem] text-[#240b25]/85 font-medium leading-relaxed text-center">
                   {pol.desc}
                 </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIGHT PROMISE BANNER */}
      <section className="w-full pb-8 lg:pb-10 px-6 lg:px-12 bg-[#fcf9f5]">
        <div 
          className="max-w-[1400px] mx-auto rounded-[1.5rem] py-6 px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 bg-cover bg-center bg-no-repeat relative overflow-hidden"
          style={{ backgroundImage: "url('/images/Your privacy is more than a policy – it\\'s our promise.png')" }}
        >
           {/* Space for background image graphics on left */}
           <div className="lg:w-[25%] hidden lg:block"></div>

           {/* Middle Text */}
           <div className="lg:w-[35%] flex flex-col items-center lg:items-start text-center lg:text-left relative z-10">
              <h3 className="font-display font-bold text-[1.6rem] lg:text-[1.8rem] leading-[1.2] text-[#240b25] mb-3">
                Your privacy is more than a policy – it's our promise.
              </h3>
              <p className="text-[0.95rem] font-medium text-[#240b25]/80">
                We are dedicated to creating a safe, secure, and trustworthy space where you can shop, explore, and glow with confidence.
              </p>
           </div>
           
           {/* Right Icons */}
           <div className="lg:w-[40%] grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {[
                { icon: Mail, t1: "No Spam,", t2: "We Promise" },
                { icon: Lock, t1: "100% Safe", t2: "& Secure" },
                { icon: Eye, t1: "Only What We", t2: "Need" },
                { icon: MousePointer2, t1: "You're Always", t2: "in Control" },
              ].map((feat, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                   <div className="size-12 rounded-xl border-[1.5px] border-[#c8963c] flex items-center justify-center">
                     <feat.icon className="text-[#c8963c]" size={22} strokeWidth={1.5} />
                   </div>
                   <p className="text-[0.8rem] font-bold text-[#240b25] leading-tight mt-1">{feat.t1}<br/>{feat.t2}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="w-full pt-2 pb-10 lg:pt-4 lg:pb-12 px-6 lg:px-12 bg-[#fcf9f5]">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center mb-6 text-center">
            <h3 className="font-display font-bold uppercase tracking-[0.15em] text-[1.5rem] text-[#240b25] mb-2">
              FREQUENTLY ASKED QUESTIONS
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-[#c8963c]/50"></div>
              <Ornament className="w-8 text-[#c8963c]" />
              <div className="w-12 h-px bg-[#c8963c]/50"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 w-full">
            {/* Left Column */}
            <div className="flex flex-col border border-[#eaddce] bg-[#fdfbf9] rounded-xl overflow-hidden shadow-sm">
              {faqs.slice(0, 4).map((faq, i) => (
                <details key={i} className={`group [&_summary::-webkit-details-marker]:hidden ${i !== 3 ? 'border-b border-[#eaddce]' : ''}`}>
                   <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                      <h4 className="font-sans font-semibold text-[0.95rem] text-[#240b25] pr-4">{faq.q}</h4>
                      <div className="size-6 shrink-0 rounded-full border border-[#c8963c]/30 flex items-center justify-center text-[#c8963c] transition-transform duration-300 group-open:rotate-180">
                         <ChevronDown size={14} />
                      </div>
                   </summary>
                   <div className="px-5 pb-5 pt-0">
                      <p className="font-sans text-[#240b25]/80 text-[0.9rem] leading-relaxed">
                         {faq.a}
                      </p>
                   </div>
                </details>
              ))}
            </div>
            
            {/* Right Column */}
            <div className="flex flex-col border border-[#eaddce] bg-[#fdfbf9] rounded-xl overflow-hidden shadow-sm mt-4 md:mt-0">
              {faqs.slice(4, 8).map((faq, i) => (
                <details key={i} className={`group [&_summary::-webkit-details-marker]:hidden ${i !== 3 ? 'border-b border-[#eaddce]' : ''}`}>
                   <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                      <h4 className="font-sans font-semibold text-[0.95rem] text-[#240b25] pr-4">{faq.q}</h4>
                      <div className="size-6 shrink-0 rounded-full border border-[#c8963c]/30 flex items-center justify-center text-[#c8963c] transition-transform duration-300 group-open:rotate-180">
                         <ChevronDown size={14} />
                      </div>
                   </summary>
                   <div className="px-5 pb-5 pt-0">
                      <p className="font-sans text-[#240b25]/80 text-[0.9rem] leading-relaxed">
                         {faq.a}
                      </p>
                   </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY CUSTOM FOOTER */}
      <section className="w-full bg-[#240b25] text-cream-50 pt-8 relative overflow-hidden">
        <div className="max-w-[1250px] mx-auto px-6 lg:px-12 pb-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
              
              {/* Brand Column */}
              <div className="lg:col-span-3 flex flex-col items-start pr-4 lg:pr-6">
                 <img src="/brand/footer-logo-light.png" alt="Velastia" className="w-[185px] h-auto object-contain mb-5" />
                 <p className="text-[0.85rem] leading-relaxed text-cream-50/90 mb-5 font-medium">
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
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-8 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[0.95rem] text-cream-50 mb-5">QUICK LINKS</h4>
                 <div className="flex flex-col gap-3">
                   {[
                     { label: "Shop All", href: "/shop" },
                     { label: "Best Sellers", href: "/shop" },
                     { label: "New Arrivals", href: "/shop" },
                     { label: "Offers", href: "/shop" },
                     { label: "Gift Cards", href: "/shop" }
                   ].map(link => (
                     <a key={link.label} href={link.href} className="text-[0.85rem] font-medium text-cream-50/80 hover:text-[#c8963c] transition-colors">{link.label}</a>
                   ))}
                 </div>
              </div>

              {/* Customer Care Column */}
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-8 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[0.95rem] text-cream-50 mb-5 whitespace-nowrap">CUSTOMER CARE</h4>
                 <div className="flex flex-col gap-3">
                   {[
                     { label: "FAQs", href: "/faqs" },
                     { label: "Shipping & Delivery", href: "/shipping" },
                     { label: "Return & Refunds", href: "/returns" },
                     { label: "Terms & Conditions", href: "/terms" },
                     { label: "Privacy Policy", href: "/privacy" }
                   ].map(link => (
                     <a key={link.label} href={link.href} className="text-[0.85rem] font-medium text-cream-50/80 hover:text-[#c8963c] transition-colors whitespace-nowrap">{link.label}</a>
                   ))}
                 </div>
              </div>

              {/* Contact Us Column */}
              <div className="lg:col-span-2 flex flex-col items-start lg:pl-8 lg:border-l border-[#c8963c]/20">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[0.95rem] text-cream-50 mb-5 whitespace-nowrap">CONTACT US</h4>
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2.5 text-[0.85rem] font-medium text-cream-50/80 whitespace-nowrap">
                     <Mail size={15} className="text-[#c8963c]" /> hello@velastia.com
                   </div>
                   <div className="flex flex-col gap-0.5 text-[0.85rem] font-medium text-cream-50/80">
                     <div className="flex items-center gap-2.5 whitespace-nowrap">
                       <Phone size={15} className="text-[#c8963c]" /> +91 98765 43210
                     </div>
                     <span className="pl-6 text-[0.75rem] text-cream-50/60 whitespace-nowrap">(Mon - Sat | 10AM - 7PM)</span>
                   </div>
                   <div className="flex items-center gap-2.5 text-[0.85rem] font-medium text-cream-50/80">
                     <MapPin size={15} className="text-[#c8963c]" /> Mumbai, India
                   </div>
                 </div>
              </div>

              {/* Newsletter Column */}
              <div className="lg:col-span-3 flex flex-col items-start lg:pl-8 lg:border-l border-[#c8963c]/20 relative">
                 <h4 className="font-display uppercase tracking-widest font-bold text-[0.95rem] text-cream-50 mb-3">NEWSLETTER</h4>
                 <p className="text-[0.85rem] font-medium text-cream-50/80 mb-5 leading-relaxed relative z-10">
                   Stay updated with our latest offers, launches & beauty tips.
                 </p>
                 <div className="w-full flex flex-col gap-3 relative z-10">
                   <input type="email" placeholder="Enter your email address" className="w-full bg-transparent border border-cream-50/30 rounded-md py-2 px-3 text-[0.85rem] text-cream-50 placeholder:text-cream-50/50 focus:outline-none focus:border-[#c8963c]" />
                   <button className="w-full bg-[#c8963c] text-white font-bold uppercase tracking-widest text-[0.85rem] py-2 rounded-md hover:bg-[#a67c30] transition-colors">
                     SUBSCRIBE
                   </button>
                 </div>
                 <div className="flex items-center gap-2 mt-3 text-[0.75rem] font-medium text-cream-50/60 relative z-10">
                   <Shield size={12} className="text-[#c8963c]" /> We respect your privacy.
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Feature Bar */}
        <div className="w-full bg-[#fdfbf9] py-5 px-6 border-t border-[#eaddce] relative z-10">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-center">
             {[
               { icon: Lock, t1: "Secure", t2: "Payments" },
               { icon: RefreshCcw, t1: "Easy", t2: "Returns" },
               { icon: Truck, t1: "Free Shipping", t2: "Above ₹999" },
               { icon: ShieldCheck, t1: "7 Days Easy", t2: "Return" },
               { icon: Box, t1: "Packed with", t2: "Care" },
               { icon: Heart, t1: "Dedicated", t2: "Support" },
             ].map((f, i) => (
               <div key={i} className="flex items-center gap-2 py-2 w-[45%] md:w-[30%] lg:w-auto px-2 lg:px-5 xl:px-6">
                  <div className="size-12 lg:size-14 shrink-0 rounded-full border border-[#c8963c]/40 flex items-center justify-center">
                     <f.icon className="text-[#c8963c]" size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                     <p className="text-[0.95rem] font-bold text-[#240b25] leading-tight">{f.t1}</p>
                     <p className="text-[0.85rem] font-medium text-[#240b25]/70 leading-tight">{f.t2}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Absolute Right Decorative Image */}
        <div className="absolute right-0 bottom-0 lg:-right-2 xl:right-0 w-[160px] lg:w-[180px] xl:w-[200px] pointer-events-none z-20 hidden lg:block">
           <img src="/images/privacy policy footer image.png" alt="Decor" className="w-full h-auto object-contain drop-shadow-2xl" />
        </div>
      </section>

    </div>
  );
}
