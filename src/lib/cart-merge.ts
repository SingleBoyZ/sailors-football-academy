"use client";

import { useCart } from "@/store/cart";
import { mergeGuestCartAction } from "@/app/(site)/cart/actions";

/**
 * Pushes any local guest cart into the signed-in user's persisted cart and
 * rehydrates the store from the database. Call right after a successful
 * sign-in/sign-up so the cart survives across sessions.
 */
export async function mergeGuestCartIntoServer() {
  const local = useCart.getState().items.map((i) => ({ variantId: i.variantId, qty: i.qty }));
  const merged = await mergeGuestCartAction(local);
  if (merged) {
    useCart.setState({
      items: merged.map((m) => ({
        variantId: m.variantId,
        productSlug: m.productSlug,
        productName: m.productName,
        variantLabel: m.variantLabel,
        priceSen: m.priceSen,
        image: m.image,
        qty: m.qty,
      })),
    });
  }
}
