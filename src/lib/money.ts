/**
 * All money in this app is stored and passed around as an integer number of
 * sen (1 RM = 100 sen) to avoid floating-point rounding errors. These helpers
 * are the only place formatting/parsing happens.
 */

const RM_FORMATTER = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 21000 -> "RM210.00" (locale-aware thousands separators) */
export function formatSen(sen: number): string {
  return RM_FORMATTER.format(sen / 100);
}

/** 21000 -> "RM210.00" (fixed, no thousands separator — used in tags/badges) */
export function formatSenCompact(sen: number): string {
  return `RM${(sen / 100).toFixed(2)}`;
}

/** Parses a user-entered ringgit string ("210", "210.50") into integer sen. Returns null if invalid. */
export function parseRinggitToSen(input: string): number | null {
  const trimmed = input.trim().replace(/^RM\s*/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [ringgit, cents = ""] = trimmed.split(".");
  const paddedCents = cents.padEnd(2, "0");
  return Number(ringgit) * 100 + Number(paddedCents);
}

export function senToRinggit(sen: number): number {
  return sen / 100;
}
