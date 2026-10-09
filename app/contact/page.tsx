import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Mail, Phone, MapPin, MessageCircle, Heart, Headset, Droplets, RefreshCcw, Users, MessagesSquare, Lock, RotateCcw, Truck, CreditCard, Gift, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Facebook, Youtube, Instagram, XIcon, Pinterest } from "@/components/ui/SocialIcons";
import OptionalPhoto from "@/components/ui/OptionalPhoto";
import ContactForm from "@/components/forms/ContactForm";
import { Ornament, ScriptHeart } from "@/components/ui/Ornament";
import { getHomeContent } from "@/lib/api/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact");
}

const INK = "text-[#1d052b]";
const GOLD = "text-[#c8963c]";

export default async function ContactPage() {
  const content = await getHomeContent();
  const testimonials = content.testimonials;
  return (
    <div className="bg-[#fcf9f5] w-full overflow-hidden flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#fcf9f5] py-14 lg:py-20">
        <OptionalPhoto src="/images/contact hero banner.png" alt="Contact Us" sizes="100vw" className="absolute inset-0 w-full h-full object-cover object-right lg:object-center" />
        <div className="relative z-10 container-vel flex flex-col justify-center">
          <div className="max-w-[650px]">
            <div className="relative inline-block">
              <h1 className={`font-display text-[2.5rem] lg:text-[4.2rem] font-medium uppercase leading-[1.05] ${INK}`}>
                We&apos;d love to<br/>hear from <span className={GOLD}>you</span>
              </h1>
              <ScriptHeart className={`absolute -right-12 lg:-right-16 top-6 lg:top-8 w-10 h-10 lg:w-14 lg:h-14 ${GOLD}`} />
            </div>
            
            <p className={`mt-2 font-script text-[2rem] lg:text-[2.75rem] ${INK}`}>
              We&apos;re here for you, always.
            </p>
            <p className="mt-6 text-[0.95rem] lg:text-[1.1rem] text-[#1d052b]/85 max-w-[480px] leading-relaxed font-medium">
              Whether you have a question, need help with your order, or just want to say hello &ndash; our team is here to make your experience beautiful, effortless and memorable.
            </p>
            
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="grid size-12 lg:size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-[#1d052b] bg-transparent">
                  <Heart className="size-5 lg:size-6 text-[#1d052b]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-[0.7rem] lg:text-[0.8rem] font-bold uppercase tracking-wide text-[#1d052b]">We Care</h3>
                  <p className="text-[0.65rem] lg:text-[0.8rem] text-[#1d052b]/80 mt-1 font-medium leading-snug">Your happiness<br/>means everything.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-12 lg:size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-[#1d052b] bg-transparent">
                  <Headset className="size-5 lg:size-6 text-[#1d052b]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-[0.7rem] lg:text-[0.8rem] font-bold uppercase tracking-wide text-[#1d052b]">We Listen</h3>
                  <p className="text-[0.65rem] lg:text-[0.8rem] text-[#1d052b]/80 mt-1 font-medium leading-snug">We&apos;re here to<br/>truly understand.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-12 lg:size-14 shrink-0 place-items-center rounded-full border-[1.5px] border-[#1d052b] bg-transparent">
                  <RefreshCcw className="size-5 lg:size-6 text-[#1d052b]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-[0.7rem] lg:text-[0.8rem] font-bold uppercase tracking-wide text-[#1d052b]">We Solve</h3>
                  <p className="text-[0.65rem] lg:text-[0.8rem] text-[#1d052b]/80 mt-1 font-medium leading-snug">Quick solutions,<br/>every single time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How Can We Help You? */}
      <section className="pt-6 pb-10 lg:pt-10 lg:pb-12 bg-[#fcf9f5] px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-8">
            <h2 className={`font-display text-2xl lg:text-[1.75rem] font-semibold uppercase tracking-wider ${INK}`}>How Can We Help You?</h2>
            <Ornament className="mx-auto mt-2 w-28" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
            {[
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#c8963c]"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, title: "Order Support", text: "Help with orders,\npayments & delivery" },
              { icon: <Droplets className="size-6 text-[#c8963c]" strokeWidth={2} />, title: "Product Queries", text: "Find the right product\nfor your skin" },
              { icon: <RefreshCcw className="size-6 text-[#c8963c]" strokeWidth={2} />, title: "Returns & Refunds", text: "Hassle-free returns\nand easy refunds" },
              { icon: <Users className="size-6 text-[#c8963c]" strokeWidth={2} />, title: "Collaborations", text: "Influencer, brand &\ncreator partnerships" },
              { icon: <MessagesSquare className="size-6 text-[#c8963c]" strokeWidth={2} />, title: "General Queries", text: "Any other questions?\nWe're all ears!" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center px-4 py-6 lg:py-8 border border-[#eaddce] bg-[#fbf8f4] rounded hover:shadow-md transition-shadow h-full">
                <span className="grid size-[60px] place-items-center rounded-full border border-[#c8963c] bg-white mb-5 shadow-sm">
                  {item.icon}
                </span>
                <h3 className={`font-display text-[0.95rem] lg:text-[1.05rem] font-bold uppercase tracking-wider ${INK}`}>{item.title}</h3>
                <p className="text-[0.8rem] lg:text-[0.85rem] text-[#1d052b]/90 mt-2.5 whitespace-pre-line leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Get In Touch 3-Column Block */}
      <section className="pb-16 pt-0 px-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row w-full rounded-md overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#eaddce]">
          
          {/* Left: Contact Form */}
          <div className="bg-[#1f0b24] p-8 lg:p-10 lg:w-[38%] flex flex-col justify-center">
            <ContactForm />
          </div>
          
          {/* Middle: Contact Info */}
          <div className="bg-[#faf5ef] p-8 lg:p-10 flex flex-col justify-center border-y lg:border-y-0 lg:border-x border-[#eaddce] lg:w-[30%]">
            <div className="text-center mb-10">
              <h2 className={`font-display text-xl lg:text-2xl uppercase tracking-widest font-bold ${INK}`}>Get In Touch</h2>
              <Ornament className="mx-auto mt-2 w-28" />
            </div>
            
            <div className="space-y-7 lg:px-2">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-[#c8963c] bg-white shadow-sm">
                  <Mail className="size-[22px] text-[#c8963c]" strokeWidth={1.5} />
                </span>
                <div className="pt-1">
                  <h3 className={`text-[0.85rem] font-extrabold uppercase tracking-wider ${INK}`}>Email Us</h3>
                  <a href="mailto:hello@velastia.com" className="text-[0.85rem] text-[#1d052b] hover:text-[#c8963c] font-medium transition-colors mt-0.5 inline-block">hello@velastia.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-[#c8963c] bg-white shadow-sm">
                  <Phone className="size-[22px] text-[#c8963c]" strokeWidth={1.5} />
                </span>
                <div className="pt-1">
                  <h3 className={`text-[0.85rem] font-extrabold uppercase tracking-wider ${INK}`}>Call Us</h3>
                  <a href="tel:+919876543210" className="text-[0.85rem] text-[#1d052b] font-medium hover:text-[#c8963c] transition-colors mt-0.5 inline-block">+91 98765 43210</a>
                  <p className="text-[0.75rem] text-[#1d052b]/80 mt-0.5 font-medium">(Mon &ndash; Sat | 10AM &ndash; 7PM)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-[#c8963c] bg-white shadow-sm">
                  <MessageCircle className="size-[22px] text-[#c8963c]" strokeWidth={1.5} />
                </span>
                <div className="pt-1">
                  <h3 className={`text-[0.85rem] font-extrabold uppercase tracking-wider ${INK}`}>Whatsapp Us</h3>
                  <a href="https://wa.me/919876543210" className="text-[0.85rem] text-[#1d052b] font-medium hover:text-[#c8963c] transition-colors mt-0.5 inline-block">+91 98765 43210</a>
                  <p className="text-[0.75rem] text-[#1d052b]/80 mt-0.5 font-medium">(Quick replies on WhatsApp)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-[#c8963c] bg-white shadow-sm">
                  <MapPin className="size-[22px] text-[#c8963c]" strokeWidth={1.5} />
                </span>
                <div className="pt-1">
                  <h3 className={`text-[0.85rem] font-extrabold uppercase tracking-wider ${INK}`}>Office Address</h3>
                  <p className="text-[0.85rem] font-medium text-[#1d052b]/90 leading-relaxed mt-1">Velastia Beauty Pvt. Ltd.<br/>123, Beauty Street, Andheri West,<br/>Mumbai &ndash; 400058, India</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: You Glow Image */}
          <div className="bg-[#eeded0] lg:w-[32%] flex">
             <img src="/images/we glow together contact page.png" alt="You glow. We glow. Together." className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 4. Instagram / Follow Us */}
      <section className="py-12 px-6 w-full bg-[#f6ece2]">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-[300px] shrink-0 text-center lg:text-left">
            <h2 className={`font-display text-2xl font-semibold uppercase tracking-wide ${INK} mb-3 flex flex-col items-center lg:items-start`}>
              <span>Follow Us &</span>
              <span className="flex items-center gap-2">Stay Connected <ScriptHeart className={`w-6 h-6 ${GOLD} inline-block`} /></span>
            </h2>
            <p className={`text-[0.8rem] ${INK} opacity-80 mb-6 font-medium leading-relaxed`}>
              Beauty tips, product updates, offers and a whole lot of inspiration &ndash; only for you!
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              {[Instagram, Youtube, Facebook, XIcon, Pinterest].map((Icon, i) => (
                <a key={i} href="#" className="grid size-9 place-items-center rounded-full border border-gold-300 text-plum-800 hover:text-gold-600 transition-colors bg-white">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex gap-4 overflow-hidden relative">
            <button className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-white/90 border border-[#eaddce] shadow-sm text-plum-800"><ChevronLeft size={18} strokeWidth={1.5} /></button>
            <div className="flex gap-4 min-w-max">
               {["Beauty Tips & Tutorials", "New Launches", "Real Stories", "Special Offers", "Behind The Glow"].map((lbl, i) => (
                 <div key={i} className="flex flex-col items-center w-[160px] lg:w-[200px]">
                   <div className="aspect-square w-full rounded-md overflow-hidden relative bg-[#240b25]">
                      <OptionalPhoto src={`/images/contact_ig_${i}.png`} alt={lbl} sizes="200px" className="object-cover w-full h-full opacity-90" />
                      {i === 0 && <span className="absolute inset-0 m-auto grid size-10 place-items-center rounded-full bg-black/40 text-white"><Play size={16} fill="white" /></span>}
                   </div>
                   <p className={`text-[0.7rem] font-medium mt-3 ${INK}`}>{lbl}</p>
                 </div>
               ))}
            </div>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid size-8 place-items-center rounded-full bg-white/90 border border-[#eaddce] shadow-sm text-plum-800"><ChevronRight size={18} strokeWidth={1.5} /></button>
          </div>
        </div>
      </section>

      {/* 5. Reviews Kinda Section */}
      <section className="bg-[#1f0b24] text-cream-50 py-20 px-6 w-full">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
           <div className="lg:w-[35%] relative flex flex-col items-start lg:pr-6">
             <span className="text-[#c8963c] text-[4.5rem] font-serif absolute -top-10 -left-2 leading-none">&ldquo;</span>
             <p className="font-display text-xl lg:text-[1.65rem] leading-[1.45] relative z-10 text-cream-50 font-medium tracking-wide">
               Velastia isn&apos;t just about beauty.<br/>It&apos;s about confidence, self-love and<br/>feeling your best every single day.
               <ScriptHeart className="w-10 h-10 text-[#c8963c] inline-block ml-3 -translate-y-2" />
             </p>
           </div>
           
           <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
             {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="flex gap-4 items-center">
                  <div className="relative size-[70px] rounded-full shrink-0 bg-[#f6ece2]">
                  </div>
                  <div>
                    <p className="text-[0.75rem] lg:text-[0.8rem] text-cream-50 font-medium mb-3 leading-snug line-clamp-3">&quot;{t.quote}&quot;</p>
                    <p className="text-[0.8rem] text-cream-50 font-bold">{t.author}</p>
                    <p className="text-[0.65rem] text-cream-50/70 mt-0.5">{t.role || "Verified Buyer"}</p>
                    <div className="flex gap-[2px] mt-1.5 text-[#c8963c]">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg key={idx} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={idx < Math.floor(t.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={idx < Math.floor(t.rating) ? 0 : 1.5}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                  </div>
                </div>
             ))}

             <button className="absolute -right-2 lg:-right-4 top-1/2 -translate-y-1/2 hidden lg:grid size-10 place-items-center rounded-full border border-gold-300/30 text-cream-50 hover:bg-white/10 transition-colors"><ChevronRight size={20} strokeWidth={1.5} /></button>
           </div>
        </div>
      </section>

      {/* 6. Icons Band */}
      <section className="bg-[#fcf9f5] py-16 px-6 w-full border-b border-[#f3eadf]">
        <div className="max-w-[1400px] mx-auto flex flex-wrap lg:flex-nowrap justify-between gap-y-10 lg:gap-0 lg:divide-x lg:divide-[#eaddce]">
          <div className="flex items-center gap-4 lg:gap-5 lg:px-4 xl:px-6 w-full md:w-1/2 lg:w-auto">
             <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c] bg-transparent">
                <Lock className="text-[#c8963c]" size={32} strokeWidth={1.25} />
             </span>
             <div>
               <h4 className="text-[0.95rem] font-bold uppercase tracking-wide text-[#240b25] whitespace-nowrap">100% SAFE & SECURE</h4>
               <p className="text-[0.85rem] text-[#240b25]/85 mt-0.5 leading-snug font-medium whitespace-nowrap">Your information is<br/>always protected.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-5 lg:px-4 xl:px-6 w-full md:w-1/2 lg:w-auto">
             <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c] bg-transparent">
                <RotateCcw className="text-[#c8963c]" size={32} strokeWidth={1.25} />
             </span>
             <div>
               <h4 className="text-[0.95rem] font-bold uppercase tracking-wide text-[#240b25] whitespace-nowrap">7 DAYS EASY RETURNS</h4>
               <p className="text-[0.85rem] text-[#240b25]/85 mt-0.5 leading-snug font-medium whitespace-nowrap">No questions asked<br/>return & refund.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-5 lg:px-4 xl:px-6 w-full md:w-1/2 lg:w-auto">
             <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c] bg-transparent">
                <Truck className="text-[#c8963c]" size={32} strokeWidth={1.25} />
             </span>
             <div>
               <h4 className="text-[0.95rem] font-bold uppercase tracking-wide text-[#240b25] whitespace-nowrap">FREE SHIPPING</h4>
               <p className="text-[0.85rem] text-[#240b25]/85 mt-0.5 leading-snug font-medium whitespace-nowrap">On orders above ₹999<br/>across India.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-5 lg:px-4 xl:px-6 w-full md:w-1/2 lg:w-auto">
             <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c] bg-transparent">
                <CreditCard className="text-[#c8963c]" size={32} strokeWidth={1.25} />
             </span>
             <div>
               <h4 className="text-[0.95rem] font-bold uppercase tracking-wide text-[#240b25] whitespace-nowrap">SECURE PAYMENTS</h4>
               <p className="text-[0.85rem] text-[#240b25]/85 mt-0.5 leading-snug font-medium whitespace-nowrap">Multiple safe payment<br/>options.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-5 lg:px-4 xl:px-6 w-full md:w-1/2 lg:w-auto">
             <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c] bg-transparent">
                <Heart className="text-[#c8963c]" size={32} strokeWidth={1.25} />
             </span>
             <div>
               <h4 className="text-[0.95rem] font-bold uppercase tracking-wide text-[#240b25] whitespace-nowrap">MADE WITH LOVE</h4>
               <p className="text-[0.85rem] text-[#240b25]/85 mt-0.5 leading-snug font-medium whitespace-nowrap">For you, with the<br/>finest ingredients.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 7. STAY IN THE LOOP Footer */}
      <section className="bg-[#1f0b24] py-14 px-6 w-full text-cream-50 border-t border-[#c8963c]/20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-6 pl-4">
              <span className="grid size-[70px] shrink-0 place-items-center rounded-full border border-[#c8963c]">
                <Gift className="text-[#c8963c]" size={30} strokeWidth={1.25} />
              </span>
              <div>
                 <h2 className="font-display text-[1.75rem] uppercase tracking-widest font-semibold text-white">STAY IN THE LOOP!</h2>
                 <p className="text-[1rem] text-cream-50 mt-1.5 leading-relaxed font-medium">
                   Subscribe to our newsletter and be the first to know about<br/>exclusive offers, new launches & beauty secrets.
                 </p>
              </div>
           </div>
           
           <div className="w-full md:w-[500px]">
             <form className="flex w-full">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-[#1f0b24] border border-[#4a2b4d] rounded-l px-6 py-4 text-[0.95rem] text-cream-50 placeholder:text-cream-50/50 focus:outline-none focus:border-[#c8963c] transition-colors"
                />
                <button 
                  type="submit" 
                  className="shrink-0 bg-gradient-to-b from-[#ca9d4c] to-[#a27334] hover:brightness-110 text-white font-bold text-[0.9rem] uppercase tracking-wider px-8 py-4 rounded-r transition-all flex items-center gap-2"
                >
                  SUBSCRIBE NOW <Heart className="size-4 fill-white" />
                </button>
             </form>
           </div>
        </div>
      </section>
      
    </div>
  );
}
