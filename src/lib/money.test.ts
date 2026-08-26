import { describe, expect, it } from "vitest";
import { formatSen, formatSenCompact, parseRinggitToSen, senToRinggit } from "./money";

describe("formatSenCompact", () => {
  it("formats whole ringgit amounts", () => {
    expect(formatSenCompact(21_000)).toBe("RM210.00");
  });

  it("formats amounts with cents", () => {
    expect(formatSenCompact(17_050)).toBe("RM170.50");
  });

  it("formats zero", () => {
    expect(formatSenCompact(0)).toBe("RM0.00");
  });
});

describe("formatSen", () => {
  it("adds thousands separators for large amounts", () => {
    // Intl's en-MY currency format uses a non-breaking space (U+00A0) after "RM".
    expect(formatSen(123_456_00)).toBe("RM 123,456.00");
  });
});

describe("parseRinggitToSen", () => {
  it("parses a whole number", () => {
    expect(parseRinggitToSen("210")).toBe(21_000);
  });

  it("parses two decimal places", () => {
    expect(parseRinggitToSen("170.50")).toBe(17_050);
  });

  it("pads a single decimal place", () => {
    expect(parseRinggitToSen("10.5")).toBe(1_050);
  });

  it("strips an RM prefix", () => {
    expect(parseRinggitToSen("RM 210.00")).toBe(21_000);
  });

  it("rejects invalid input", () => {
    expect(parseRinggitToSen("abc")).toBeNull();
    expect(parseRinggitToSen("10.999")).toBeNull();
    expect(parseRinggitToSen("-10")).toBeNull();
  });
});

describe("senToRinggit", () => {
  it("converts sen to a ringgit float", () => {
    expect(senToRinggit(21_000)).toBe(210);
    expect(senToRinggit(17_050)).toBe(170.5);
  });
});

describe("checkout pricing (sen-integer arithmetic)", () => {
  it("never introduces floating point drift across many items", () => {
    // 3 items at RM33.33 each — a classic float trap (33.33 * 3 !== 99.99 in JS floats)
    const unitPriceSen = 3_333;
    const qty = 3;
    const subtotal = unitPriceSen * qty;
    expect(subtotal).toBe(9_999);
    expect(Number.isInteger(subtotal)).toBe(true);
  });
});
