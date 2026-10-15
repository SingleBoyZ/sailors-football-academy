export const ABOUT_COPY = {
  lead: "From grassroots to the First Team, there is a pathway for every Sailor.",
  paragraphs: [
    "Founded in January 2026, Sailors Football Academy was established as the youth development arm of Royal Klang Sailors (RKS), a football club founded in 2023. The academy was created with a clear purpose: to build a structured pathway for young players to develop from grassroots football towards competitive youth football and ultimately the Royal Klang Sailors First Team.",
    "RKS has continued to grow since its establishment, with one of the club's proudest achievements coming in 2025 when the First Team was crowned SCL Champions.",
    "Today, Sailors Football Academy provides programmes from U6 to U18, offering players a positive, structured and competitive environment to develop their technical ability, game understanding, confidence and character. Through age appropriate coaching and game based learning, we encourage our players to think, make decisions and express themselves on the pitch while developing the values and habits needed to succeed beyond it.",
  ],
} as const;

export type TimelineEntry = {
  year: string;
  heading: string;
  points: string[];
};

export const CLUB_TIMELINE: TimelineEntry[] = [
  {
    year: "2023",
    heading: "Club Founded",
    points: ["Royal Klang Sailors founded in Klang, Selangor."],
  },
  {
    year: "2024",
    heading: "First Steps, First Silverware",
    points: [
      "Qualified for the Selangor Champions League (SCL)",
      "Semi-finalists in our first SCL campaign",
      "Liga Isma Satria champions",
    ],
  },
  {
    year: "2025",
    heading: "Back-to-Back Champions, Academy Pathway Opens",
    points: [
      "Back-to-back Liga Isma Satria champions",
      "SCL 2025 Champions (First Team)",
      "FAS Foundation League finalists",
      "U18 squad formed — competing in FAS Liga Remaja and the FAS-affiliated senior league",
      "5 U18 players promoted to the SCL squad",
      "U18 squad features players as young as 15",
    ],
  },
  {
    year: "Jan 2026",
    heading: "Sailors Football Academy Founded",
    points: [
      "A structured U6–U18 development pathway opens, feeding the U18s and First Team.",
    ],
  },
];

export const HOME_GROUND = {
  name: "FootballHub Rimbayu",
  area: "Bandar Rimbayu",
  description:
    "A modern, well-maintained football facility that serves as the central hub for all training sessions, matches and club activities — a safe, accessible and professional environment for players and families.",
  townhall:
    "We host quarterly townhall meetings with parents, players, coaches and management to share programme updates, review progress, discuss upcoming plans and gather feedback from our community.",
} as const;

export const PHILOSOPHY = {
  heading: "Develop confident, intelligent footballers",
  body: "Our philosophy is simple: develop confident, intelligent footballers while building strong values and a love for the game. Through age appropriate coaching and game based learning, we encourage our players to think, make decisions and express themselves on the pitch.",
} as const;
