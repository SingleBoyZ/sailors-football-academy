"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Anchor } from "lucide-react";
import { SplitText } from "@/components/motion/SplitText";
import { MEDIA } from "@/content/media";
import { SITE } from "@/content/site";

export function Hero() {
  return (
    // 100dvh minus the sticky header's height (h-28 in Nav.tsx) — otherwise
    // the header's own layout space pushes this section's bottom-anchored
    // content that far off the bottom of the viewport.
    <section className="relative h-[calc(100dvh-7rem)] min-h-[560px] overflow-hidden bg-brand-ink">
      <Image
        src={MEDIA.heroBackground}
        alt="Sailors Football Academy players celebrating a goal"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/30 to-brand-ink/10" />

      <motion.div
        className="stripe-diagonal pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 opacity-0 mix-blend-screen"
        initial={{ x: "-120%", opacity: 0 }}
        animate={{ x: "260%", opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
      />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <p className="font-display text-brand-red mb-4 text-sm tracking-[0.3em]">{SITE.hashtag}</p>
        <SplitText
          as="h1"
          text={SITE.name}
          triggerOnMount
          className="font-display text-brand-white text-[clamp(2rem,6.5vw,5rem)] leading-[0.95]"
        />
      </div>

      <div className="animate-bob absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-brand-white/80">
        <Anchor className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Scroll to explore</span>
      </div>
    </section>
  );
}
