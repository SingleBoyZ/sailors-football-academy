import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";

export function EnrolBand() {
  return (
    <section className="bg-brand-red relative overflow-hidden py-20 sm:py-28">
      <div className="stripe-diagonal absolute inset-0 opacity-10" aria-hidden="true" />
      <Container className="relative text-center">
        <Reveal>
          <p className="font-display text-brand-ink/70 mb-4 text-sm tracking-[0.3em]">
            {SITE.hashtag}
          </p>
          <h2 className="font-display text-brand-white text-[clamp(2.5rem,8vw,6rem)] leading-[0.92]">
            All Aboard.
            <br />
            Enrol Today.
          </h2>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/enrol" variant="secondary" size="lg">
              Start Enrolment
            </Button>
            <Button href={SITE.contact.whatsappHref} variant="outline" size="lg">
              Ask on WhatsApp
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
