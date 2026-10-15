"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

/**
 * Runs on every navigation (Next.js remounts template.tsx per route). Gives
 * each page's content a small settle-in once the curtain (see
 * RouteTransitionOverlay) has revealed it — the curtain owns the big
 * cross-page motion, this just keeps the content itself from popping in flat.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }}
    >
      {children}
    </motion.div>
  );
}
