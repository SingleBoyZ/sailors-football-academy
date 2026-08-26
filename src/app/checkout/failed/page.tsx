import { XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/content/site";

export default function CheckoutFailedPage() {
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Payment Not Completed" />
      <Container className="py-16 text-center sm:py-24">
        <div className="mx-auto max-w-lg">
          <XCircle className="text-brand-red mx-auto mb-6 h-14 w-14" />
          <h2 className="font-display text-3xl">We couldn&apos;t confirm this payment</h2>
          <p className="text-brand-muted mt-3">
            Your card or bank may have declined the transaction, or the payment was cancelled. No money
            has left your account for this attempt — your cart is still saved.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/checkout" variant="secondary">
              Try Again
            </Button>
            <Button href={SITE.contact.whatsappHref} variant="secondary">
              Get Help on WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
