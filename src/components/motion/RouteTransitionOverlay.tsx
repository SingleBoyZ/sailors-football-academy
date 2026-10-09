"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRouteTransition, type TransitionPhase } from "@/store/route-transition";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { DURATION, EASE_IN_OUT } from "@/lib/motion";
import { CrestMark } from "./CrestMark";
import { CrackPanels, type CrackY } from "./CrackPanels";

const SAFETY_TIMEOUT_MS = 4500;

/** Right panel always exits up, left panel always exits down. */
function rightPanelY(phase: TransitionPhase): CrackY {
  return phase === "covering" || phase === "held" ? "0%" : "-100%";
}
function leftPanelY(phase: TransitionPhase): CrackY {
  return phase === "covering" || phase === "held" ? "0%" : "100%";
}

/**
 * Full-screen crack-open wipe played only when navigating back to the home
 * page (see TransitionLink) — every other internal link navigates normally.
 */
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

  // Reveal only once the new route has actually rendered AND the crack has
  // held for at least DURATION.crackHold, whichever finishes last.
  useEffect(() => {
    if (phase !== "held" || !targetHref) return;
    if (pathname !== targetHref.split(/[?#]/)[0]) return;

    const elapsed = performance.now() - (heldAt.current ?? performance.now());
    const remaining = Math.max(0, DURATION.crackHold * 1000 - elapsed);
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
  const exiting = phase === "revealing";

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{ pointerEvents: active ? "auto" : "none" }}
      aria-hidden={!active}
    >
      <CrackPanels
        rightY={rightPanelY(phase)}
        leftY={leftPanelY(phase)}
        transition={{
          duration: phase === "idle" ? 0 : exiting ? DURATION.crackPanelExit : DURATION.crackPanel,
          ease: EASE_IN_OUT,
        }}
        onRightAnimationComplete={() => {
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
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: phase === "held" ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <CrestMark className="h-16 w-16 text-brand-sand" animate={phase === "held"} />
      </motion.div>
    </div>
  );
}
