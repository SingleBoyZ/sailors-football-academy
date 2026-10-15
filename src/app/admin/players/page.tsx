import { db } from "@/lib/data";
import { PLAN_LABELS } from "@/lib/plan";
import { PlayersTable, type PlayerRow } from "./PlayersTable";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await db.getAllPlayers();
  const outstandingMap = await db.getOutstandingForPlayers(players.map((p) => p.id));

  const rows: PlayerRow[] = players.map((p) => ({
    id: p.id,
    memberCode: p.memberCode,
    name: p.name,
    ageGroup: p.ageGroup,
    programme: p.programme,
    plan: PLAN_LABELS[p.plan],
    outstandingSen: outstandingMap.get(p.id) ?? 0,
    active: p.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Players</h1>
      <PlayersTable rows={rows} />
    </div>
  );
}
