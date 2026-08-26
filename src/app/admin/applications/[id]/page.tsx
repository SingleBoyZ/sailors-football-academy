import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ApplicationReviewActions } from "@/components/admin/ApplicationReviewActions";
import { ageGroupFromDob } from "@/lib/age";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-brand-muted text-xs tracking-wide uppercase">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) notFound();

  const ageGroup = ageGroupFromDob(application.dob);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">{application.playerName}</h1>
          <p className="text-brand-muted text-sm">
            Submitted {application.submittedAt.toLocaleDateString("en-MY")}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.status === "PENDING" && (
        <ApplicationReviewActions applicationId={application.id} suggestedAgeGroup={ageGroup} />
      )}
      {application.status === "REJECTED" && application.rejectionReason && (
        <p className="border-brand-red/30 bg-brand-red/5 border p-4 text-sm">
          Rejected: {application.rejectionReason}
        </p>
      )}

      <section className="bg-brand-white border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Player</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" value={application.playerName} />
          <Field label="Date of Birth" value={application.dob.toLocaleDateString("en-MY")} />
          <Field label="Suggested Age Group" value={ageGroup} />
          <Field label="Gender" value={application.gender} />
          <Field label="School" value={application.school} />
          <Field label="Position" value={application.position} />
        </div>
        {application.experience && (
          <div className="mt-4">
            <p className="text-brand-muted text-xs tracking-wide uppercase">Experience</p>
            <p className="text-sm">{application.experience}</p>
          </div>
        )}
      </section>

      <section className="bg-brand-white border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Guardian</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" value={application.guardianName} />
          <Field label="IC / Passport" value={application.guardianIc} />
          <Field label="Phone" value={application.guardianPhone} />
          <Field label="Email" value={application.guardianEmail} />
          <Field label="Address" value={application.address} />
        </div>
      </section>

      <section className="bg-brand-white border border-brand-ink/10 p-6">
        <h2 className="font-display mb-4 text-lg">Medical &amp; Consent</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Emergency Contact" value={`${application.emergencyName} (${application.emergencyPhone})`} />
          <Field label="Photo Consent" value={application.photoConsent ? "Yes" : "No"} />
        </div>
        {application.medicalNotes && (
          <div className="mt-4">
            <p className="text-brand-muted text-xs tracking-wide uppercase">Medical Notes</p>
            <p className="text-sm">{application.medicalNotes}</p>
          </div>
        )}
      </section>
    </div>
  );
}
