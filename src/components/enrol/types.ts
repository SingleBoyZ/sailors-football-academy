export type EnrolFormData = {
  playerName: string;
  dob: string;
  gender: "" | "Male" | "Female";
  school: string;
  position: string;
  experience: string;
  guardianName: string;
  guardianIc: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  medicalNotes: string;
  photoConsent: boolean;
  termsAccepted: boolean;
};

export const EMPTY_ENROL_FORM: EnrolFormData = {
  playerName: "",
  dob: "",
  gender: "",
  school: "",
  position: "",
  experience: "",
  guardianName: "",
  guardianIc: "",
  guardianPhone: "",
  guardianEmail: "",
  address: "",
  emergencyName: "",
  emergencyPhone: "",
  medicalNotes: "",
  photoConsent: false,
  termsAccepted: false,
};

export const POSITION_OPTIONS = [
  { value: "Goalkeeper", label: "Goalkeeper" },
  { value: "Defender", label: "Defender" },
  { value: "Midfielder", label: "Midfielder" },
  { value: "Forward", label: "Forward" },
  { value: "Not sure yet", label: "Not sure yet" },
];
