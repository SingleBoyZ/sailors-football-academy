import type Lenis from "lenis";

/**
 * Module-level singleton so GSAP ScrollTrigger sections (lazy-loaded, code
 * split away from the main bundle) can sync to the same Lenis smooth-scroll
 * instance the root layout owns, without needing React context.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
