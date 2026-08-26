"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Reveal } from "@/components/motion/Reveal";
import { PATHWAY_STEPS } from "@/content/programmes";

function PanelContent({ step }: { step: (typeof PATHWAY_STEPS)[number] }) {
  return (
    <div className="flex h-full flex-col justify-center gap-6 px-8 sm:px-16 lg:px-24">
      <span className="font-display text-brand-red/25 text-[clamp(8rem,22vw,16rem)] leading-none">
        {String(step.step).padStart(2, "0")}
      </span>
      <div className="-mt-16 sm:-mt-24">
        <span className="text-brand-red text-sm tracking-[0.3em] uppercase">{step.ageRange}</span>
        <h3 className="font-display mt-2 text-4xl text-brand-white sm:text-6xl">{step.label}</h3>
        <p className="text-brand-white/70 mt-4 max-w-md text-base sm:text-lg">{step.description}</p>
      </div>
    </div>
  );
}

export function HorizontalPathway() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let cleanup: (() => void) | undefined;

    import("@/lib/gsap").then(({ gsap, syncGsapWithLenis }) => {
      const container = containerRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      if (!container || !track || !progress) return;

      const detach = syncGsapWithLenis();
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(progress, { scaleX: self.progress });
          },
        },
      });

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        detach();
      };
    });

    return () => cleanup?.();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="bg-brand-ink flex flex-col divide-y divide-white/10">
        {PATHWAY_STEPS.map((step) => (
          <Reveal key={step.step} className="py-4">
            <PanelContent step={step} />
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-brand-ink relative h-[100dvh] overflow-hidden">
      <div ref={trackRef} className="flex h-full w-max will-change-transform">
        {PATHWAY_STEPS.map((step) => (
          <div key={step.step} className="h-full w-screen shrink-0">
            <PanelContent step={step} />
          </div>
        ))}
      </div>
      <div className="absolute right-0 bottom-10 left-0 px-8 sm:px-16 lg:px-24">
        <div className="h-px w-full bg-white/15">
          <div ref={progressRef} className="bg-brand-red h-full w-full origin-left scale-x-0" />
        </div>
      </div>
    </div>
  );
}
