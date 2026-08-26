import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/lib/lenis-instance";

let registered = false;

/**
 * Registers ScrollTrigger once and syncs it to the shared Lenis instance.
 * Call from a GSAP section's mount effect; it's idempotent and cheap to
 * call from multiple components. Sections that use this should be
 * dynamic-imported (ssr: false) so gsap stays out of the main bundle.
 */
export function syncGsapWithLenis() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }

  const lenis = getLenis();
  const onScroll = () => ScrollTrigger.update();
  lenis?.on("scroll", onScroll);
  ScrollTrigger.refresh();

  return () => {
    lenis?.off("scroll", onScroll);
  };
}

export { gsap, ScrollTrigger };
