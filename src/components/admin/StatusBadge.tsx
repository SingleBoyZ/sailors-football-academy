import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  PENDING: "bg-brand-warning/10 text-brand-warning",
  APPROVED: "bg-brand-success/10 text-brand-success",
  REJECTED: "bg-brand-red/10 text-brand-red",
  PAID: "bg-brand-success/10 text-brand-success",
  FAILED: "bg-brand-red/10 text-brand-red",
  FULFILLED: "bg-brand-success/10 text-brand-success",
  CANCELLED: "bg-brand-red/10 text-brand-red",
  OPEN: "bg-brand-warning/10 text-brand-warning",
  PARTIAL: "bg-brand-warning/10 text-brand-warning",
  SETTLED: "bg-brand-success/10 text-brand-success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-1 text-xs font-semibold tracking-wide uppercase", TONES[status] ?? "bg-brand-ink/10")}>
      {status}
    </span>
  );
}
