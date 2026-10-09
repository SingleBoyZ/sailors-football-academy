import { db } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { SuccessStoriesTable, type SuccessStoryRow } from "./SuccessStoriesTable";

export const dynamic = "force-dynamic";

export default async function SuccessStoriesAdminPage() {
  const stories = await db.getSuccessStories();
  const rows: SuccessStoryRow[] = stories.map((s) => ({ id: s.id, playerName: s.playerName, ageGroup: s.ageGroup, published: s.published }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Success Stories</h1>
        <Button href="/admin/success-stories/new">New Story</Button>
      </div>
      <SuccessStoriesTable rows={rows} />
    </div>
  );
}
