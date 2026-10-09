const fs = require('fs');

const path = 'app/contact/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetSection = content.substring(
    content.indexOf('<div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative">'),
    content.indexOf('</button>\n           </div>', content.indexOf('<div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative">')) + '</button>\n           </div>'.length
);

const newSection = `<div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">
             {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="flex gap-4 items-center">
                  <div className="relative size-[70px] rounded-full overflow-hidden shrink-0 border border-[#c8963c]/30 bg-[#f6ece2]">
                    {t.avatarUrl ? (
                      <OptionalPhoto src={t.avatarUrl} alt={t.author} sizes="70px" className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-[#f6ece2]" />
                    )}
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
           </div>`;

if (targetSection.length > 50) {
    content = content.replace(targetSection, newSection);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced the section!");
} else {
    console.log("Could not find the target section.");
}
