"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { markOrderFulfilled } from "@/app/admin/orders/actions";

export function MarkFulfilledButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    await markOrderFulfilled(orderId);
    setSaving(false);
    router.refresh();
  }

  return (
    <Button onClick={handleClick} disabled={saving}>
      {saving ? "Updating…" : "Mark as Fulfilled"}
    </Button>
  );
}
