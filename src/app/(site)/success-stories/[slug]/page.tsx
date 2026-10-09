import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Quote } from "lucide-react";
import { db } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type PageParams = { params: Promise<{ slug: string }> };

async function getStory(slug: string) {
  return db.getSuccessStory(slug).catch((error: unknown) => {
    console.error("SuccessStoryPage: failed to load story", error);
    return null;
  });
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: "Success Story" };
  return {
    title: story.playerName,
    description: story.quote,
  };
}

export default async function SuccessStoryPage({ params }: PageParams) {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story || !story.published) notFound();

  return (
    <article>
      <section className="bg-brand-ink relative overflow-hidden">
        <div className="relative aspect-3/4 sm:aspect-16/9">
          <Image src={story.image} alt={story.playerName} fill priority className="object-cover" sizes="100vw" />
          <div className="from-brand-ink via-brand-ink/40 absolute inset-0 bg-gradient-to-t to-transparent" />
        </div>
        <Container className="absolute inset-x-0 bottom-0 pb-10">
          <span className="text-brand-red-light text-sm font-semibold tracking-wide uppercase">{story.ageGroup}</span>
          <h1 className="font-display text-brand-white text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]">
            {story.playerName}
          </h1>
        </Container>
      </section>

      <section className="bg-brand-white py-16 sm:py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <Quote className="text-brand-red h-10 w-10" />
            <p className="font-display mt-4 text-2xl leading-snug sm:text-3xl">&ldquo;{story.quote}&rdquo;</p>
            <p className="text-brand-muted mt-8 text-base leading-relaxed whitespace-pre-line">{story.body}</p>
            <div className="mt-10">
              <Button href="/success-stories" variant="secondary">
                More Stories
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </article>
  );
}
