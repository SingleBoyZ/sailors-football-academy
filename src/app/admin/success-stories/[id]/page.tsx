import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SuccessStoryForm } from "@/components/admin/SuccessStoryForm";
import { StoryImageUploader } from "@/components/admin/StoryImageUploader";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function SuccessStoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const story = await prisma.successStory.findUnique({ where: { id } });
  if (!story) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl">{story.playerName}</h1>

      <section className="bg-brand-white border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Photo</h2>
        <StoryImageUploader storyId={story.id} image={story.image} />
      </section>

      <section className="bg-brand-white max-w-xl border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Details</h2>
        <SuccessStoryForm
          storyId={story.id}
          initial={{ playerName: story.playerName, slug: story.slug, ageGroup: story.ageGroup, quote: story.quote, body: story.body, published: story.published }}
        />
      </section>
    </div>
  );
}
