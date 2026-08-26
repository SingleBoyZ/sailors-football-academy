"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis-instance";
import { useScrollVelocity } from "@/store/scroll-velocity";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Owns the single Lenis smooth-scroll instance for the whole app. GSAP
 * ScrollTrigger sections sync to it via lib/lenis-instance instead of their
 * own context, so this stays a no-UI logic component.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();
  const setVelocity = useScrollVelocity((state) => state.setVelocity);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenis);

    lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      setVelocity(Math.abs(velocity));
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      setLenis(null);
    };
  }, [reducedMotion, setVelocity]);

  return null;
}
