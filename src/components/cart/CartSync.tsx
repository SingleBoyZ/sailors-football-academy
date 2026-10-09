"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { mergeGuestCartAction, syncCartAction } from "@/app/(site)/cart/actions";

/**
 * Keeps the persisted (Supabase) cart and the local Zustand cart in sync for
 * signed-in users:
 *
 *  - On mount (and whenever sign-in state flips), any local guest items are
 *    merged into the user's `cart_items` rows and the store is rehydrated
 *    from the database, so the cart survives logout/login.
 *  - Afterwards every store change is pushed to the database (debounced).
 *
 * Guests are untouched — their cart lives in localStorage only.
 */
export function CartSync({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    if (!signedIn) return;

    let cancelled = false;

    (async () => {
      const local = useCart.getState().items.map((i) => ({ variantId: i.variantId, qty: i.qty }));
      const merged = await mergeGuestCartAction(local);
      if (cancelled || !merged) return;
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
    })();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useCart.subscribe((state, prev) => {
      if (state.items === prev.items) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void syncCartAction(state.items.map((i) => ({ variantId: i.variantId, qty: i.qty })));
      }, 600);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [signedIn]);

  return null;
}
