import { ageGroupFromDob } from "@/lib/age";
import type { EnrolFormData } from "./types";

type StepReviewProps = {
  data: EnrolFormData;
  onEdit: (step: number) => void;
};

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-brand-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function StepReview({ data, onEdit }: StepReviewProps) {
  const ageGroup = data.dob && !Number.isNaN(Date.parse(data.dob)) ? ageGroupFromDob(new Date(data.dob)) : "—";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Review &amp; Submit</h2>

      <section className="border border-brand-ink/10 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-lg">Player</h3>
          <button type="button" onClick={() => onEdit(0)} className="text-brand-red-dark text-xs underline">
            Edit
          </button>
        </div>
        <ReviewRow label="Name" value={data.playerName} />
        <ReviewRow label="Date of Birth" value={data.dob} />
        <ReviewRow label="Age Group" value={ageGroup} />
        <ReviewRow label="Gender" value={data.gender} />
        <ReviewRow label="School" value={data.school} />
        <ReviewRow label="Position" value={data.position} />
      </section>

      <section className="border border-brand-ink/10 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-lg">Guardian</h3>
          <button type="button" onClick={() => onEdit(1)} className="text-brand-red-dark text-xs underline">
            Edit
          </button>
        </div>
        <ReviewRow label="Name" value={data.guardianName} />
        <ReviewRow label="Phone" value={data.guardianPhone} />
        <ReviewRow label="Email" value={data.guardianEmail} />
        <ReviewRow label="Address" value={data.address} />
        <ReviewRow label="Emergency Contact" value={`${data.emergencyName} (${data.emergencyPhone})`} />
      </section>

      <section className="border border-brand-ink/10 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-lg">Medical &amp; Consent</h3>
          <button type="button" onClick={() => onEdit(2)} className="text-brand-red-dark text-xs underline">
            Edit
          </button>
        </div>
        <ReviewRow label="Medical Notes" value={data.medicalNotes || "None provided"} />
        <ReviewRow label="Photo Consent" value={data.photoConsent ? "Yes" : "No"} />
      </section>

      <p className="text-brand-muted text-xs">
        Submitting does not charge any payment — you&apos;ll pay the registration fee once your
        application is approved.
      </p>
    </div>
  );
}
