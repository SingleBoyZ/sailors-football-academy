import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Container } from "@/components/ui/Container";
import { HorizontalPathway } from "@/components/programmes/HorizontalPathway";
import { PhaseTabs } from "@/components/programmes/PhaseTabs";
import { PROGRAMMES, PLACEMENT_CRITERIA } from "@/content/programmes";

export const metadata: Metadata = {
  title: "Programmes",
  description: "Foundation, Advance and Performance — the Sailors Football Academy pathway from U6 to U18.",
};

export default function ProgrammesPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Pathway"
        title="Programmes"
        description="Scroll through the full pathway — from a child's first touch to first-team football."
      />

      <HorizontalPathway />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container>
          <Reveal>
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">How It Works</p>
            <h2 className="font-display max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
              Two Phases, Built Around Readiness
            </h2>
          </Reveal>
          <div className="mt-14">
            <PhaseTabs />
          </div>
        </Container>
      </section>

      <section className="bg-brand-sand py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Programme Detail</p>
            <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl">What Each Level Covers</h2>
          </Reveal>
          <Stagger as="div" className="flex flex-col gap-6 lg:col-span-7">
            {PROGRAMMES.map((programme) => (
              <StaggerItem key={programme.key} className="border-brand-ink/10 border-b pb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-2xl">{programme.name}</h3>
                  <span className="text-brand-red-dark text-sm tracking-wide uppercase">{programme.ageRange}</span>
                </div>
                <p className="text-brand-muted mt-2 text-sm">{programme.summary}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <section className="bg-brand-ink py-20 sm:py-28">
        <Container>
          <Reveal>
            <p className="font-display text-brand-red-light mb-4 text-sm tracking-[0.3em]">Placement</p>
            <h2 className="font-display text-brand-white max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
              How We Decide Where a Player Trains
            </h2>
          </Reveal>
          <Stagger as="div" className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLACEMENT_CRITERIA.map((criterion, i) => (
              <StaggerItem
                key={criterion}
                className="border-brand-white/15 flex items-center gap-4 border p-5"
              >
                <span className="font-display text-brand-red text-2xl">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-brand-white text-base">{criterion}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>
    </>
  );
}
