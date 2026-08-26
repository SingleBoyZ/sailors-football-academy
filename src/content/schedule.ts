export type ScheduleRow = {
  days: string;
  time: string;
  ageGroups: string;
};

export const TRAINING_SCHEDULE: { heading: string; rows: ScheduleRow[] }[] = [
  {
    heading: "Weekdays (Tue & Thu)",
    rows: [
      { days: "Tue & Thu", time: "5:00 PM – 6:30 PM", ageGroups: "U6, U12, U16" },
      { days: "Tue & Thu", time: "6:30 PM – 8:00 PM", ageGroups: "U8, U10, U14" },
    ],
  },
  {
    heading: "Weekends (Sat & Sun)",
    rows: [
      { days: "Sat & Sun", time: "8:00 AM – 9:30 AM", ageGroups: "U6, U8, U10, U12" },
      { days: "Sat & Sun", time: "9:30 AM – 11:00 AM", ageGroups: "U14 & U16" },
    ],
  },
];

/** All money in this file is stored as integer sen — see lib/money.ts */
export const FEES = {
  registrationSen: 17_000,
  registrationNote: "Includes 2 training kits",
  monthlySen: 21_000,
  sibling2Sen: 18_000,
  sibling3Sen: 16_000,
  sponsoredSen: 10_000,
} as const;

export const AGE_GROUPS = ["U6", "U8", "U10", "U12", "U14", "U16", "U18"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];
