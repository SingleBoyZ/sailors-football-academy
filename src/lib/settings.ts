import { prisma } from "@/lib/prisma";

/** Reads an admin-editable Setting by key, falling back if unset or the DB is unreachable. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row ? (row.value as T) : fallback;
  } catch (error) {
    console.error(`getSetting(${key}): failed`, error);
    return fallback;
  }
}
