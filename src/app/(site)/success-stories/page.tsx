import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Container } from "@/components/ui/Container";
import { StoryCard } from "@/components/success-stories/StoryCard";
import { db } from "@/lib/data";

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Real Sailors, real progress — stories from across the academy pathway.",
};

export const dynamic = "force-dynamic";

export default async function SuccessStoriesPage() {
  const stories = await db.getSuccessStories({ published: true }).catch((error: unknown) => {
    console.error("SuccessStoriesPage: failed to load stories", error);
    return [];
  });

  return (
    <>
      <PageHeader
        eyebrow="Our Sailors"
        title="Success Stories"
        description="Every player's voyage looks different. Here are a few of theirs."
      />

      <section className="bg-brand-white py-20 sm:py-28">
        <Container>
          {stories.length === 0 ? (
            <p className="text-brand-muted">
              No stories published yet — check back soon, or see this in Admin → Success Stories.
            </p>
          ) : (
            <Stagger as="div" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <StaggerItem key={story.slug}>
                  <StoryCard story={story} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </section>
    </>
  );
}
