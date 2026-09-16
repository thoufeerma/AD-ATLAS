import Hero from "@/components/home/Hero";
import ServiceStrip from "@/components/home/ServiceStrip";
import BestsellersBlock from "@/components/home/BestsellersBlock";
import GoldBand from "@/components/home/GoldBand";
import OurStory from "@/components/home/OurStory";
import Collabs from "@/components/home/Collabs";
import InstagramStrip from "@/components/home/InstagramStrip";
import TrustStrip from "@/components/ui/TrustStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceStrip />
      <BestsellersBlock />
      <GoldBand />
      <OurStory />
      <Collabs />
      <InstagramStrip />
      <TrustStrip />
    </>
  );
}
