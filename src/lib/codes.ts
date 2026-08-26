import crypto from "node:crypto";

/** SFA-O-20260826-4F2A1C — date-stamped with a random suffix; collisions are astronomically unlikely. */
export function generateOrderNo(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SFA-O-${stamp}-${suffix}`;
}
