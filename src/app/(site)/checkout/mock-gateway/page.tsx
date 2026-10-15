import { notFound } from "next/navigation";
import { db } from "@/lib/data";
import { isDevGatewayEnabled } from "@/lib/payments/dev-gateway";
import { formatSenCompact } from "@/lib/money";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { confirmMockOrderPayment } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ billId?: string }> };

export default async function CheckoutMockGatewayPage({ searchParams }: PageProps) {
  if (!isDevGatewayEnabled()) notFound();

  const { billId } = await searchParams;
  const payment = billId ? await db.getPaymentByBillId(billId) : null;
  if (!payment || payment.status !== "PENDING") notFound();

  return (
    <>
      <PageHeader
        eyebrow="Mock Payment Gateway"
        title="Simulated Billplz Checkout"
        description="ENABLE_MOCK_GATEWAY is on — this dev-only page stands in for the real Billplz hosted payment page."
      />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-md border border-brand-ink/10">
          <div className="bg-brand-sand border-b border-brand-ink/10 p-6">
            <p className="text-brand-muted text-xs tracking-wide uppercase">Order No.</p>
            <p className="font-mono text-sm">{payment.order?.orderNo ?? payment.billplzBillId}</p>
          </div>

          <div className="p-6">
            <p className="text-brand-muted text-xs tracking-wide uppercase">Amount Due</p>
            <p className="font-display text-brand-red mb-6 text-4xl">{formatSenCompact(payment.amount)}</p>

            <p className="text-brand-muted text-xs tracking-wide uppercase">Customer</p>
            <p className="mb-1 text-sm font-semibold">{payment.payerName}</p>
            <p className="text-brand-muted mb-8 text-sm">{payment.payerEmail}</p>

            <div className="flex flex-col gap-3">
              <form action={confirmMockOrderPayment.bind(null, payment.billplzBillId, true)}>
                <button
                  type="submit"
                  className="bg-brand-success hover:bg-brand-success-dark text-brand-white w-full py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
                >
                  Pay {formatSenCompact(payment.amount)}
                </button>
              </form>
              <form action={confirmMockOrderPayment.bind(null, payment.billplzBillId, false)}>
                <button
                  type="submit"
                  className="border-brand-red text-brand-red-dark hover:bg-brand-red/5 w-full border py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
                >
                  Simulate Failed Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
