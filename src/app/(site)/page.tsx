import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { PathwayTeaser } from "@/components/home/PathwayTeaser";
import { StatsCounters } from "@/components/home/StatsCounters";
import { ProgrammeCards } from "@/components/home/ProgrammeCards";
import { ScheduleStrip } from "@/components/home/ScheduleStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { SuccessSpotlight } from "@/components/home/SuccessSpotlight";
import { EnrolBand } from "@/components/home/EnrolBand";
import { SITE } from "@/content/site";

// Featured products and the success spotlight read live data — render on
// every request instead of attempting to bake a snapshot at build time.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee text={`${SITE.hashtag} — ${SITE.tagline.toUpperCase()} — ${SITE.club.toUpperCase()}`} />
      <WhoWeAre />
      <PathwayTeaser />
      <StatsCounters />
      <ProgrammeCards />
      <ScheduleStrip />
      <FeaturedProducts />
      <SuccessSpotlight />
      <EnrolBand />
    </>
  );
}
