import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  PENDING: "bg-brand-warning/10 text-brand-warning-dark",
  APPROVED: "bg-brand-success/10 text-brand-success-dark",
  REJECTED: "bg-brand-red/10 text-brand-red-dark",
  PAID: "bg-brand-success/10 text-brand-success-dark",
  FAILED: "bg-brand-red/10 text-brand-red-dark",
  FULFILLED: "bg-brand-success/10 text-brand-success-dark",
  CANCELLED: "bg-brand-red/10 text-brand-red-dark",
  OPEN: "bg-brand-warning/10 text-brand-warning-dark",
  PARTIAL: "bg-brand-warning/10 text-brand-warning-dark",
  SETTLED: "bg-brand-success/10 text-brand-success-dark",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2 py-1 text-xs font-semibold tracking-wide uppercase", TONES[status] ?? "bg-brand-ink/10")}>
      {status}
    </span>
  );
}
