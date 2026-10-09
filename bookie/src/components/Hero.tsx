import { ArrowRight, BadgePercent, BookOpen, FileText, Timer } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

interface HeroProps {
  onGetAccess: () => void;
}

export function Hero({ onGetAccess }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div className="animate-fade-in-up text-center lg:text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-gold-300 uppercase">
            {siteConfig.eventTitle}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Exclusive Event Resources
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300 lg:mx-0">
            Complete the quick form below to access our presentation slides, product
            resources, and exclusive exhibition materials.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onGetAccess}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-7 py-3.5 text-base font-semibold text-navy-950 shadow-card transition-all hover:bg-gold-400 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-2 focus:ring-offset-navy-900 sm:w-auto"
            >
              Get Access
              <ArrowRight
                className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <p className="flex items-center gap-1.5 text-sm text-slate-400">
              <Timer className="h-4 w-4 text-gold-400" aria-hidden="true" />
              Less than 45 seconds to complete
            </p>
          </div>
        </div>

        <div className="relative hidden animate-fade-in lg:block" aria-hidden="true">
          <div className="relative mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-sm">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400/70" />
              <span className="h-3 w-3 rounded-full bg-gold-400/70" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
            </div>

            <div className="space-y-3">
              <div className="h-3 w-3/4 rounded-full bg-white/20" />
              <div className="h-3 w-1/2 rounded-full bg-white/10" />
            </div>

            <div className="mt-6 space-y-3">
              {[
                { icon: FileText, label: "Product Catalog & Technical Specs" },
                { icon: BadgePercent, label: "Exhibition Exclusive Offer" },
                { icon: BookOpen, label: "Industry Case Studies & Solutions Guide" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-navy-800/90 px-4 py-3 shadow-xl backdrop-blur-sm">
            <p className="text-2xl font-bold text-gold-400">45s</p>
            <p className="text-xs text-slate-400">avg. completion time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
