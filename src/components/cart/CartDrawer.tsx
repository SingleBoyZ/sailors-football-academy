"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart, cartTotalSen } from "@/store/cart";
import { formatSenCompact } from "@/lib/money";
import { springDrawer } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const items = useCart((s) => s.items);
  const close = useCart((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, close]);

  const total = cartTotalSen(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-[150] bg-brand-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[150] flex w-full max-w-md flex-col bg-brand-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={springDrawer}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-brand-ink/10 px-6 py-5">
              <h2 className="font-display text-xl">Your Kit Bag</h2>
              <button onClick={close} aria-label="Close cart" className="p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="text-brand-muted mt-8 text-center">Your bag is empty.</p>
              ) : (
                <ul className="flex flex-col gap-5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-brand-sand">
                          <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <p className="text-sm font-semibold">{item.productName}</p>
                          <p className="text-brand-muted text-xs">{item.variantLabel}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border border-brand-ink/15">
                              <button
                                aria-label="Decrease quantity"
                                className="p-1.5 hover:bg-brand-sand"
                                onClick={() => setQty(item.variantId, item.qty - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <motion.span
                                key={item.qty}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="w-6 text-center text-sm"
                              >
                                {item.qty}
                              </motion.span>
                              <button
                                aria-label="Increase quantity"
                                className="p-1.5 hover:bg-brand-sand"
                                onClick={() => setQty(item.variantId, item.qty + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <motion.span
                              key={item.qty * item.priceSen}
                              initial={{ scale: 1.15 }}
                              animate={{ scale: 1 }}
                              className="text-sm font-semibold"
                            >
                              {formatSenCompact(item.qty * item.priceSen)}
                            </motion.span>
                          </div>
                        </div>
                        <button
                          aria-label={`Remove ${item.productName}`}
                          className="text-brand-muted h-fit hover:text-brand-red"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <div className="border-t border-brand-ink/10 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-brand-muted text-sm">Subtotal</span>
                <span className="font-display text-lg">{formatSenCompact(total)}</span>
              </div>
              <Button href="/checkout" onClick={close} className="w-full" size="lg">
                Checkout
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
