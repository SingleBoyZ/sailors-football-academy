import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { FEES } from "@/content/schedule";
import { formatSenCompact } from "@/lib/money";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for enrolment, training and the ${SITE.name} online store.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <section className="bg-brand-white py-16 sm:py-24">
        <Container className="prose-content max-w-3xl">
          <p className="text-brand-muted text-sm">Last updated: {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By submitting an enrolment application, making a payment, or placing a store order through
            this website, you agree to these terms on behalf of yourself and the player named on the
            application.
          </p>

          <h2>2. Enrolment</h2>
          <p>
            Submitting the enrolment form does not guarantee a training slot. Applications are reviewed
            by academy staff and a place is only confirmed once the application is approved and the
            one-time registration fee of {formatSenCompact(FEES.registrationSen)} is paid.
          </p>

          <h2>3. Fees</h2>
          <p>
            The monthly training fee is {formatSenCompact(FEES.monthlySen)}, with reduced sibling and
            sponsored rates available as published on the Training &amp; Fees page. Fees are invoiced
            monthly and may be paid in full or in part; any unpaid balance remains visible in the parent
            portal until settled. The academy reserves the right to pause a player&apos;s training if fees
            remain significantly overdue, after reasonable notice to the guardian.
          </p>

          <h2>4. Payments</h2>
          <p>
            All online payments are processed securely by Billplz, a licensed Malaysian payment gateway.
            {" "}{SITE.club} does not store your card, bank or e-wallet credentials.
          </p>

          <h2>5. Store Orders</h2>
          <p>
            Product prices, stock and availability are confirmed at checkout. Orders are only fulfilled
            once payment is confirmed. See our Refund Policy for cancellations and returns.
          </p>

          <h2>6. Player Conduct &amp; Safety</h2>
          <p>
            Players and guardians are expected to follow academy coaching staff instructions and conduct
            standards during training, matches and club events. The academy is not liable for injuries
            arising from normal participation in football training and matches, beyond what is required
            by law.
          </p>

          <h2>7. Photo &amp; Media Consent</h2>
          <p>
            Where consent is given on the enrolment form, the academy may use photos or video of a player
            taken during training or matches for marketing, social media and success stories. This
            consent can be withdrawn at any time by contacting us.
          </p>

          <h2>8. Changes to These Terms</h2>
          <p>
            We may update these terms from time to time; the current version always applies. Material
            changes affecting fees or enrolment will be communicated to active guardians.
          </p>

          <h2>9. Contact</h2>
          <p>
            WhatsApp {SITE.contact.whatsappDisplay} or Instagram {SITE.contact.instagramAcademy.handle}.
          </p>
        </Container>
      </section>
    </>
  );
}
