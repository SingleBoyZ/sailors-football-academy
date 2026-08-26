export const SITE = {
  name: "Sailors Football Academy",
  shortName: "Sailors FA",
  club: "Royal Klang Sailors",
  clubShort: "RKS",
  tagline: "The kick-off of a new voyage. Together we sail.",
  hashtag: "#KASITEMPUR",
  description:
    "Sailors Football Academy is the youth development arm of Royal Klang Sailors (RKS), offering structured U6–U18 football programmes at FootballHub Rimbayu, Klang, Selangor.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  location: {
    venue: "FootballHub Rimbayu",
    area: "Bandar Rimbayu, Klang, Selangor",
    mapQuery: "FootballHub Rimbayu, Bandar Rimbayu, Klang",
  },
  contact: {
    whatsappDisplay: "017-568 1830",
    whatsappHref: "https://wa.me/60175681830",
    instagramClub: {
      handle: "@officialklangcitysailors",
      url: "https://instagram.com/officialklangcitysailors",
    },
    instagramAcademy: {
      handle: "@mysailorsfootballacademy",
      url: "https://instagram.com/mysailorsfootballacademy",
    },
  },
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Academy", href: "/academy" },
  { label: "Programmes", href: "/programmes" },
  { label: "Training", href: "/training" },
  { label: "Achievements", href: "/achievements" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Store", href: "/store" },
  { label: "Enrol", href: "/enrol" },
  { label: "Pay Fees", href: "/pay" },
] as const;
