"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, cartTotalQty } from "@/store/cart";

export function CartButton() {
  const items = useCart((s) => s.items);
  const toggle = useCart((s) => s.toggle);
  const qty = cartTotalQty(items);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Open cart, ${qty} item${qty === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 items-center justify-center text-brand-white transition-colors hover:text-brand-red"
    >
      <ShoppingBag className="h-5 w-5" />
      {qty > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-brand-white">
          {qty}
        </span>
      )}
    </button>
  );
}
