import type { FormErrors, LeadFormData } from "../types/lead";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,}$/;

type FieldName = keyof LeadFormData;

export function validateField(name: FieldName, data: LeadFormData): string | undefined {
  switch (name) {
    case "fullName":
      return data.fullName.trim().length === 0 ? "Please enter your name." : undefined;

    case "companyName":
      return data.companyName.trim().length === 0
        ? "Please enter your company name."
        : undefined;

    case "jobTitle":
      return data.jobTitle.trim().length === 0
        ? "Please enter your job title."
        : undefined;

    case "email":
      if (data.email.trim().length === 0) {
        return "Please enter your business email address.";
      }
      return EMAIL_PATTERN.test(data.email.trim())
        ? undefined
        : "Please enter a valid business email address.";

    case "phone":
      if (data.phone.trim().length === 0) {
        return "Please enter your mobile / WhatsApp number.";
      }
      return PHONE_PATTERN.test(data.phone.trim())
        ? undefined
        : "Please enter a valid phone number.";

    case "industry":
      return data.industry.trim().length === 0 ? "Please select an industry." : undefined;

    case "areasOfInterest":
      return data.areasOfInterest.length === 0
        ? "Please select at least one area of interest."
        : undefined;

    case "purchasingTimeframe":
      return data.purchasingTimeframe.trim().length === 0
        ? "Please select your purchasing timeframe."
        : undefined;

    case "followUpMethod":
      return data.followUpMethod.trim().length === 0
        ? "Please select how you'd like us to follow up."
        : undefined;

    case "additionalNotes":
      return undefined;

    default:
      return undefined;
  }
}

const REQUIRED_FIELDS: FieldName[] = [
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

export function validateForm(data: LeadFormData): FormErrors {
  const errors: FormErrors = {};

  for (const field of REQUIRED_FIELDS) {
    const message = validateField(field, data);
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function isFormValid(data: LeadFormData): boolean {
  return Object.keys(validateForm(data)).length === 0;
}
