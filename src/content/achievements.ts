export type Trophy = {
  year: string;
  title: string;
  tag: "Champions" | "Finalists" | "Semi-Finalists" | "Milestone";
};

export const TROPHIES: Trophy[] = [
  { year: "2024", title: "Liga Isma Satria Champions", tag: "Champions" },
  { year: "2024", title: "SCL Semi-Finalists (debut campaign)", tag: "Semi-Finalists" },
  { year: "2025", title: "Liga Isma Satria Champions (back-to-back)", tag: "Champions" },
  { year: "2025", title: "SCL 2025 Champions — First Team", tag: "Champions" },
  { year: "2025", title: "FAS Foundation League Finalists", tag: "Finalists" },
];

export const YOUTH_FEATURE = {
  headline: "5 U18 players promoted to the SCL squad",
  body: "Our U18 squad, formed in 2025, competes in the FAS Liga Remaja and the FAS-affiliated senior league — and features players as young as 15. Five of our U18 players have already been promoted into the Selangor Champions League squad, proof that the pathway from academy to First Team is real.",
  stats: [
    { value: "5", label: "U18 players promoted to SCL" },
    { value: "15", label: "Youngest U18 player (age)" },
    { value: "2025", label: "Year U18 squad formed" },
  ],
} as const;
