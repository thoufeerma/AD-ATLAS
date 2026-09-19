import Hero from "@/components/home/Hero";
import ServiceStrip from "@/components/home/ServiceStrip";
import BestsellersBlock from "@/components/home/BestsellersBlock";
import GoldBand from "@/components/home/GoldBand";
import OurStory from "@/components/home/OurStory";
import Collabs from "@/components/home/Collabs";
import InstagramStrip from "@/components/home/InstagramStrip";
import TrustStrip from "@/components/ui/TrustStrip";
import { getBestsellers, getHomeContent, getRatingSummary, getSettings } from "@/lib/api/server";

export default async function HomePage() {
  const [bestsellers, content, rating, { copy, store }] = await Promise.all([
    getBestsellers(),
    getHomeContent(),
    getRatingSummary(),
    getSettings(),
  ]);

  return (
    <>
      <Hero />
      <ServiceStrip />
      <BestsellersBlock
        products={bestsellers}
        testimonials={content.testimonials}
        rating={rating}
        ratingHeadline={copy.ratingHeadline}
      />
      <GoldBand />
      <OurStory />
      <Collabs collaborators={content.collaborators} />
      {store.social.instagram && (
        <InstagramStrip href={store.social.instagram} handle={store.instagramHandle} />
      )}
      <TrustStrip />
    </>
  );
}
