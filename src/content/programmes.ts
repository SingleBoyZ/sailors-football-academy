export type ProgrammeCard = {
  key: "foundation" | "advance" | "performance";
  name: string;
  ageRange: string;
  summary: string;
  points: string[];
};

export const PROGRAMMES: ProgrammeCard[] = [
  {
    key: "foundation",
    name: "Foundation Programme",
    ageRange: "U6 – U14",
    summary:
      "Introduces young players to football in a fun and supportive environment.",
    points: [
      "Basic technique and ball mastery",
      "Confidence-building, game-based sessions",
      "All groups attend tournaments and friendly matches for early game experience",
    ],
  },
  {
    key: "advance",
    name: "Advance Programme",
    ageRange: "U6 – U16",
    summary:
      "For players who've mastered the basics and are ready for structured, challenging training.",
    points: [
      "Decision-making under pressure",
      "Positional understanding",
      "Preparation for regular competition",
    ],
  },
  {
    key: "performance",
    name: "Performance Programme",
    ageRange: "U16 & U18",
    summary:
      "The highest level at Klang City Sailors, built for state and senior-level football.",
    points: [
      "Intensive, tactical, match-demand focused training",
      "Regular tournaments, leagues and high-level friendlies",
      "Direct pathway to the U18 squad and First Team",
    ],
  },
];

export const PATHWAY_STEPS = [
  {
    step: 1,
    label: "Foundation",
    ageRange: "U6 – U14",
    description: "Fun, technique-first introduction to the game.",
  },
  {
    step: 2,
    label: "Advance",
    ageRange: "U6 – U16",
    description: "Structured training for decision-making and positioning.",
  },
  {
    step: 3,
    label: "Performance",
    ageRange: "U16 & U18",
    description: "Intensive, tactical preparation for competitive football.",
  },
  {
    step: 4,
    label: "U18 Squad",
    ageRange: "U18",
    description: "FAS Liga Remaja and FAS-affiliated senior league football.",
  },
  {
    step: 5,
    label: "First Team",
    ageRange: "Senior",
    description: "Selangor Champions League — the top of the pathway.",
  },
] as const;

export type PhaseDetail = {
  title: string;
  timing: string;
  intro: string;
  groups: { label: string; points: string[] }[];
};

export const PHASE_1: PhaseDetail = {
  title: "Foundation Period",
  timing: "First 3–6 months",
  intro:
    "During the initial period, our focus is on establishing strong fundamentals and consistent training habits.",
  groups: [
    {
      label: "U6 – U14",
      points: [
        "All players begin under the Foundation Programme",
        "Players train together in age groups",
        "Teams participate in tournaments and friendly matches",
        "Assessments are conducted regularly to monitor progress",
        "This phase ensures every player starts with the right foundation before being separated into different levels",
      ],
    },
    {
      label: "U16",
      points: [
        "Begins immediately with two training pathways: U16 Performance and U16 Advance",
        "Players are grouped based on readiness and ongoing assessments",
      ],
    },
    {
      label: "U18",
      points: [
        "Operates solely as a Performance Programme",
        "Competes in FAS Liga Remaja",
        "Competes in FAS-affiliated senior league competitions",
      ],
    },
  ],
};

export const PHASE_2: PhaseDetail = {
  title: "Full Pathway Activation",
  timing: "After 3–6 months",
  intro:
    "As players settle into consistent training habits, age groups split into differentiated pathways based on readiness.",
  groups: [
    {
      label: "U6 – U14",
      points: [
        "Age groups split into Foundation Programme and Advance Programme",
        "Both pathways remain part of the same age group but follow different training intensities and competitive levels",
      ],
    },
    {
      label: "U16",
      points: [
        "Continues with U16 Performance Programme and U16 Advance Programme",
        "Movement between squads is possible based on evaluations",
      ],
    },
  ],
};

export const PLACEMENT_CRITERIA = [
  "Technical ability",
  "Training consistency",
  "Behaviour and effort",
  "Match performance",
  "Coach evaluation",
] as const;
