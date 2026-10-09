import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/data";
import { isDevGatewayEnabled } from "@/lib/payments/dev-gateway";
import { formatSenCompact } from "@/lib/money";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PayResultPage({ searchParams }: PageProps) {
  const resolved = await searchParams;

  let billId: string | null = null;
  let paid = false;
  let verified = false;

  if (isDevGatewayEnabled()) {
    // The dev-only mock gateway already confirmed the payment before
    // redirecting here — no real Billplz webhook exists to re-verify against.
    billId = typeof resolved.id === "string" ? resolved.id : null;
    paid = resolved.status === "paid";
    verified = Boolean(billId);
  } else {
    const { getBill, verifyRedirectSignature, getRedirectParam } = await import("@/lib/billplz");
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === "string") params.set(key, value);
    }
    billId = getRedirectParam(params, "id");
    const signatureValid = billId ? verifyRedirectSignature(params) : false;
    const bill = signatureValid && billId ? await getBill(billId).catch(() => null) : null;
    paid = Boolean(bill?.paid);
    verified = signatureValid && Boolean(bill);
  }

  const payment = billId ? await db.getPaymentByBillId(billId).catch(() => null) : null;

  if (!verified || !payment) {
    return (
      <>
        <PageHeader eyebrow="Fees" title="Payment Not Confirmed" />
        <Container className="py-16 text-center sm:py-24">
          <div className="mx-auto max-w-lg">
            <XCircle className="text-brand-red mx-auto mb-6 h-14 w-14" />
            <h2 className="font-display text-3xl">We couldn&apos;t verify this payment</h2>
            <p className="text-brand-muted mt-3">
              If money left your account, it will be reflected here shortly — Billplz can take a few
              minutes to confirm. Otherwise, no payment was taken.
            </p>
            <Button href="/pay" variant="secondary" className="mt-8">
              Back to Pay Fees
            </Button>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Fees" title={paid ? "Payment Received" : "Payment Not Completed"} />
      <Container className="py-16 text-center sm:py-24">
        <div className="mx-auto max-w-lg">
          {paid ? (
            <CheckCircle2 className="text-brand-success mx-auto mb-6 h-14 w-14" />
          ) : (
            <XCircle className="text-brand-red mx-auto mb-6 h-14 w-14" />
          )}
          <h2 className="font-display text-3xl">
            {paid ? `Thank you${payment.player ? `, ${payment.player.name}'s account is updated` : ""}` : "Not completed"}
          </h2>
          <p className="text-brand-muted mt-3">
            {paid
              ? `We've received ${formatSenCompact(payment.amount)}. A receipt has been emailed to ${payment.payerEmail}.`
              : "Your card or bank may have declined the transaction, or it was cancelled. Nothing has been charged."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/pay" variant="secondary">
              {paid ? "Make Another Payment" : "Try Again"}
            </Button>
            <Button href="/portal">Go to Portal</Button>
          </div>
        </div>
      </Container>
    </>
  );
}
