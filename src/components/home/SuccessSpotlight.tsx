import Image from "next/image";
import { db } from "@/lib/data";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Container } from "@/components/ui/Container";

export async function SuccessSpotlight() {
  const stories = await db.getSuccessStories({ published: true }).catch((error: unknown) => {
    console.error("SuccessSpotlight: failed to load stories", error);
    return [];
  });

  const featured = stories.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section className="bg-brand-sand py-20 sm:py-28">
      <Container>
        <Reveal>
          <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red-dark">Success Stories</p>
          <h2 className="font-display max-w-xl text-4xl leading-[0.95] sm:text-5xl">Real Sailors, Real Progress</h2>
        </Reveal>

        <Stagger as="div" className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((story) => (
            <StaggerItem key={story.slug}>
              <div className="relative aspect-3/4 overflow-hidden bg-brand-white">
                <Image
                  src={story.image}
                  alt={story.playerName}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 30vw, 90vw"
                />
                <div className="from-brand-ink absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-brand-red-light text-xs font-semibold tracking-wide uppercase">{story.ageGroup}</span>
                  <h3 className="font-display text-brand-white text-2xl leading-tight">{story.playerName}</h3>
                </div>
              </div>
              <p className="text-brand-muted mt-4 text-sm leading-relaxed italic">&ldquo;{story.quote}&rdquo;</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
