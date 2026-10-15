import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { EnrolForm } from "@/components/enrol/EnrolForm";
import { MEDIA } from "@/content/media";

export const metadata: Metadata = {
  title: "Enrol",
  description: "Apply for a place at Sailors Football Academy — U6 to U18.",
};

export default function EnrolPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join the Crew"
        title="Enrol Now"
        description="Four short steps. No payment due until your application is approved."
        backgroundImage={MEDIA.u16Squad}
      />
      <section className="bg-brand-white py-16 sm:py-24">
        <Container>
          <EnrolForm />
        </Container>
      </section>
    </>
  );
}
