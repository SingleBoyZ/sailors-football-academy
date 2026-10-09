"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/data";
import type { CartItemInput } from "@/lib/data";

export type CartItemPayload = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  priceSen: number;
  image: string;
  qty: number;
};

/**
 * Merges the guest cart (from localStorage) into the signed-in user's
 * persisted cart and returns the merged cart, hydrated with current product
 * data. Returns null when there is no signed-in user (guests keep shopping
 * locally). Items pointing at deleted/inactive variants are dropped — the
 * cart always reflects what can actually be bought.
 */
export async function mergeGuestCartAction(guestItems: CartItemInput[]): Promise<CartItemPayload[] | null> {
  const session = await auth();
  if (!session) return null;

  const existing = await db.getCartItems(session.user.id);
  const merged = new Map(existing.map((i) => [i.variantId, i.qty]));
  for (const item of guestItems) {
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.qty);
  }

  const items = [...merged.entries()].map(([variantId, qty]) => ({ variantId, qty }));
  const display = await db.getCartDisplayItems(items.map((i) => i.variantId));
  const displayByVariant = new Map(display.map((d) => [d.variantId, d]));
  const valid = items.filter((i) => displayByVariant.has(i.variantId));

  await db.replaceCartItems(session.user.id, valid);

  return valid.map((i) => ({ ...displayByVariant.get(i.variantId)!, qty: i.qty }));
}

/** Full-replace sync of the signed-in user's cart. No-op for guests. */
export async function syncCartAction(items: CartItemInput[]): Promise<void> {
  const session = await auth();
  if (!session) return;
  try {
    await db.replaceCartItems(session.user.id, items);
  } catch (error) {
    // A stale variant id (e.g. deleted mid-session) must never break the UI.
    console.error("syncCartAction: failed to sync cart", error);
  }
}

/** Clears the signed-in user's cart — called once a paid order is confirmed. */
export async function clearServerCartAction(): Promise<void> {
  const session = await auth();
  if (!session) return;
  await db.replaceCartItems(session.user.id, []);
}
