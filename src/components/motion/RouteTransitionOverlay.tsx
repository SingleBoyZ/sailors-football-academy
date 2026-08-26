"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRouteTransition, type TransitionPhase } from "@/store/route-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DURATION, EASE_IN_OUT } from "@/lib/motion";
import { CrestMark } from "./CrestMark";

const SAFETY_TIMEOUT_MS = 2500;

function panelY(phase: TransitionPhase): string {
  if (phase === "covering" || phase === "held") return "0%";
  if (phase === "revealing") return "-100%";
  return "100%";
}

/** Full-screen red curtain wipe played between route changes — see TransitionLink. */
export function RouteTransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { phase, targetHref, setPhase, reset } = useRouteTransition();
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldAt = useRef<number | null>(null);

  useEffect(() => {
    if (phase === "held") heldAt.current = performance.now();
  }, [phase]);

  // Reveal only once the new route has actually rendered AND the curtain
  // has held for at least DURATION.curtainHold, whichever finishes last.
  useEffect(() => {
    if (phase !== "held" || !targetHref) return;
    if (pathname !== targetHref.split(/[?#]/)[0]) return;

    const elapsed = performance.now() - (heldAt.current ?? performance.now());
    const remaining = Math.max(0, DURATION.curtainHold * 1000 - elapsed);
    const timer = setTimeout(() => setPhase("revealing"), remaining);
    return () => clearTimeout(timer);
  }, [pathname, phase, targetHref, setPhase]);

  useEffect(() => {
    if (phase === "idle") return;
    safetyTimer.current = setTimeout(() => reset(), SAFETY_TIMEOUT_MS);
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [phase, reset]);

  if (reducedMotion) {
    return (
      <AnimatePresence>
        {phase === "covering" && (
          <motion.div
            key="fade"
            className="fixed inset-0 z-[100] bg-brand-sand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
              router.push(targetHref!);
              setPhase("held");
              setTimeout(() => reset(), 200);
            }}
          />
        )}
      </AnimatePresence>
    );
  }

  const active = phase !== "idle";

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      <motion.div
        className="absolute inset-0 bg-brand-red"
        style={{ clipPath: "polygon(0 100%, 60% 100%, 100% 0, 0 0)" }}
        animate={{ y: panelY(phase) }}
        transition={{
          duration: phase === "idle" ? 0 : DURATION.curtainPanel,
          ease: EASE_IN_OUT,
        }}
        onAnimationComplete={() => {
          if (phase === "covering") {
            router.push(targetHref!);
            setPhase("held");
          }
          if (phase === "revealing") {
            reset();
          }
        }}
      />
      <motion.div
        className="absolute inset-0 bg-brand-ink"
        style={{ clipPath: "polygon(0 100%, 40% 100%, 80% 0, 0 0)" }}
        animate={{ y: panelY(phase) }}
        transition={{
          duration: phase === "idle" ? 0 : DURATION.curtainPanel,
          ease: EASE_IN_OUT,
          delay: phase === "covering" ? 0.08 : 0,
        }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: phase === "held" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <CrestMark className="h-16 w-16 text-brand-sand" animate={phase === "held"} />
      </motion.div>
    </div>
  );
}
