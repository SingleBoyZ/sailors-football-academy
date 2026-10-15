import { create } from "zustand";

export type TransitionPhase = "idle" | "covering" | "held" | "revealing";

type RouteTransitionState = {
  phase: TransitionPhase;
  targetHref: string | null;
  startTransition: (href: string) => void;
  setPhase: (phase: TransitionPhase) => void;
  reset: () => void;
};

/**
 * Drives the red curtain wipe between pages. TransitionLink starts it on
 * click; RouteTransitionOverlay owns the actual animation + router.push and
 * advances the phase as each stage completes.
 */
export const useRouteTransition = create<RouteTransitionState>((set) => ({
  phase: "idle",
  targetHref: null,
  startTransition: (href) => set({ phase: "covering", targetHref: href }),
  setPhase: (phase) => set({ phase }),
  reset: () => set({ phase: "idle", targetHref: null }),
}));
