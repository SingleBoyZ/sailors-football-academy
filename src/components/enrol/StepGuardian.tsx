import { TextField, TextAreaField } from "./fields";
import type { EnrolFormData } from "./types";

type StepProps = {
  data: EnrolFormData;
  update: (patch: Partial<EnrolFormData>) => void;
  errors: Record<string, string>;
};

export function StepGuardian({ data, update, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-2xl">Parent / Guardian</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Guardian's Full Name" value={data.guardianName} onChange={(v) => update({ guardianName: v })} error={errors.guardianName} />
        <TextField label="IC / Passport (optional)" value={data.guardianIc} onChange={(v) => update({ guardianIc: v })} />
        <TextField label="Phone Number" value={data.guardianPhone} onChange={(v) => update({ guardianPhone: v })} error={errors.guardianPhone} placeholder="012-3456789" />
        <TextField label="Email Address" type="email" value={data.guardianEmail} onChange={(v) => update({ guardianEmail: v })} error={errors.guardianEmail} />
      </div>
      <TextAreaField label="Home Address" value={data.address} onChange={(v) => update({ address: v })} error={errors.address} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Emergency Contact Name" value={data.emergencyName} onChange={(v) => update({ emergencyName: v })} error={errors.emergencyName} />
        <TextField label="Emergency Contact Phone" value={data.emergencyPhone} onChange={(v) => update({ emergencyPhone: v })} error={errors.emergencyPhone} placeholder="012-3456789" />
      </div>
    </div>
  );
}
