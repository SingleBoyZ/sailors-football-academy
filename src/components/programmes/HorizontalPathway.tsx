"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Reveal } from "@/components/motion/Reveal";
import { PATHWAY_STEPS } from "@/content/programmes";
import { MEDIA } from "@/content/media";

// Each photo's own aspect ratio (from its real pixel dimensions), so its
// frame is shaped to fit that photo exactly — object-contain then shows the
// whole image with no cropping and no letterboxing, rather than forcing
// every slide into one fixed frame shape (which shows the whole image only)
const PANELS = [
  { image: MEDIA.pathway1, ratio: "1080/902" },
  { image: MEDIA.pathway2, ratio: "1080/715" },
  { image: MEDIA.pathway3, ratio: "1080/1072" },
  { image: MEDIA.pathway4, ratio: "1018/1080" },
  { image: MEDIA.pathway5, ratio: "1179/1275" },
] as const;
const STEP_COUNT = PATHWAY_STEPS.length;

/**
 * One slide's content — an editorial two-column composition (number, title,
 * description on the left; a framed photo on the right). Used both by the
 * pinned horizontal track below and by the reduced-motion stacked fallback,
 * so the two stay visually identical and there's only one layout to
 * maintain. Pure grid/flex flow throughout — no negative margins, so the
 * number and title can never collide at any screen width or copy length.
 */
function PanelContent({ step, image, ratio }: { step: (typeof PATHWAY_STEPS)[number]; image: string; ratio: string }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-16">
      <div className="grid gap-5 lg:col-span-5">
        <span className="font-display text-brand-red text-[clamp(3.25rem,6vw,5.5rem)] leading-none">
          {String(step.step).padStart(2, "0")}
        </span>
        <span className="bg-brand-red h-1 w-12" aria-hidden="true" />
        <div className="grid gap-3">
          <span className="text-brand-red-light text-sm tracking-[0.3em] uppercase">{step.ageRange}</span>
          <h3 className="font-display text-4xl text-brand-white sm:text-5xl lg:text-6xl">{step.label}</h3>
        </div>
        <p className="text-brand-white/70 max-w-md text-base leading-relaxed sm:text-lg">{step.description}</p>
      </div>

      <div className="lg:col-span-7">
        <div className="group relative mx-auto max-w-xl lg:mx-0 lg:max-w-none">
          <div
            className="border-brand-red/30 absolute -top-3 -right-3 bottom-3 left-3 border sm:-top-4 sm:-right-4 sm:bottom-4 sm:left-4"
            aria-hidden="true"
          />
          {/* Framed to this photo's own aspect ratio, so the whole image shows with no cropping. */}
          <div
            className="border-brand-white/15 relative w-full overflow-hidden border bg-black shadow-2xl shadow-black/50"
            style={{ aspectRatio: ratio }}
          >
            <Image
              src={image}
              alt={`${step.label} programme`}
              fill
              // Every slide is loaded eagerly rather than lazily — this section
              // is entirely scroll-driven (the user can reach any slide within
              // a second or two of scrolling in), so a lazy-loaded slide could
              // still be decoding when it slides into view, reading as the
              // scroll having "stuck" even though the scroll position itself
              // was advancing correctly the whole time.
              priority
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
            <span className="bg-brand-red absolute top-0 left-0 h-10 w-1.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HorizontalPathway() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    // React (in dev, under StrictMode) mounts every effect twice —
    // mount → cleanup → mount again — to surface exactly this kind of bug.
    // Since the real setup only happens after the dynamic import resolves,
    // the *first* mount's cleanup can fire before its import settles, when
    // `cleanup` is still unset; without this guard that phantom pin/tween
    // never gets killed and a second one stacks on top of it, doubling the
    // scroll distance the pinned section eats and leaving a dead, blank
    // stretch where the page is effectively unscrollable.
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("@/lib/gsap").then(({ gsap, syncGsapWithLenis }) => {
      if (cancelled) return;
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
          // `true`, not a number — a numeric scrub adds its own independent
          // catch-up easing on top of Lenis's already-smoothed scroll
          // position (see SmoothScroll.tsx's lerp). Stacking two smoothing
          // layers means the track visibly lags behind real scroll input
          // and never fully catches up between short scroll bursts, which
          // reads as the scroll "getting stuck" partway through the strip
          // (worst right around the middle slides). `true` maps the track
          // directly to Lenis's already-smooth position with no added lag.
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(progress, { scaleX: self.progress });
            if (counterRef.current) {
              const activeIndex = Math.min(STEP_COUNT - 1, Math.round(self.progress * (STEP_COUNT - 1)));
              counterRef.current.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(STEP_COUNT).padStart(2, "0")}`;
            }
          },
        },
      });

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        detach();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="bg-brand-ink flex flex-col divide-y divide-white/10 py-16 sm:py-20">
        {PATHWAY_STEPS.map((step, i) => (
          <Reveal key={step.step} className="py-12 first:pt-0 last:pb-0">
            <PanelContent step={step} image={PANELS[i].image} ratio={PANELS[i].ratio} />
          </Reveal>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-brand-ink relative h-[100dvh] overflow-hidden">
      <div ref={trackRef} className="flex h-full w-max will-change-transform">
        {PATHWAY_STEPS.map((step, i) => (
          <div key={step.step} className="flex h-full w-screen shrink-0 items-center">
            <PanelContent step={step} image={PANELS[i].image} ratio={PANELS[i].ratio} />
          </div>
        ))}
      </div>

      <div className="absolute right-0 bottom-8 left-0 px-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-5">
          <span ref={counterRef} className="text-brand-white/60 font-display shrink-0 text-xs tracking-[0.2em]">
            01 / {String(STEP_COUNT).padStart(2, "0")}
          </span>
          <div className="relative h-px w-full bg-white/15">
            <div ref={progressRef} className="bg-brand-red h-full w-full origin-left scale-x-0" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
              {PATHWAY_STEPS.map((step) => (
                <span key={step.step} className="bg-brand-ink h-1.5 w-1.5 rounded-full ring-1 ring-white/40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
