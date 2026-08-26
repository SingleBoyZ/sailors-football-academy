"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PHASE_1, PHASE_2, type PhaseDetail } from "@/content/programmes";

const PHASES: { key: string; detail: PhaseDetail }[] = [
  { key: "phase1", detail: PHASE_1 },
  { key: "phase2", detail: PHASE_2 },
];

export function PhaseTabs() {
  const [active, setActive] = useState(0);
  const phase = PHASES[active].detail;

  return (
    <div>
      <div role="tablist" aria-label="Pathway phases" className="flex gap-2 border-b border-brand-ink/10">
        {PHASES.map((p, i) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "font-display relative px-6 py-4 text-lg transition-colors",
              active === i ? "text-brand-ink" : "text-brand-muted hover:text-brand-ink",
            )}
          >
            {p.detail.title}
            {active === i && (
              <motion.span
                layoutId="phase-tab-underline"
                className="bg-brand-red absolute inset-x-0 -bottom-px h-0.5"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="pt-10"
        >
          <span className="text-brand-red text-sm tracking-[0.3em] uppercase">{phase.timing}</span>
          <p className="text-brand-muted mt-3 max-w-2xl text-base">{phase.intro}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {phase.groups.map((group) => (
              <div key={group.label} className="bg-brand-sand border border-brand-ink/10 p-6">
                <h4 className="font-display text-xl">{group.label}</h4>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.points.map((point) => (
                    <li key={point} className="text-brand-muted flex gap-2 text-sm">
                      <span className="text-brand-red mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
