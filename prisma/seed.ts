import { PrismaClient } from "@prisma/client";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";

const prisma = new PrismaClient();

/**
 * Creates (or promotes) the admin account in Supabase Auth and marks the
 * mirrored profiles row as ADMIN. Requires NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY; without them the rest of the seed still runs.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL || "admin@sailorsfootballacademy.com";
  const password = process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Academy Admin" },
    });

    if (error && !/already been registered/i.test(error.message)) {
      throw new Error(error.message);
    }

    const authId = data.user?.id;
    if (authId) {
      await prisma.user.upsert({
        where: { id: authId },
        update: { role: "ADMIN" },
        create: { id: authId, email, name: "Academy Admin", role: "ADMIN" },
      });
    }

    if (!process.env.ADMIN_SEED_EMAIL || !process.env.ADMIN_SEED_PASSWORD) {
      console.warn(
        `\n⚠️  ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set — using default admin ${email} / ${password}. Change this before going live.\n`,
      );
    }
  } catch (error) {
    console.warn(
      `\n⚠️  Could not create the admin auth account (${error instanceof Error ? error.message : error}). ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then re-run `npm run db:seed` (or use scripts/create-admin.ts).\n",
    );
  }
}

type SeedVariant = { label: string; sku: string; stock: number };
type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  category: "Kits" | "Training Wear" | "Accessories";
  priceSen: number;
  images: string[];
  variants: SeedVariant[];
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "home-kit",
    name: "Sailors Home Kit",
    description:
      "The red-and-white home shirt, shorts and socks set worn on match day at FootballHub Rimbayu.",
    category: "Kits",
    priceSen: 12_000,
    images: ["/placeholders/store/home-kit.svg"],
    variants: [
      { label: "128 (7-8y)", sku: "SFA-HK-128", stock: 15 },
      { label: "140 (9-10y)", sku: "SFA-HK-140", stock: 15 },
      { label: "152 (11-12y)", sku: "SFA-HK-152", stock: 15 },
      { label: "164 (13-14y)", sku: "SFA-HK-164", stock: 12 },
      { label: "Adult S", sku: "SFA-HK-AS", stock: 10 },
      { label: "Adult M", sku: "SFA-HK-AM", stock: 10 },
    ],
  },
  {
    slug: "away-kit",
    name: "Sailors Away Kit",
    description: "The navy away kit, built for travel fixtures and cup nights.",
    category: "Kits",
    priceSen: 12_000,
    images: ["/placeholders/store/away-kit.svg"],
    variants: [
      { label: "128 (7-8y)", sku: "SFA-AK-128", stock: 12 },
      { label: "140 (9-10y)", sku: "SFA-AK-140", stock: 12 },
      { label: "152 (11-12y)", sku: "SFA-AK-152", stock: 12 },
      { label: "164 (13-14y)", sku: "SFA-AK-164", stock: 10 },
    ],
  },
  {
    slug: "training-tee",
    name: "Training Tee",
    description: "Breathable training tee for weeknight sessions at the Hub.",
    category: "Training Wear",
    priceSen: 4_500,
    images: ["/placeholders/store/training-tee.svg"],
    variants: [
      { label: "S", sku: "SFA-TT-S", stock: 20 },
      { label: "M", sku: "SFA-TT-M", stock: 20 },
      { label: "L", sku: "SFA-TT-L", stock: 15 },
      { label: "XL", sku: "SFA-TT-XL", stock: 10 },
    ],
  },
  {
    slug: "training-shorts",
    name: "Training Shorts",
    description: "Lightweight training shorts with the club crest.",
    category: "Training Wear",
    priceSen: 4_000,
    images: ["/placeholders/store/training-shorts.svg"],
    variants: [
      { label: "S", sku: "SFA-TS-S", stock: 20 },
      { label: "M", sku: "SFA-TS-M", stock: 20 },
      { label: "L", sku: "SFA-TS-L", stock: 15 },
    ],
  },
  {
    slug: "training-socks",
    name: "Training Socks",
    description: "Cushioned crew socks in club red.",
    category: "Training Wear",
    priceSen: 1_500,
    images: ["/placeholders/store/training-socks.svg"],
    variants: [
      { label: "Junior", sku: "SFA-SK-JR", stock: 30 },
      { label: "Senior", sku: "SFA-SK-SR", stock: 30 },
    ],
  },
  {
    slug: "sailors-cap",
    name: "Sailors Cap",
    description: "Adjustable cap with embroidered ship's-wheel crest.",
    category: "Accessories",
    priceSen: 3_500,
    images: ["/placeholders/store/cap.svg"],
    variants: [{ label: "One Size", sku: "SFA-CAP-OS", stock: 25 }],
  },
  {
    slug: "sailors-backpack",
    name: "Sailors Backpack",
    description: "Boot compartment, kit space and water-resistant base.",
    category: "Accessories",
    priceSen: 8_900,
    images: ["/placeholders/store/backpack.svg"],
    variants: [{ label: "One Size", sku: "SFA-BAG-OS", stock: 18 }],
  },
  {
    slug: "water-bottle",
    name: "Sailors Water Bottle",
    description: "750ml squeeze bottle with the academy crest.",
    category: "Accessories",
    priceSen: 2_500,
    images: ["/placeholders/store/bottle.svg"],
    variants: [{ label: "750ml", sku: "SFA-BTL-750", stock: 40 }],
  },
];

async function seedProducts() {
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        category: product.category,
        priceSen: product.priceSen,
        images: product.images,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        category: product.category,
        priceSen: product.priceSen,
        images: product.images,
        variants: { create: product.variants },
      },
    });
  }
}

const SUCCESS_STORIES = [
  {
    slug: "sample-story-one",
    playerName: "Sample Player One",
    ageGroup: "U12",
    quote: "This is placeholder text — replace via Admin → Success Stories.",
    body: "This is a demo success story seeded for local development. Replace the name, age group, quote, photo and body copy in the admin panel with a real Sailor's story before launch.",
    image: "/placeholders/success-story-1.svg",
    published: true,
  },
  {
    slug: "sample-story-two",
    playerName: "Sample Player Two",
    ageGroup: "U16 Performance",
    quote: "This is placeholder text — replace via Admin → Success Stories.",
    body: "This is a demo success story seeded for local development. Replace the name, age group, quote, photo and body copy in the admin panel with a real Sailor's story before launch.",
    image: "/placeholders/success-story-2.svg",
    published: true,
  },
  {
    slug: "sample-story-three",
    playerName: "Sample Player Three",
    ageGroup: "U18",
    quote: "This is placeholder text — replace via Admin → Success Stories.",
    body: "This is a demo success story seeded for local development. Replace the name, age group, quote, photo and body copy in the admin panel with a real Sailor's story before launch.",
    image: "/placeholders/success-story-3.svg",
    published: true,
  },
];

async function seedSuccessStories() {
  for (const story of SUCCESS_STORIES) {
    await prisma.successStory.upsert({
      where: { slug: story.slug },
      update: story,
      create: story,
    });
  }
}

async function seedSettings() {
  const settings: { key: string; value: unknown }[] = [
    { key: "shippingSen", value: 800 },
    { key: "whatsappNumber", value: "60175681830" },
    { key: "bannerText", value: "Enrolment for the new season is open — all aboard." },
    { key: "sponsoredMonthlyFeeSen", value: 10_000 },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value as never },
      create: { key: setting.key, value: setting.value as never },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedProducts();
  await seedSuccessStories();
  await seedSettings();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
