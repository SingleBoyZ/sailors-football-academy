import Image from "next/image";
import { Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export async function SuccessSpotlight() {
  const story = await prisma.successStory
    .findFirst({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })
    .catch((error: unknown) => {
      console.error("SuccessSpotlight: failed to load story", error);
      return null;
    });

  if (!story) return null;

  return (
    <section className="bg-brand-sand py-20 sm:py-28">
      <Container>
        <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Success Story</p>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="relative lg:col-span-4">
            <div className="relative aspect-3/4 w-full max-w-sm">
              <Image src={story.image} alt={story.playerName} fill className="object-cover" sizes="(min-width: 1024px) 30vw, 90vw" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-8">
            <Quote className="text-brand-red h-10 w-10" />
            <p className="font-display mt-4 text-2xl leading-snug sm:text-3xl">&ldquo;{story.quote}&rdquo;</p>
            <p className="text-brand-muted mt-6 text-sm">
              <span className="text-brand-ink font-semibold">{story.playerName}</span> &middot; {story.ageGroup}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={`/success-stories/${story.slug}`} variant="secondary">
                Read Their Story
              </Button>
              <TransitionLink
                href="/success-stories"
                className="text-brand-ink hover:text-brand-red-dark flex items-center text-sm font-semibold underline underline-offset-4"
              >
                More Sailors&apos; stories
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
