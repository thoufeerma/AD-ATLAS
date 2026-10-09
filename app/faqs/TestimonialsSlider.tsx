'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ananya S.',
    initial: 'A',
    text: '"Velastia products are so gentle and effective. My skin has never felt better!"',
  },
  {
    name: 'Kavya M.',
    initial: 'K',
    text: '"I love how safe and transparent the brand is. I trust Velastia completely."',
  },
  {
    name: 'Riya P.',
    initial: 'R',
    text: '"Premium quality, beautiful results and amazing customer support!"',
  },
  {
    name: 'Mehak S.',
    initial: 'M',
    text: '"Finally, a brand that truly cares about our skin and our safety."',
  },
  {
    name: 'Priya T.',
    initial: 'P',
    text: '"The results are visible in just a few weeks. Absolutely in love with this brand!"',
  },
  {
    name: 'Neha R.',
    initial: 'N',
    text: '"Their transparency and clean ingredients are what made me a forever customer."',
  }
];

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - visibleCount);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isHovered, maxIndex, visibleCount]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div 
      className="relative max-w-full px-0 lg:px-14"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
       <button 
         onClick={handlePrev}
         className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:grid size-10 place-items-center rounded-full border border-[#c8963c]/30 text-[#240b25] bg-white hover:bg-black/5 transition-colors"
       >
         <ChevronLeft size={20} strokeWidth={1.5} />
       </button>
       
       <div className="overflow-hidden w-full">
         <div 
           className="flex transition-transform duration-500 ease-in-out"
           style={{ transform: `translateX(calc(-${currentIndex * (100 / visibleCount)}%))` }}
         >
            {TESTIMONIALS.map((t, i) => (
              <div 
                 key={i} 
                 className="shrink-0 px-3"
                 style={{ width: `${100 / visibleCount}%` }}
              >
                 <div className="bg-[#fdfbf9] rounded-xl p-6 border border-[#f3eadf] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-5 h-full">
                     <div className="relative size-14 lg:size-16 rounded-full overflow-hidden shrink-0 border border-[#c8963c]/20">
                        <img src={`https://placehold.co/64x64/eaddce/c8963c?text=${t.initial}`} className="object-cover w-full h-full" alt={t.name} />
                     </div>
                     <div className="flex flex-col flex-1">
                        <div className="flex gap-1 text-[#c8963c] mb-2">
                           {Array.from({ length: 5 }).map((_, idx) => (
                              <svg key={idx} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={0}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                           ))}
                        </div>
                        <p className="text-[0.8rem] lg:text-[0.85rem] text-[#240b25]/85 font-medium leading-relaxed mb-3 pr-2 flex-1">
                          {t.text}
                        </p>
                        <div>
                           <p className="text-[0.8rem] text-[#240b25] font-bold">- {t.name}</p>
                           <p className="text-[0.7rem] text-[#240b25]/60 flex items-center gap-1 mt-0.5">Verified Buyer <span className="grid size-4 rounded-full bg-[#c8963c] text-white place-items-center text-[0.5rem]">✓</span></p>
                        </div>
                     </div>
                 </div>
              </div>
            ))}
         </div>
       </div>

       <button 
         onClick={handleNext}
         className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:grid size-10 place-items-center rounded-full border border-[#c8963c]/30 text-[#240b25] bg-white hover:bg-black/5 transition-colors"
       >
         <ChevronRight size={20} strokeWidth={1.5} />
       </button>
    </div>
  )
}
