"use client";

import { useEffect, useRef } from "react";
import { useScrollVelocity } from "@/store/scroll-velocity";
import { cn } from "@/lib/utils";

const BASE_DURATION_S = 20;
const MIN_DURATION_S = 5;

type MarqueeProps = {
  text: string;
  className?: string;
};

/** Infinite red marquee band whose speed nudges up with Lenis scroll velocity. */
export function Marquee({ text, className }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return useScrollVelocity.subscribe((state) => {
      const track = trackRef.current;
      if (!track) return;
      const duration = Math.max(MIN_DURATION_S, BASE_DURATION_S - state.velocity * 1.5);
      track.style.animationDuration = `${duration}s`;
    });
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden bg-brand-red py-3 whitespace-nowrap",
        className,
      )}
      aria-hidden="true"
    >
      <div ref={trackRef} className="animate-marquee inline-flex w-max">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="font-display flex items-center gap-6 pr-6 text-2xl text-brand-white sm:text-3xl"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-6">
                {text}
                <span className="text-brand-ink">&bull;</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
