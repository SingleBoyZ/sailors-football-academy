import { TextAreaField, CheckboxField } from "./fields";
import type { EnrolFormData } from "./types";

type StepProps = {
  data: EnrolFormData;
  update: (patch: Partial<EnrolFormData>) => void;
  errors: Record<string, string>;
};

export function StepMedical({ data, update, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Medical &amp; Consent</h2>
      <TextAreaField
        label="Allergies or Medical Conditions (optional)"
        value={data.medicalNotes}
        onChange={(v) => update({ medicalNotes: v })}
        placeholder="Let coaching staff know about anything relevant — asthma, allergies, injuries, etc."
      />
      <CheckboxField
        label="I consent to my child being photographed or filmed during training and matches for academy marketing, social media and success stories."
        checked={data.photoConsent}
        onChange={(v) => update({ photoConsent: v })}
      />
      <CheckboxField
        label={
          <>
            I have read and agree to the academy&apos;s{" "}
            <a href="/terms" target="_blank" className="text-brand-red-dark underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" target="_blank" className="text-brand-red-dark underline">
              Privacy Policy
            </a>
            .
          </>
        }
        checked={data.termsAccepted}
        onChange={(v) => update({ termsAccepted: v })}
        error={errors.termsAccepted}
      />
    </div>
  );
}
