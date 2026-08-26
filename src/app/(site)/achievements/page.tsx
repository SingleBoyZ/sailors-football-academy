import type { Metadata } from "next";
import Image from "next/image";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Counter } from "@/components/motion/Counter";
import { Container } from "@/components/ui/Container";
import { TROPHIES, YOUTH_FEATURE } from "@/content/achievements";
import { MEDIA } from "@/content/media";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Trophies, promotions and milestones from Royal Klang Sailors and the academy pathway.",
};

const YEARS = Array.from(new Set(TROPHIES.map((t) => t.year))).sort();

export default function AchievementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Honours"
        title="Achievements"
        description="Hardworking, united, fearless — the results since 2023."
      />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-16">
            {YEARS.map((year) => (
              <div key={year}>
                <Reveal>
                  <h2 className="font-display text-brand-red text-[clamp(3rem,10vw,7rem)] leading-none">
                    {year}
                  </h2>
                </Reveal>
                <Stagger as="div" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {TROPHIES.filter((t) => t.year === year).map((trophy) => (
                    <StaggerItem
                      key={trophy.title}
                      className="border-brand-ink/10 flex items-start gap-4 border p-6"
                    >
                      <Trophy className="text-brand-red mt-1 h-6 w-6 shrink-0" />
                      <div>
                        <span className="text-brand-red-dark text-xs font-semibold tracking-wide uppercase">
                          {trophy.tag}
                        </span>
                        <p className="font-display mt-1 text-lg leading-tight">{trophy.title}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-brand-ink relative overflow-hidden py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="relative lg:col-span-5">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={MEDIA.u18Squad}
                alt="U18 Performance squad"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-7">
            <p className="font-display text-brand-red-light mb-4 text-sm tracking-[0.3em]">The Pathway Works</p>
            <h2 className="font-display text-brand-white text-4xl leading-[0.95] sm:text-5xl">
              {YOUTH_FEATURE.headline}
            </h2>
            <p className="text-brand-white/70 mt-6 max-w-xl text-base leading-relaxed">{YOUTH_FEATURE.body}</p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {YOUTH_FEATURE.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-brand-white text-4xl sm:text-5xl">
                    <Counter value={Number(stat.value)} />
                  </div>
                  <p className="text-brand-white/60 mt-2 text-xs sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
