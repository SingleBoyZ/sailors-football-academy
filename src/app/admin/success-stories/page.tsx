import type { ColumnDef } from "@tanstack/react-table";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type Row = { id: string; playerName: string; ageGroup: string; published: boolean };

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "playerName",
    header: "Player",
    cell: ({ row }) => (
      <TransitionLink href={`/admin/success-stories/${row.original.id}`} className="text-brand-red-dark font-semibold underline">
        {row.original.playerName}
      </TransitionLink>
    ),
  },
  { accessorKey: "ageGroup", header: "Age Group" },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ getValue }) => <span className={getValue() ? "text-brand-success-dark" : "text-brand-muted"}>{getValue() ? "Published" : "Draft"}</span>,
  },
];

export default async function SuccessStoriesAdminPage() {
  const stories = await prisma.successStory.findMany({ orderBy: { createdAt: "desc" } });
  const rows: Row[] = stories.map((s) => ({ id: s.id, playerName: s.playerName, ageGroup: s.ageGroup, published: s.published }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Success Stories</h1>
        <Button href="/admin/success-stories/new">New Story</Button>
      </div>
      <DataTable columns={columns} data={rows} searchPlaceholder="Search stories…" />
    </div>
  );
}
