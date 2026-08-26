import { create } from "zustand";

type ScrollVelocityState = {
  velocity: number;
  setVelocity: (velocity: number) => void;
};

/** Absolute Lenis scroll velocity, read by the Marquee to nudge its speed. */
export const useScrollVelocity = create<ScrollVelocityState>((set) => ({
  velocity: 0,
  setVelocity: (velocity) => set({ velocity }),
}));
