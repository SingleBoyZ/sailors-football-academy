import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { PROGRAMMES } from "@/content/programmes";
import { cn } from "@/lib/utils";

const ROTATIONS = ["-rotate-1", "rotate-1", "-rotate-1"];

export function ProgrammeCards() {
  return (
    <section className="bg-brand-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red">Programmes</p>
          <h2 className="font-display max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
            Three Levels. One Direction.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {PROGRAMMES.map((programme, i) => (
            <Reveal key={programme.key} delay={i * 0.1}>
              <div
                className={cn(
                  "bg-brand-sand flex h-full flex-col gap-4 border border-brand-ink/10 p-8 transition-transform hover:-translate-y-1",
                  ROTATIONS[i],
                )}
              >
                <span className="font-display text-brand-red text-sm">{programme.ageRange}</span>
                <h3 className="font-display text-2xl">{programme.name}</h3>
                <p className="text-brand-muted text-sm">{programme.summary}</p>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {programme.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-brand-red mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
