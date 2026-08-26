import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ABOUT_COPY } from "@/content/history";
import { MEDIA } from "@/content/media";

export function WhoWeAre() {
  return (
    <section className="bg-brand-white overflow-hidden py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:px-12">
        <Reveal className="lg:col-span-5">
          <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red">Who We Are</p>
          <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl">{ABOUT_COPY.lead}</h2>
          <p className="text-brand-muted mt-6 text-base leading-relaxed">{ABOUT_COPY.paragraphs[0]}</p>
          <Button href="/academy" variant="secondary" className="mt-8">
            Our Story
          </Button>
        </Reveal>

        <Reveal delay={0.15} className="relative lg:col-span-7">
          <div className="relative aspect-4/5 w-full max-w-lg lg:ml-auto">
            <Image
              src={MEDIA.trainingSession}
              alt="Sailors Football Academy training session"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
            <div className="stripe-diagonal absolute -bottom-6 -left-6 hidden h-32 w-32 sm:block" />
            <div className="bg-brand-red absolute -top-4 right-4 -rotate-3 px-4 py-2 shadow-lg">
              <span className="font-display text-sm text-brand-white">EST. JAN 2026</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
