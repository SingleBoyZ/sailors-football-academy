import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/data";
import { isDevGatewayEnabled } from "@/lib/payments/dev-gateway";
import { formatSenCompact } from "@/lib/money";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolved = await searchParams;

  let billId: string | null = null;

  if (isDevGatewayEnabled()) {
    // The dev-only mock gateway already confirmed the order + decremented
    // stock before redirecting here — no real Billplz webhook to re-verify.
    billId = typeof resolved.billId === "string" ? resolved.billId : null;
    if (!billId) redirect("/checkout/failed");
  } else {
    const { getBill, verifyRedirectSignature, getRedirectParam } = await import("@/lib/billplz");
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === "string") params.set(key, value);
    }
    billId = getRedirectParam(params, "id");
    if (!billId || !verifyRedirectSignature(params)) {
      redirect("/checkout/failed");
    }
    // The redirect alone is never proof of payment — re-confirm with Billplz directly.
    const bill = await getBill(billId).catch(() => null);
    if (!bill || !bill.paid) {
      redirect("/checkout/failed");
    }
  }

  const order = await db.getOrderByBillId(billId);
  if (!order || (isDevGatewayEnabled() && order.status === "PENDING")) redirect("/checkout/failed");

  return (
    <>
      <ClearCartOnMount />
      <PageHeader eyebrow="Checkout" title="Payment Received" />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="text-brand-success mx-auto mb-6 h-14 w-14" />
          <h2 className="font-display text-3xl">Thank you, {order.customerName}</h2>
          <p className="text-brand-muted mt-3">
            Order <strong className="text-brand-ink">{order.orderNo}</strong> is confirmed. A receipt has
            been sent to {order.email}.
          </p>

          <div className="mt-8 border border-brand-ink/10 p-6 text-left">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm">
                <span>
                  {item.productName} — {item.variantLabel} &times; {item.qty}
                </span>
                <span>{formatSenCompact(item.unitPriceSen * item.qty)}</span>
              </div>
            ))}
            <div className="font-display mt-3 flex justify-between border-t border-brand-ink/10 pt-3 text-lg">
              <span>Total</span>
              <span>{formatSenCompact(order.totalSen)}</span>
            </div>
          </div>

          <Button href="/store" variant="secondary" className="mt-8">
            Continue Shopping
          </Button>
        </div>
      </Container>
    </>
  );
}
