import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Timeline } from "@/components/academy/Timeline";
import { InstagramFeed } from "@/components/academy/InstagramFeed";
import { Container } from "@/components/ui/Container";
import { MEDIA } from "@/content/media";

export const metadata: Metadata = {
  title: "Academy Journey",
  description: "Explore the chronological milestones, history, and evolution of Sailors Football Academy.",
};

export default function AcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Academy"
        title="Our Journey & Timeline"
        description="From our founding in 2023 as Royal Klang Sailors to building a complete youth development pathway. Here is how we got here."
        backgroundImage={MEDIA.academyBanner}
      />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          {/* Left Column: Intro / Context + Socials */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="font-display text-brand-red-dark text-sm tracking-[0.3em] uppercase">Milestones</span>
              <h2 className="font-display mt-2 text-4xl leading-[0.95] sm:text-5xl">Years of Growth</h2>
              <p className="text-brand-muted mt-6 text-base leading-relaxed">
                Building a competitive club requires looking forward while remembering how far we&apos;ve come. Follow our seasonal checkpoints through the years, our silverware, and the establishment of our U18 and academy setup.
              </p>
              <InstagramFeed />
            </Reveal>
          </div>

          {/* Right Column: The actual Timeline component */}
          <div className="lg:col-span-7">
            <Timeline />
          </div>
        </Container>
      </section>
    </>
  );
}