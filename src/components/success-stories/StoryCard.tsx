import Image from "next/image";
import { TransitionLink } from "@/components/motion/TransitionLink";

export type StoryCardData = {
  slug: string;
  playerName: string;
  ageGroup: string;
  quote: string;
  image: string;
};

export function StoryCard({ story }: { story: StoryCardData }) {
  return (
    <TransitionLink href={`/success-stories/${story.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden bg-brand-sand">
        <Image
          src={story.image}
          alt={story.playerName}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 30vw, 90vw"
        />
        <div className="from-brand-ink absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="text-brand-red text-xs font-semibold tracking-wide uppercase">{story.ageGroup}</span>
          <h3 className="font-display text-brand-white text-2xl leading-tight">{story.playerName}</h3>
        </div>
      </div>
      <p className="text-brand-muted mt-4 line-clamp-2 text-sm italic">&ldquo;{story.quote}&rdquo;</p>
    </TransitionLink>
  );
}
