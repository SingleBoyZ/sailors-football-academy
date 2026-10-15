"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { clearServerCartAction } from "@/app/(site)/cart/actions";

/** Empties the persisted carts (local + signed-in user's database cart) once a paid order has actually been confirmed. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
    void clearServerCartAction();
  }, [clear]);
  return null;
}
