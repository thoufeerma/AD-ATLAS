import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import PageBanner from "@/components/ui/PageBanner";
import TrackOrder from "@/components/order/TrackOrder";
import { getProducts } from "@/lib/api/server";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("track-order");
}

import Image from "next/image";
import { Heart } from "lucide-react";

export default async function TrackOrderPage() {
  const products = await getProducts();

  return (
    <>
      {/* Custom Hero Banner */}
      <section className="relative w-full h-[320px] md:h-[380px] bg-[#fcf9f5] overflow-hidden flex items-center px-6 md:px-12 lg:px-24">
        {/* Background Image placed dynamically to the right */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[70%] lg:w-[60%] pointer-events-none">
          <Image
            src="/images/your cart banner.png"
            alt=""
            fill
            className="object-cover object-left md:object-center"
            priority
          />
          {/* Gradient fade to seamlessly blend image into background */}
          <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#fcf9f5] via-[#fcf9f5]/80 to-transparent hidden md:block" />
        </div>

        {/* Text Content */}
        <div className="relative z-10 w-full max-w-[650px] mt-8">
          <h1 className="font-display text-[3.8rem] md:text-[4.5rem] font-semibold leading-tight text-[#20082d] flex items-center gap-3">
            Track Your Order
            <Heart className="size-10 md:size-12 text-[#c8963c] mt-2" strokeWidth={1.5} />
          </h1>
          <div className="mt-5 space-y-2">
            <p className="text-[#20082d] font-bold text-[1.25rem] md:text-[1.35rem]">
              Stay updated with every step.
            </p>
            <p className="text-[#20082d] font-bold text-[1.25rem] md:text-[1.35rem]">
              We're getting your Velastia beauty to you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form container with minimal margins */}
      <Suspense fallback={<div className="container-vel py-24" aria-hidden />}>
        <div className="px-3 md:px-6 lg:px-10 max-w-[1600px] mx-auto w-full">
          <TrackOrder products={products} />
        </div>
      </Suspense>
    </>
  );
}
