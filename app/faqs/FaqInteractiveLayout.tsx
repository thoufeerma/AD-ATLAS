"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Ornament } from "@/components/ui/Ornament";

const FAQ_DATA = [
  {
    category: "Orders & Shipping",
    questions: [
      { q: "How long does it take to deliver my order?", a: "Standard delivery takes 3-5 business days." },
      { q: "Do you offer free shipping?", a: "Yes, on orders above ₹999." },
      { q: "Can I change or cancel my order?", a: "Orders can be modified within 2 hours of placement." },
      { q: "What payment methods do you accept?", a: "We accept credit cards, UPI, and net banking." },
      { q: "Is Velastia safe for all skin types?", a: "Yes, our products are dermatologically tested for all skin types." },
      { q: "Are your products suitable for sensitive skin?", a: "Absolutely. We use gentle, non-irritating ingredients." },
      { q: "Are Velastia products cruelty-free and vegan?", a: "Yes, we never test on animals and our formulas are 100% vegan." },
      { q: "Where are Velastia products made?", a: "Proudly formulated and manufactured in India." },
      { q: "How do I choose the right product for my skin?", a: "Our beauty experts are available on live chat to guide you." },
      { q: "How do I return or exchange a product?", a: "We offer a 7-day hassle-free return policy." },
      { q: "When will I receive my refund?", a: "Refunds are processed within 5-7 business days." },
      { q: "I received a damaged or wrong item. What should I do?", a: "Please contact our support within 48 hours with images." },
    ]
  },
  { category: "Payments", questions: [] },
  { category: "Returns & Refunds", questions: [] },
  { category: "Products", questions: [] },
  { category: "Ingredients & Safety", questions: [] },
  { category: "Skin Concerns", questions: [] },
  { category: "Offers & Discounts", questions: [] },
  { category: "Account & Others", questions: [] },
];

export default function FaqInteractiveLayout() {
  const [activeCategory, setActiveCategory] = useState("Orders & Shipping");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const currentFaqs = FAQ_DATA.find(cat => cat.category === activeCategory)?.questions || [];

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[250px_1fr_320px] gap-10 lg:gap-16">
      {/* Left Sidebar */}
      <div className="flex flex-col border border-[#f3eadf] rounded-xl overflow-hidden h-fit">
        <div className="pt-6 pb-4">
          <h3 className="text-[#a57a2f] font-display text-[1.05rem] font-bold uppercase tracking-widest text-center">
            BROWSE TOPICS
          </h3>
        </div>
        <div className="flex flex-col">
          {FAQ_DATA.map((cat, idx) => {
            const isActive = activeCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setOpenFaq(null);
                }}
                className={`text-left px-4 py-4 text-[0.85rem] font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-[#291334] text-white"
                    : "bg-transparent text-[#240b25] border-b border-[#f3eadf] hover:bg-black/5"
                } ${!isActive && idx === FAQ_DATA.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="w-4 shrink-0 flex justify-center">
                   {isActive && <ChevronRight size={16} className="text-[#d4af37]" />}
                </div>
                {cat.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col">
        <div className="mb-10 flex flex-col items-start w-max">
          <h3 className="text-[#240b25] font-display text-[1.5rem] uppercase tracking-widest font-bold text-left">
            FREQUENTLY ASKED QUESTIONS
          </h3>
          <div className="flex items-center justify-center w-full mt-4">
             <div className="h-px bg-[#c8963c]/50 w-16"></div>
             <Ornament className="w-12 mx-3 text-[#c8963c]" />
             <div className="h-px bg-[#c8963c]/50 w-16"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {currentFaqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#f3eadf] bg-[#fcfaf7] px-6 py-4 shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                className="w-full flex justify-between items-center gap-4 text-left text-[1.05rem] font-semibold text-[#240b25]"
              >
                {faq.q}
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#eaddce] text-[#c8963c]">
                  <ChevronDown size={16} className={`transition-transform duration-300 ${openFaq === faq.q ? "rotate-180" : ""}`} />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaq === faq.q ? "grid-rows-[1fr] mt-3 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-[#240b25]/80">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {currentFaqs.length === 0 && (
            <p className="text-center text-[#240b25]/60 text-[0.9rem] py-10">No questions in this category yet.</p>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#291334] rounded-xl p-8 text-cream-50 shadow-lg border border-[#3e1f4f]">
          <h4 className="text-[#d4af37] font-serif text-[1.1rem] tracking-wider mb-2">
            STILL NEED HELP?
          </h4>
          <p className="text-[0.85rem] mb-6 text-cream-50/90 leading-relaxed">
            Our beauty experts are just<br/>a message away.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <a href="#" className="flex items-center gap-4 p-3 rounded-xl border border-[#d4af37]/40 hover:bg-white/5 transition-colors">
              <span className="grid size-9 place-items-center rounded-full border border-[#d4af37]/60 text-[#d4af37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 3.2L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
              </span>
              <div>
                <p className="text-[0.7rem] text-cream-50/80">WhatsApp Us</p>
                <p className="text-[0.75rem] font-bold tracking-wide">+91 98765 43210</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center gap-4 p-3 rounded-xl border border-[#d4af37]/40 hover:bg-white/5 transition-colors">
              <span className="grid size-9 place-items-center rounded-full border border-[#d4af37]/60 text-[#d4af37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <div>
                <p className="text-[0.7rem] text-cream-50/80">Email Us</p>
                <p className="text-[0.75rem] font-bold tracking-wide">hello@velastia.com</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center gap-4 p-3 rounded-xl border border-[#d4af37]/40 hover:bg-white/5 transition-colors">
              <span className="grid size-9 place-items-center rounded-full border border-[#d4af37]/60 text-[#d4af37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/></svg>
              </span>
              <div>
                <p className="text-[0.7rem] text-cream-50/80">Call Us</p>
                <p className="text-[0.75rem] font-bold tracking-wide">+91 98765 43210</p>
                <p className="text-[0.6rem] text-cream-50/50 mt-0.5">(Mon - Sat | 10AM - 7PM)</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center gap-4 p-3 rounded-xl border border-[#d4af37]/40 hover:bg-white/5 transition-colors">
              <span className="grid size-9 place-items-center rounded-full border border-[#d4af37]/60 text-[#d4af37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              <div>
                <p className="text-[0.7rem] text-cream-50/80">Live Chat</p>
                <p className="text-[0.75rem] font-bold tracking-wide">Chat with our team</p>
              </div>
            </a>
          </div>

          <p className="text-[0.7rem] text-center text-cream-50/70">
            We usually reply within <br/> 15 minutes <span className="text-[#d4af37]">💛</span>
          </p>
        </div>

        <div className="rounded-xl p-8 relative overflow-hidden border border-[#f3eadf] shadow-sm flex flex-col justify-center min-h-[300px]">
          <div className="absolute inset-0 z-0">
             <img src="/images/your trust our priority image faq.png" className="w-full h-full object-cover" alt="Background" />
             <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
          </div>
          <div className="relative z-10">
            <h4 className="text-[#240b25] font-serif text-[1.2rem] tracking-widest uppercase mb-3 leading-snug">
              YOUR TRUST,<br />OUR PRIORITY
            </h4>
            <p className="text-[#240b25]/90 text-[0.8rem] leading-relaxed mb-6 font-medium pr-4">
              Every product we create is backed by science, made with safe ingredients and crafted to make you feel your absolute best.
            </p>
            <p className="text-[#c8963c] font-script text-3xl mb-2 -rotate-2 origin-left">
              Because you deserve the best.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
