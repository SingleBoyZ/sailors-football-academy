import { TextField, SelectField, TextAreaField } from "./fields";
import type { EnrolFormData } from "./types";
import { POSITION_OPTIONS } from "./types";
import { ageGroupFromDob } from "@/lib/age";

type StepProps = {
  data: EnrolFormData;
  update: (patch: Partial<EnrolFormData>) => void;
  errors: Record<string, string>;
};

export function StepPlayer({ data, update, errors }: StepProps) {
  const ageGroup = data.dob && !Number.isNaN(Date.parse(data.dob)) ? ageGroupFromDob(new Date(data.dob)) : null;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-2xl">Player Details</h2>
      <TextField label="Player's Full Name" value={data.playerName} onChange={(v) => update({ playerName: v })} error={errors.playerName} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <TextField label="Date of Birth" type="date" value={data.dob} onChange={(v) => update({ dob: v })} error={errors.dob} />
          {ageGroup && (
            <p className="text-brand-red-dark mt-1.5 text-xs">
              This places your child in age group <strong>{ageGroup}</strong>.
            </p>
          )}
        </div>
        <SelectField
          label="Gender"
          value={data.gender}
          onChange={(v) => update({ gender: v as EnrolFormData["gender"] })}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
          error={errors.gender}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="School (optional)" value={data.school} onChange={(v) => update({ school: v })} />
        <SelectField
          label="Preferred Position (optional)"
          value={data.position}
          onChange={(v) => update({ position: v })}
          options={POSITION_OPTIONS}
        />
      </div>
      <TextAreaField
        label="Football Experience (optional)"
        value={data.experience}
        onChange={(v) => update({ experience: v })}
        placeholder="Any previous clubs, schools teams, or years playing"
      />
    </div>
  );
}
