"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { CLUB_TIMELINE } from "@/content/history";

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 40%"],
  });

  return (
    <div ref={containerRef} className="relative pl-10 sm:pl-14">
      <div className="bg-brand-ink/10 absolute top-0 bottom-0 left-3 w-px sm:left-5" aria-hidden="true">
        <motion.div
          className="bg-brand-red absolute inset-x-0 top-0 origin-top"
          style={{ scaleY: scrollYProgress, height: "100%" }}
        />
      </div>

      <div className="flex flex-col gap-16">
        {CLUB_TIMELINE.map((entry) => (
          <Reveal key={entry.year} className="relative">
            <span className="bg-brand-red border-brand-sand absolute -left-10 top-1 h-4 w-4 -translate-x-1/2 rounded-full border-4 sm:-left-14" />
            <span className="font-display text-brand-red text-sm tracking-[0.3em]">{entry.year}</span>
            <h3 className="font-display mt-1 text-2xl sm:text-3xl">{entry.heading}</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {entry.points.map((point) => (
                <li key={point} className="text-brand-muted flex gap-2 text-sm sm:text-base">
                  <span className="text-brand-red mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
