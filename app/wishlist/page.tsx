import type { Metadata } from "next";
import WishlistView from "@/components/cart/WishlistView";
import { getProducts } from "@/lib/api/server";
import { ScriptHeart } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "All your favourite Velastia products, saved for you.",
};

export default async function WishlistPage() {
  const products = await getProducts();

  return (
    <>
      <section className="relative w-full pt-8 pb-8 overflow-hidden bg-transparent">
        {/* Decor Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-end">
           <img src="/images/your cart banner.png" alt="Decor" className="w-full h-full object-cover object-right" />
        </div>
        
        <div className="relative z-10 flex flex-col items-start container-vel">
           <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
             <h1 className="font-display font-bold text-[2.4rem] sm:text-[3.5rem] lg:text-[4.5rem] text-[#240b25] leading-none tracking-wide">
               My Wishlist
             </h1>
             <ScriptHeart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 text-[#c8963c] mt-1 sm:mt-2 shrink-0" />
           </div>
           <p className="text-[1.1rem] lg:text-[1.3rem] font-medium text-[#240b25]/80 max-w-[320px] leading-relaxed">
             All your favorite Velastia products, saved for you.
           </p>
        </div>
      </section>
      <WishlistView products={products} />
    </>
  );
}
