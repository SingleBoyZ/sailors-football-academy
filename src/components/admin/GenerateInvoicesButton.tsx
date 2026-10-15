"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { generateMonthlyInvoices } from "@/app/admin/invoices/actions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function GenerateInvoicesButton() {
  const router = useRouter();
  const now = new Date();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    setGenerating(true);
    setResult(null);
    const outcome = await generateMonthlyInvoices(now.getMonth() + 1, now.getFullYear());
    setGenerating(false);
    setResult(`Created ${outcome.created}, skipped ${outcome.skipped} (already existed).`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleClick} disabled={generating}>
        {generating ? "Generating…" : `Generate ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()} Invoices`}
      </Button>
      {result && <p className="text-brand-muted text-sm">{result}</p>}
    </div>
  );
}
