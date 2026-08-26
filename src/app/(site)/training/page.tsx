import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/training/FaqAccordion";
import { TRAINING_SCHEDULE, FEES } from "@/content/schedule";
import { formatSenCompact } from "@/lib/money";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Training & Fees",
  description: "Training schedule, fees and FAQs for Sailors Football Academy at FootballHub Rimbayu.",
};

export default function TrainingPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE.location.mapQuery)}&output=embed`;

  return (
    <>
      <PageHeader
        eyebrow="Training & Fees"
        title="The Schedule"
        description="Every session runs at FootballHub Rimbayu — weeknights and weekends, across every age group."
      />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-brand-ink text-brand-white">
                    <th className="p-4 text-left font-normal">Days</th>
                    <th className="p-4 text-left font-normal">Time</th>
                    <th className="p-4 text-left font-normal">Age Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAINING_SCHEDULE.flatMap((block) =>
                    block.rows.map((row, i) => (
                      <tr
                        key={`${row.days}-${row.time}`}
                        className="bg-brand-red text-brand-white border-brand-white border-b-4"
                      >
                        <td className="p-4">
                          {i === 0 && <span className="mr-2 text-xs opacity-70">{block.heading}</span>}
                          {row.days}
                        </td>
                        <td className="p-4">{row.time}</td>
                        <td className="p-4">{row.ageGroups}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-brand-sand py-20 sm:py-28">
        <Container>
          <Reveal>
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Fees Structure</p>
            <h2 className="font-display max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 overflow-x-auto">
            <table className="w-full min-w-140 border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-brand-ink text-brand-white">
                  <th className="p-4 text-left font-normal">Fee</th>
                  <th className="p-4 text-left font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-brand-white">
                <tr className="border-brand-ink/10 border-b">
                  <td className="p-4">
                    Registration <span className="text-brand-muted text-xs">({FEES.registrationNote})</span>
                  </td>
                  <td className="font-display p-4 text-lg">{formatSenCompact(FEES.registrationSen)}</td>
                </tr>
                <tr className="border-brand-ink/10 border-b">
                  <td className="p-4">Monthly fee</td>
                  <td className="font-display p-4 text-lg">{formatSenCompact(FEES.monthlySen)} / mo</td>
                </tr>
                <tr className="border-brand-ink/10 border-b">
                  <td className="p-4">Sibling — 2nd child</td>
                  <td className="font-display p-4 text-lg">{formatSenCompact(FEES.sibling2Sen)} / mo</td>
                </tr>
                <tr className="border-brand-ink/10 border-b">
                  <td className="p-4">Sibling — 3rd child &amp; above</td>
                  <td className="font-display p-4 text-lg">{formatSenCompact(FEES.sibling3Sen)} / mo</td>
                </tr>
                <tr>
                  <td className="p-4">
                    Sponsored players <span className="text-brand-muted text-xs">(admin-assessed)</span>
                  </td>
                  <td className="font-display p-4 text-lg">{formatSenCompact(FEES.sponsoredSen)} / mo</td>
                </tr>
              </tbody>
            </table>
          </Reveal>
        </Container>
      </section>

      <section className="bg-brand-white py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">FAQ</p>
              <h2 className="font-display mb-10 max-w-xl text-4xl leading-[0.95] sm:text-5xl">
                Questions Parents Ask
              </h2>
            </Reveal>
            <FaqAccordion />
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="border border-brand-ink/10 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="text-brand-red h-5 w-5" />
                  <h3 className="font-display text-xl">{SITE.location.venue}</h3>
                </div>
                <p className="text-brand-muted mb-4 text-sm">{SITE.location.area}</p>
                <div className="h-64 w-full overflow-hidden">
                  <iframe
                    src={mapSrc}
                    title={`Map to ${SITE.location.venue}`}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
