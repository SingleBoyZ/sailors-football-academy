import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ABOUT_COPY, PHILOSOPHY, HOME_GROUND } from "@/content/history";
import { MEDIA } from "@/content/media";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn more about ${SITE.name}, our philosophy, and our home ground at FootballHub Rimbayu.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Who We Are"
        title="About Sailors FA"
        description={ABOUT_COPY.lead}
        backgroundImage={MEDIA.academyBanner}
      />

      {/* Purpose & Intro */}
      <section className="bg-brand-white py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Our Purpose</p>
            <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl">{ABOUT_COPY.lead}</h2>
            <div className="mt-6 flex flex-col gap-4">
              {ABOUT_COPY.paragraphs.map((p) => (
                <p key={p.slice(0, 20)} className="text-brand-muted text-base leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <Button href="/academy">Read Our Historical Timeline</Button>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative lg:col-span-6">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={MEDIA.trainingPhoto}
                alt="Sailors Football Academy training session"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Philosophy */}
      <section className="bg-brand-sand py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal delay={0.15} className="relative lg:col-span-6">
            <div className="relative aspect-4/3 w-full">
              <Image
                src={MEDIA.u16Squad}
                alt="Sailors squad"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 90vw"
              />
            </div>
          </Reveal>
          <Reveal className="lg:col-span-6">
            <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Our Philosophy</p>
            <h2 className="font-display text-4xl leading-[0.95] sm:text-5xl">{PHILOSOPHY.heading}</h2>
            <p className="text-brand-muted mt-6 text-base leading-relaxed">{PHILOSOPHY.body}</p>
          </Reveal>
        </Container>
      </section>

      {/* Home Ground */}
      <section className="bg-brand-white py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <p className="font-display text-brand-red-dark mb-4 text-sm tracking-[0.3em]">Home Ground</p>
            <h2 className="font-display text-brand-ink text-4xl leading-[0.95] sm:text-5xl">
              {HOME_GROUND.name}
            </h2>
            <p className="text-brand-muted/70 mt-6 text-base leading-relaxed">{HOME_GROUND.description}</p>
            <p className="text-brand-muted/70 mt-4 text-base leading-relaxed">{HOME_GROUND.townhall}</p>
             <div className="mt-8">
              <Button href={SITE.contact.whatsappHref} variant="secondary">
                Contact Us on WhatsApp
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="relative lg:col-span-6">
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
        </Container>
      </section>
    </>
  );
}