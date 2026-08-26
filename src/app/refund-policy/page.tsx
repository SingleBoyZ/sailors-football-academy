import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `Refund and cancellation policy for ${SITE.name} fees and store orders.`,
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Refund Policy" />
      <section className="bg-brand-white py-16 sm:py-24">
        <Container className="prose-content max-w-3xl">
          <p className="text-brand-muted text-sm">Last updated: {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}</p>

          <h2>1. Academy Registration Fee</h2>
          <p>
            The one-time registration fee (which includes 2 training kits) is non-refundable once training
            kits have been issued. If a place is withdrawn by the academy before kits are issued, the
            registration fee is refunded in full.
          </p>

          <h2>2. Monthly Training Fees</h2>
          <p>
            Monthly fees are billed for the training month ahead. If a guardian withdraws a player before
            the month begins, any amount already paid for that month is refunded. Fees are not refunded
            for sessions missed by the player once the training month has started, except where the
            academy cancels sessions itself (e.g. venue unavailability), in which case an equivalent
            credit is applied to the next invoice.
          </p>

          <h2>3. Store Orders</h2>
          <p>
            Orders may be cancelled for a full refund before they are marked fulfilled. Once an order has
            shipped or been collected, items may be exchanged for a manufacturing defect or incorrect
            size within 7 days, subject to the item being unworn and in original condition. Contact us via
            WhatsApp with your order number to start an exchange.
          </p>

          <h2>4. How Refunds Are Processed</h2>
          <p>
            Approved refunds are returned to the original Billplz payment method (bank transfer or
            e-wallet, as used at checkout) within 5–14 working days, depending on your bank.
          </p>

          <h2>5. Requesting a Refund</h2>
          <p>
            Contact us on WhatsApp at {SITE.contact.whatsappDisplay} with your name, the player&apos;s
            member code (if applicable), and the payment or order you&apos;re asking about.
          </p>
        </Container>
      </section>
    </>
  );
}
