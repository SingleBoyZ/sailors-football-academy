import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Timeline } from "@/components/academy/Timeline";
import { InstagramFeed } from "@/components/academy/InstagramFeed";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ABOUT_COPY, PHILOSOPHY, HOME_GROUND } from "@/content/history";
import { MEDIA } from "@/content/media";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Academy",
  description: "The story, philosophy and home ground behind Sailors Football Academy.",
};

export default function AcademyPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Academy"
        title="Our Story"
        description="From a club founded in 2023 to a structured U6–U18 pathway. This is how Sailors Football Academy came to be."
        backgroundImage={MEDIA.academyBanner}
      />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">The Journey</p>
              <div className="flex flex-col gap-5">
                {ABOUT_COPY.paragraphs.map((p) => (
                  <p key={p.slice(0, 20)} className="text-brand-muted text-base leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
              <InstagramFeed />
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Timeline />
          </div>
        </Container>
      </section>

      <section className="bg-brand-sand py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Philosophy</p>
            <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl">{PHILOSOPHY.heading}</h2>
            <p className="text-brand-muted mt-6 text-base leading-relaxed">{PHILOSOPHY.body}</p>
          </Reveal>
          <Reveal delay={0.15} className="relative lg:col-span-6">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={MEDIA.u16Squad}
                alt="Sailors U16 squad"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-brand-ink py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="relative order-2 lg:order-1 lg:col-span-6">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={MEDIA.footballPitch}
                alt="FootballHub Rimbayu pitch"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="order-1 lg:order-2 lg:col-span-6">
            <p className="font-display text-brand-red-light mb-4 text-sm tracking-[0.3em]">Home Ground</p>
            <h2 className="font-display text-brand-white text-4xl leading-[0.95] sm:text-5xl">
              {HOME_GROUND.name}
            </h2>
            <p className="text-brand-white/70 mt-6 text-base leading-relaxed">{HOME_GROUND.description}</p>
            <p className="text-brand-white/70 mt-4 text-base leading-relaxed">{HOME_GROUND.townhall}</p>
            <div className="mt-8">
              <Button href={SITE.contact.whatsappHref} variant="outline">
                Ask About Visiting
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
