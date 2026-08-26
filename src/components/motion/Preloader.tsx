"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SESSION_PRELOADER_KEY, EASE_REVEAL, EASE_IN_OUT } from "@/lib/motion";
import { CrestMark } from "./CrestMark";

type Phase = "hidden" | "intro" | "closing" | "done";

const TAGLINE = "TOGETHER WE SAIL";

/** First-visit-only intro: crest draws in, tagline staggers up, curtain opens. */
export function Preloader() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    let alreadyShown = true;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_PRELOADER_KEY) === "1";
      if (!alreadyShown) sessionStorage.setItem(SESSION_PRELOADER_KEY, "1");
    } catch {
      // sessionStorage unavailable (private mode / disabled) — skip preloader, don't block render.
      alreadyShown = true;
    }

    if (alreadyShown) return;
    if (reducedMotion) {
      setPhase("done");
      return;
    }

    setPhase("intro");
    const closeTimer = setTimeout(() => setPhase("closing"), 1900);
    const doneTimer = setTimeout(() => setPhase("done"), 1900 + 700);
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

  return (
    <div className="fixed inset-0 z-[200]" aria-hidden="true">
      <motion.div
        className="absolute inset-0 bg-brand-ink"
        style={{ clipPath: "polygon(0 100%, 40% 100%, 80% 0, 0 0)" }}
        animate={{ y: closing ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE_IN_OUT }}
      />
      <motion.div
        className="absolute inset-0 bg-brand-red"
        style={{ clipPath: "polygon(0 100%, 60% 100%, 100% 0, 0 0)" }}
        animate={{ y: closing ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE_IN_OUT, delay: closing ? 0.08 : 0 }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.3 }}
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
                  delay: 0.9 + i * 0.03,
                }}
              >
                {char === " " ? " " : char}
              </motion.span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
