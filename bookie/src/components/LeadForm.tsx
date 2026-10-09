import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  AREA_OF_INTEREST_OPTIONS,
  FOLLOW_UP_OPTIONS,
  INDUSTRY_OPTIONS,
  PURCHASING_TIMEFRAME_OPTIONS,
} from "../config/formOptions";
import { validateField, validateForm } from "../lib/validation";
import { emptyLeadFormData, type FormErrors, type LeadFormData, type SubmissionStatus } from "../types/lead";
import { CheckboxGroupField } from "./form/CheckboxGroupField";
import { RadioGroupField } from "./form/RadioGroupField";
import { SelectField } from "./form/SelectField";
import { TextAreaField } from "./form/TextAreaField";
import { TextField } from "./form/TextField";

interface LeadFormProps {
  status: SubmissionStatus;
  submitError: string | null;
  onSubmit: (data: LeadFormData) => void;
}

type TouchedFields = Partial<Record<keyof LeadFormData, boolean>>;

const ALL_FIELDS: (keyof LeadFormData)[] = [
  "fullName",
  "companyName",
  "jobTitle",
  "email",
  "phone",
  "industry",
  "areasOfInterest",
  "purchasingTimeframe",
  "followUpMethod",
];

export function LeadForm({ status, submitError, onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>(emptyLeadFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const isSubmitting = status === "submitting";

  function updateField<K extends keyof LeadFormData>(name: K, value: LeadFormData[K]) {
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, nextData) }));
    }
  }

  function handleBlur(name: keyof LeadFormData) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData) }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    setTouched(
      ALL_FIELDS.reduce<TouchedFields>((acc, field) => {
        acc[field] = true;
        return acc;
      }, {}),
    );

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = ALL_FIELDS.find((field) => nextErrors[field]);
      if (firstInvalidField) {
        document
          .getElementById(firstInvalidField)
          ?.closest("[data-field-wrapper]")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    onSubmit(formData);
  }

  return (
    <section id="lead-form" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Get Your Exhibition Resources
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Fill in your details below to access the event materials.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
        >
          {submitError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {submitError}
            </div>
          )}

          <div className="space-y-6">
            <div data-field-wrapper>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                placeholder="Enter your full name"
                required
                error={touched.fullName ? errors.fullName : undefined}
                onChange={(value) => updateField("fullName", value)}
                onBlur={() => handleBlur("fullName")}
                autoComplete="name"
              />
            </div>

            <div data-field-wrapper>
              <TextField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                placeholder="Enter your company name"
                required
                error={touched.companyName ? errors.companyName : undefined}
                onChange={(value) => updateField("companyName", value)}
                onBlur={() => handleBlur("companyName")}
                autoComplete="organization"
              />
            </div>

            <div data-field-wrapper>
              <TextField
                label="Job Title / Designation"
                name="jobTitle"
                value={formData.jobTitle}
                placeholder="e.g. Marketing Manager"
                required
                error={touched.jobTitle ? errors.jobTitle : undefined}
                onChange={(value) => updateField("jobTitle", value)}
                onBlur={() => handleBlur("jobTitle")}
                autoComplete="organization-title"
              />
            </div>

            <div data-field-wrapper>
              <TextField
                label="Business Email Address"
                name="email"
                type="email"
                value={formData.email}
                placeholder="name@company.com"
                required
                error={touched.email ? errors.email : undefined}
                onChange={(value) => updateField("email", value)}
                onBlur={() => handleBlur("email")}
                autoComplete="email"
              />
            </div>

            <div data-field-wrapper>
              <TextField
                label="Mobile / WhatsApp Number"
                name="phone"
                type="tel"
                value={formData.phone}
                placeholder="+60 12 345 6789"
                required
                error={touched.phone ? errors.phone : undefined}
                onChange={(value) => updateField("phone", value)}
                onBlur={() => handleBlur("phone")}
                autoComplete="tel"
              />
            </div>

            <div data-field-wrapper>
              <SelectField
                label="Industry / Sector"
                name="industry"
                value={formData.industry}
                options={INDUSTRY_OPTIONS}
                placeholder="Select your industry"
                required
                error={touched.industry ? errors.industry : undefined}
                onChange={(value) => updateField("industry", value)}
                onBlur={() => handleBlur("industry")}
              />
            </div>

            <div data-field-wrapper>
              <CheckboxGroupField
                legend="Primary Area of Interest"
                name="areasOfInterest"
                options={AREA_OF_INTEREST_OPTIONS}
                value={formData.areasOfInterest}
                required
                error={touched.areasOfInterest ? errors.areasOfInterest : undefined}
                onChange={(value) => updateField("areasOfInterest", value)}
                onBlur={() => handleBlur("areasOfInterest")}
              />
            </div>

            <div data-field-wrapper>
              <SelectField
                label="Purchasing Timeframe"
                name="purchasingTimeframe"
                value={formData.purchasingTimeframe}
                options={PURCHASING_TIMEFRAME_OPTIONS}
                placeholder="Select a timeframe"
                required
                error={touched.purchasingTimeframe ? errors.purchasingTimeframe : undefined}
                onChange={(value) => updateField("purchasingTimeframe", value)}
                onBlur={() => handleBlur("purchasingTimeframe")}
              />
            </div>

            <div data-field-wrapper>
              <RadioGroupField
                legend="How would you like us to follow up?"
                name="followUpMethod"
                options={FOLLOW_UP_OPTIONS}
                value={formData.followUpMethod}
                required
                error={touched.followUpMethod ? errors.followUpMethod : undefined}
                onChange={(value) => updateField("followUpMethod", value)}
                onBlur={() => handleBlur("followUpMethod")}
              />
            </div>

            <div data-field-wrapper>
              <TextAreaField
                label="Additional Notes / Requirements"
                name="additionalNotes"
                value={formData.additionalNotes}
                placeholder="Tell us anything else you'd like our team to know..."
                onChange={(value) => updateField("additionalNotes", value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-3.5 text-base font-semibold text-white shadow-card transition-all hover:bg-navy-800 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                Preparing your resources...
              </>
            ) : (
              <>
                Send &amp; Get Resources
                <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            By submitting, you agree to be contacted regarding your inquiry. We respect your
            privacy and will not share your information.
          </p>
        </form>
      </div>
    </section>
  );
}
