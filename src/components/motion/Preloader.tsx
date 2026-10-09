"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DURATION, EASE_REVEAL, EASE_IN_OUT } from "@/lib/motion";
import { CrestMark } from "./CrestMark";
import { CrackPanels, type CrackY } from "./CrackPanels";

type Phase = "hidden" | "intro" | "closing" | "done";

const TAGLINE = "TOGETHER WE SAIL";

// Total runtime: crackPanel (in) + crackHold + crackPanelExit = 2.5s.
const HOLD_MS = (DURATION.crackPanel + DURATION.crackHold) * 1000;
const DONE_MS = HOLD_MS + DURATION.crackPanelExit * 1000;

/** Plays on every full page load/reload — the screen cracks shut, holds on the crest, then cracks open (right up, left down). */
export function Preloader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    if (reducedMotion) {
      setPhase("done");
      return;
    }

    setPhase("intro");
    const closeTimer = setTimeout(() => setPhase("closing"), HOLD_MS);
    const doneTimer = setTimeout(() => setPhase("done"), DONE_MS);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(doneTimer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.style.overflow = phase === "intro" || phase === "closing" ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  if (phase === "hidden" || phase === "done") return null;

  const closing = phase === "closing";
  const rightY: CrackY = closing ? "-100%" : "0%";
  const leftY: CrackY = closing ? "100%" : "0%";

  return (
    <div className="fixed inset-0 z-[200]" aria-hidden="true">
      <CrackPanels
        rightY={rightY}
        leftY={leftY}
        transition={{
          duration: closing ? DURATION.crackPanelExit : DURATION.crackPanel,
          ease: EASE_IN_OUT,
        }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.3, delay: closing ? 0 : DURATION.crackPanel * 0.6 }}
      >
        <CrestMark className="h-24 w-24 text-brand-sand" />
        <div className="flex overflow-hidden">
          {TAGLINE.split("").map((char, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                className="font-display inline-block text-2xl text-brand-sand sm:text-4xl"
                initial={{ y: "120%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 0.6,
                  ease: EASE_REVEAL,
                  delay: DURATION.crackPanel + 0.2 + i * 0.025,
                }}
              >
                {char === " " ? " " : char}
              </motion.span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
