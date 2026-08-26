import crypto from "node:crypto";

const BASE_URL =
  process.env.BILLPLZ_SANDBOX === "true"
    ? "https://www.billplz-sandbox.com/api/v3"
    : "https://www.billplz.com/api/v3";

function authHeader(): string {
  const apiKey = process.env.BILLPLZ_API_KEY;
  if (!apiKey) throw new Error("BILLPLZ_API_KEY is not set");
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

export type BillplzBill = {
  id: string;
  collection_id: string;
  paid: boolean;
  state: "due" | "paid" | "deleted";
  amount: number;
  paid_amount: string;
  due_at: string;
  email: string;
  mobile: string | null;
  name: string;
  url: string;
  redirect_url: string;
  callback_url: string;
  description: string;
  reference_1_label?: string;
  reference_1?: string;
};

type CreateBillInput = {
  collectionId: string;
  email: string;
  name: string;
  /** Integer sen — Billplz's `amount` field is the smallest currency unit. */
  amountSen: number;
  description: string;
  callbackUrl: string;
  redirectUrl: string;
  referenceLabel?: string;
  referenceValue?: string;
};

export async function createBill(input: CreateBillInput): Promise<BillplzBill> {
  const body = new URLSearchParams({
    collection_id: input.collectionId,
    email: input.email,
    name: input.name,
    amount: String(input.amountSen),
    description: input.description,
    callback_url: input.callbackUrl,
    redirect_url: input.redirectUrl,
    ...(input.referenceLabel ? { reference_1_label: input.referenceLabel } : {}),
    ...(input.referenceValue ? { reference_1: input.referenceValue } : {}),
  });

  const res = await fetch(`${BASE_URL}/bills`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Billplz createBill failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Re-fetches a bill's real status directly from Billplz. Always call this
 * before showing a success page — the redirect the browser lands on is not
 * itself proof of payment (see verifyRedirectSignature for why, and use
 * both together).
 */
export async function getBill(billId: string): Promise<BillplzBill> {
  const res = await fetch(`${BASE_URL}/bills/${billId}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Billplz getBill failed (${res.status}): ${text}`);
  }

  return res.json();
}

function computeSignature(params: Record<string, string>, signatureKey: string): string {
  const sourceString = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("|");
  return crypto.createHmac("sha256", signatureKey).update(sourceString).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function xSignatureKey(): string {
  const key = process.env.BILLPLZ_X_SIGNATURE_KEY;
  if (!key) throw new Error("BILLPLZ_X_SIGNATURE_KEY is not set");
  return key;
}

/**
 * Verifies the `x_signature` on a Billplz callback (server-to-server
 * webhook) payload, e.g. from a parsed `application/x-www-form-urlencoded`
 * POST body. Keys are unprefixed (`id`, `paid`, ...).
 */
export function verifyCallbackSignature(payload: Record<string, string>): boolean {
  const { x_signature, ...rest } = payload;
  if (!x_signature) return false;
  const expected = computeSignature(rest, xSignatureKey());
  return constantTimeEqual(expected, x_signature);
}

/**
 * Verifies the `x_signature` on the browser redirect Billplz sends the
 * customer back to. Keys here are bracket-prefixed (`billplz[id]`,
 * `billplz[paid]`, ...) exactly as Billplz appends them to the query
 * string — pass the raw search params through unmodified.
 */
export function verifyRedirectSignature(params: URLSearchParams): boolean {
  const entries: Record<string, string> = {};
  let signature: string | null = null;

  for (const [key, value] of params.entries()) {
    if (key === "billplz[x_signature]") {
      signature = value;
    } else if (key.startsWith("billplz[")) {
      entries[key] = value;
    }
  }

  if (!signature) return false;
  const expected = computeSignature(entries, xSignatureKey());
  return constantTimeEqual(expected, signature);
}

export function getRedirectParam(params: URLSearchParams, field: string): string | null {
  return params.get(`billplz[${field}]`);
}
