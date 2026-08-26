import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TRAINING_SCHEDULE, FEES } from "@/content/schedule";
import { formatSenCompact } from "@/lib/money";

export function ScheduleStrip() {
  return (
    <section className="bg-brand-ink py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-5">
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red">Training</p>
            <h2 className="font-display text-brand-white text-4xl leading-[0.95] sm:text-5xl">
              Rain or Shine, at Rimbayu
            </h2>
            <p className="text-brand-white/70 mt-6 text-sm">
              Weeknight and weekend sessions across every age group, all at FootballHub Rimbayu.
            </p>
            <div className="border-brand-red mt-8 inline-block border px-4 py-3">
              <span className="text-brand-white/60 block text-xs tracking-wide uppercase">
                Monthly fee from
              </span>
              <span className="font-display text-brand-white text-3xl">
                {formatSenCompact(FEES.monthlySen)}
              </span>
            </div>
            <div className="mt-8">
              <Button href="/training">Full Schedule &amp; Fees</Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-7">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-brand-white text-brand-ink">
                  <th className="p-3 text-left font-normal">Days</th>
                  <th className="p-3 text-left font-normal">Time</th>
                  <th className="p-3 text-left font-normal">Age Groups</th>
                </tr>
              </thead>
              <tbody>
                {TRAINING_SCHEDULE.flatMap((block) => block.rows).map((row) => (
                  <tr key={`${row.days}-${row.time}`} className="bg-brand-red/90 text-brand-white border-brand-ink border-b">
                    <td className="p-3">{row.days}</td>
                    <td className="p-3">{row.time}</td>
                    <td className="p-3">{row.ageGroups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
