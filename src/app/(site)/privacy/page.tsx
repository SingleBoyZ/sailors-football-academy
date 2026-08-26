import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <section className="bg-brand-white py-16 sm:py-24">
        <Container className="prose-content max-w-3xl">
          <p className="text-brand-muted text-sm">Last updated: {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}</p>

          <h2>1. What This Policy Covers</h2>
          <p>
            This policy explains how {SITE.name}, operated by {SITE.club} ({SITE.clubShort}), collects, uses,
            stores and protects personal data submitted through this website — including academy
            enrolment, fee payments and the online store — in accordance with Malaysia&apos;s Personal
            Data Protection Act 2010 (PDPA).
          </p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li>Player details: name, date of birth, gender, school, playing position, medical notes and photo consent, submitted at enrolment.</li>
            <li>Guardian/parent details: name, IC/passport (optional), phone number, email address, home address and emergency contact.</li>
            <li>Payment details: transaction records from Billplz (we never store your card or bank login details ourselves — these are handled entirely by Billplz and your bank/e-wallet).</li>
            <li>Store orders: delivery address and contact details for merchandise fulfilment.</li>
            <li>Account details: email and a securely hashed password for parent portal and admin access.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To assess and process academy enrolment applications.</li>
            <li>To manage training groups, communicate schedule changes and track attendance.</li>
            <li>To process fee payments, issue receipts and track outstanding balances.</li>
            <li>To fulfil store orders.</li>
            <li>To send transactional emails (application status, receipts, order confirmations, fee reminders).</li>
            <li>With photo consent, to feature players in academy marketing, social media and success stories.</li>
          </ul>

          <h2>4. Third Parties We Share Data With</h2>
          <p>
            We share the minimum data necessary with: Billplz (payment processing), Resend (transactional
            email delivery), and Supabase (secure database and file storage hosting). None of these
            providers may use your data for their own marketing purposes.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain player and guardian records for as long as a player is active with the academy, and
            for a reasonable period afterward for financial record-keeping. You may request deletion of
            your data at any time, subject to our legal obligation to retain financial records.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Under the PDPA, you may request access to, correction of, or deletion of your personal data.
            Contact us via WhatsApp at {SITE.contact.whatsappDisplay} to make a request.
          </p>

          <h2>7. Contact</h2>
          <p>
            Questions about this policy can be sent via WhatsApp ({SITE.contact.whatsappDisplay}) or
            Instagram ({SITE.contact.instagramAcademy.handle}).
          </p>
        </Container>
      </section>
    </>
  );
}
