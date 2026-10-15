import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PATHWAY_STEPS } from "@/content/programmes";

export function PathwayTeaser() {
  return (
    <section className="bg-brand-sand py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">The Pathway</p>
          <h2 className="font-display max-w-2xl text-4xl leading-[0.95] sm:text-5xl">
            From Grassroots to the First Team
          </h2>
        </Reveal>

        <Stagger as="div" className="relative mt-14 grid gap-8 sm:grid-cols-5" gap="tight">
          <div
            className="bg-brand-ink/15 absolute top-6 right-0 left-0 hidden h-px sm:block"
            aria-hidden="true"
          />
          {PATHWAY_STEPS.map((step) => (
            <StaggerItem key={step.step} className="relative flex flex-col gap-3">
              <span className="font-display bg-brand-red text-brand-white relative z-10 flex h-12 w-12 items-center justify-center text-xl">
                {step.step}
              </span>
              <h3 className="font-display text-xl">{step.label}</h3>
              <p className="text-brand-muted text-xs tracking-wide uppercase">{step.ageRange}</p>
              <p className="text-brand-muted text-sm">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Button href="/programmes" variant="secondary" className="mt-12">
          See the Full Pathway
        </Button>
      </Container>
    </section>
  );
}
