import { AGE_GROUPS, type AgeGroup } from "@/content/schedule";

/**
 * Malaysian youth football seasons run Jan–Dec, so "age this competitive
 * year" is simply the season year minus birth year — not a running age that
 * changes mid-season on the player's birthday.
 */
export function seasonAge(dob: Date, seasonYear: number = new Date().getFullYear()): number {
  return seasonYear - dob.getFullYear();
}

/** Maps a season age to the nearest age group band the academy actually runs (U6–U18). */
export function ageGroupFromDob(dob: Date, seasonYear?: number): AgeGroup {
  const age = seasonAge(dob, seasonYear);
  const band = AGE_GROUPS.find((group) => age <= Number(group.slice(1)));
  return band ?? AGE_GROUPS[AGE_GROUPS.length - 1];
}
