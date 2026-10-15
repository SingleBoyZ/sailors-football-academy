"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { StepPlayer } from "./StepPlayer";
import { StepGuardian } from "./StepGuardian";
import { StepMedical } from "./StepMedical";
import { StepReview } from "./StepReview";
import { EMPTY_ENROL_FORM, type EnrolFormData } from "./types";
import { playerDetailsSchema, guardianSchema, medicalConsentSchema, applicationSchema } from "@/lib/validations/enrol";
import { submitApplication } from "@/app/(site)/enrol/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Player", "Guardian", "Medical", "Review"];
const DRAFT_KEY = "sfa-enrol-draft";
const STEP_SCHEMAS = [playerDetailsSchema, guardianSchema, medicalConsentSchema, applicationSchema];

function issuesToErrorMap(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

export function EnrolForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<EnrolFormData>(EMPTY_ENROL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore an in-progress draft (survives refresh / app switching on mobile).
  // sessionStorage is used rather than localStorage so IC/medical details are
  // dropped when the tab is closed.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { data?: Partial<EnrolFormData>; step?: number };
        if (saved.data) setData({ ...EMPTY_ENROL_FORM, ...saved.data });
        if (typeof saved.step === "number" && saved.step >= 0 && saved.step <= 3) setStep(saved.step);
      }
    } catch {
      // ignore corrupt draft
    }
    setHydrated(true);
  }, []);

  // Save the draft as the parent types.
  useEffect(() => {
    if (!hydrated || done) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step }));
    } catch {
      // storage unavailable (private mode / quota) — draft just isn't saved
    }
  }, [data, step, hydrated, done]);

  function update(patch: Partial<EnrolFormData>) {
    setData((d) => ({ ...d, ...patch }));
  }

  /** Start a fresh form for a sibling, keeping guardian + emergency contact details. */
  function enrolAnotherChild() {
    setData({
      ...EMPTY_ENROL_FORM,
      guardianName: data.guardianName,
      guardianIc: data.guardianIc,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      address: data.address,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
    });
    setErrors({});
    setSubmitError(null);
    setDirection(-1);
    setStep(0);
    setDone(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(target: number) {
    setDirection(target > step ? 1 : -1);
    setErrors({});
    setStep(target);
  }

  function handleNext() {
    const schema = STEP_SCHEMAS[step];
    const result = schema.safeParse(data);
    if (!result.success) {
      setErrors(issuesToErrorMap(result.error.issues));
      return;
    }
    setErrors({});
    if (step < 3) goTo(step + 1);
  }

  async function handleSubmit() {
    const result = applicationSchema.safeParse(data);
    if (!result.success) {
      setErrors(issuesToErrorMap(result.error.issues));
      goTo(0);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const outcome = await submitApplication(result.data);
    setSubmitting(false);

    if (!outcome.ok) {
      setSubmitError(outcome.error);
      return;
    }
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <CheckCircle2 className="text-brand-success mx-auto mb-6 h-14 w-14" />
        <h2 className="font-display text-3xl">Application Submitted</h2>
        <p className="text-brand-muted mt-3">
          We&apos;ve emailed {data.guardianEmail} a confirmation. Our staff will review {data.playerName}&apos;s
          application and be in touch soon.
        </p>
        <Button onClick={enrolAnotherChild} size="lg" variant="secondary" className="mt-8">
          Enrol another child (+ keep guardian details)
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10">
        <div className="flex justify-between text-xs tracking-wide uppercase">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={cn(i <= step ? "text-brand-ink" : "text-brand-muted/50")}>
              {label}
            </span>
          ))}
        </div>
        <div className="bg-brand-ink/10 mt-3 h-1 w-full">
          <motion.div
            className="bg-brand-red h-full"
            animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <StepPlayer data={data} update={update} errors={errors} />}
            {step === 1 && <StepGuardian data={data} update={update} errors={errors} />}
            {step === 2 && <StepMedical data={data} update={update} errors={errors} />}
            {step === 3 && <StepReview data={data} onEdit={goTo} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <p className="bg-brand-warning/10 text-brand-warning-dark border-brand-warning/30 mt-6 border p-3 text-sm">
          {submitError}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-brand-muted text-sm underline disabled:opacity-0"
        >
          &larr; Back
        </button>

        {step < 3 ? (
          <Button onClick={handleNext} size="lg">
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} size="lg" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
