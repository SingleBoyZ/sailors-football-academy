import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "red" | "success" | "warning";
}) {
  const accentClass =
    accent === "success" ? "text-brand-success" : accent === "warning" ? "text-brand-warning" : "text-brand-red";

  return (
    <div className="bg-brand-white flex items-start justify-between border border-brand-ink/10 p-5">
      <div>
        <p className="text-brand-muted text-xs tracking-wide uppercase">{label}</p>
        <p className="font-display mt-1 text-3xl">{value}</p>
      </div>
      <Icon className={`h-5 w-5 ${accentClass}`} />
    </div>
  );
}
