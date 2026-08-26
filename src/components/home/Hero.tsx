"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Anchor } from "lucide-react";
import { SplitText } from "@/components/motion/SplitText";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { MEDIA } from "@/content/media";
import { SITE } from "@/content/site";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let cleanup: (() => void) | undefined;

    // gsap is dynamically imported so it's code-split away from the main
    // bundle instead of loading on every page.
    import("@/lib/gsap").then(({ gsap, ScrollTrigger, syncGsapWithLenis }) => {
      if (!sectionRef.current || !imageWrapRef.current) return;
      const detach = syncGsapWithLenis();

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 1,
        animation: gsap.fromTo(
          imageWrapRef.current,
          { scale: 1.15 },
          { scale: 1, ease: "none" },
        ),
      });

      cleanup = () => {
        trigger.kill();
        detach();
      };
    });

    return () => cleanup?.();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-brand-ink">
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          src={MEDIA.heroCelebration}
          alt="Sailors Football Academy players celebrating a goal"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/30 to-brand-ink/10" />
      </div>

      <motion.div
        className="stripe-diagonal pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 opacity-0 mix-blend-screen"
        initial={{ x: "-120%", opacity: 0 }}
        animate={{ x: "260%", opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <p className="font-display mb-4 text-sm tracking-[0.3em] text-brand-red">{SITE.hashtag}</p>
        <SplitText
          as="h1"
          text="SET SAIL."
          triggerOnMount
          className="font-display text-brand-white text-[clamp(3rem,13vw,9rem)] leading-[0.92]"
        />
        <p className="mt-6 max-w-md text-lg text-brand-white/85 sm:text-xl">{SITE.tagline}</p>
      </div>

      <div className="animate-bob absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-brand-white/80">
        <Anchor className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Scroll to explore</span>
      </div>
    </section>
  );
}
