"use client";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  text: string;
  className?: string;
};

/**
 * Infinite red marquee band — a pure CSS keyframe loop (see --animate-marquee
 * in globals.css) at one fixed, constant speed. Deliberately has no JS
 * animation loop and no scroll/wheel listeners of any kind: page scrolling
 * must never affect this animation's speed.
 */
export function Marquee({ text, className }: MarqueeProps) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-brand-red py-3 whitespace-nowrap",
        className,
      )}
      aria-hidden="true"
    >
      <div className="animate-marquee inline-flex w-max">
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
