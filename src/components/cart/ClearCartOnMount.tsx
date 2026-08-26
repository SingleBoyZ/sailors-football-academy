"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Empties the persisted cart once a paid order has actually been confirmed. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
