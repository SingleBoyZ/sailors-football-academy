import crypto from "node:crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { verifyCallbackSignature, verifyRedirectSignature } from "./billplz";

const SIGNATURE_KEY = "test-signature-key-123";

// Fixture computed independently: HMAC-SHA256("test-signature-key-123",
// "amount10000|collection_idcol1|idabc123|paidtrue|statepaid")
const KNOWN_SIGNATURE = "985e3f96f80e3798ea5947df7c89e410b32785ba0ebc7c52add70716f3cf842a";

beforeEach(() => {
  vi.stubEnv("BILLPLZ_X_SIGNATURE_KEY", SIGNATURE_KEY);
});

describe("verifyCallbackSignature", () => {
  it("accepts a payload matching a known-good fixture signature", () => {
    const payload = {
      amount: "10000",
      collection_id: "col1",
      id: "abc123",
      paid: "true",
      state: "paid",
      x_signature: KNOWN_SIGNATURE,
    };
    expect(verifyCallbackSignature(payload)).toBe(true);
  });

  it("rejects a payload whose data was tampered with after signing", () => {
    const payload = {
      amount: "999999", // tampered — original fixture was signed over amount=10000
      collection_id: "col1",
      id: "abc123",
      paid: "true",
      state: "paid",
      x_signature: KNOWN_SIGNATURE,
    };
    expect(verifyCallbackSignature(payload)).toBe(false);
  });

  it("rejects when x_signature is missing", () => {
    expect(verifyCallbackSignature({ id: "abc123", paid: "true" })).toBe(false);
  });

  it("rejects when signed with the wrong key", () => {
    vi.stubEnv("BILLPLZ_X_SIGNATURE_KEY", "a-different-key");
    const payload = {
      amount: "10000",
      collection_id: "col1",
      id: "abc123",
      paid: "true",
      state: "paid",
      x_signature: KNOWN_SIGNATURE,
    };
    expect(verifyCallbackSignature(payload)).toBe(false);
  });
});

describe("verifyRedirectSignature", () => {
  it("accepts bracket-prefixed redirect params matching a known-good signature", () => {
    // Same logical payload as the callback fixture, in Billplz's redirect
    // shape: keys bracket-prefixed with "billplz[...]".
    const bracketed = {
      "billplz[amount]": "10000",
      "billplz[collection_id]": "col1",
      "billplz[id]": "abc123",
      "billplz[paid]": "true",
      "billplz[state]": "paid",
    };
    const sourceString = Object.keys(bracketed)
      .sort()
      .map((k) => `${k}${bracketed[k as keyof typeof bracketed]}`)
      .join("|");
    const signature = crypto.createHmac("sha256", SIGNATURE_KEY).update(sourceString).digest("hex");

    const params = new URLSearchParams({ ...bracketed, "billplz[x_signature]": signature });
    expect(verifyRedirectSignature(params)).toBe(true);
  });

  it("rejects tampered redirect params", () => {
    const params = new URLSearchParams({
      "billplz[id]": "abc123",
      "billplz[paid]": "false", // flipped from what was actually signed
      "billplz[x_signature]": KNOWN_SIGNATURE,
    });
    expect(verifyRedirectSignature(params)).toBe(false);
  });
});
