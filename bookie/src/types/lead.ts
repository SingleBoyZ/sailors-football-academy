export interface LeadFormData {
  fullName: string;
  companyName: string;
  jobTitle: string;
  email: string;
  phone: string;
  industry: string;
  areasOfInterest: string[];
  purchasingTimeframe: string;
  followUpMethod: string;
  additionalNotes: string;
}

export const emptyLeadFormData: LeadFormData = {
  fullName: "",
  companyName: "",
  jobTitle: "",
  email: "",
  phone: "",
  industry: "",
  areasOfInterest: [],
  purchasingTimeframe: "",
  followUpMethod: "",
  additionalNotes: "",
};

export type FormErrors = Partial<Record<keyof LeadFormData, string>>;

export type SubmissionStatus = "idle" | "submitting" | "success";
