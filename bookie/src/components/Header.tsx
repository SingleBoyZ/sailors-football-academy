import { Sparkles } from "lucide-react";
import { siteConfig } from "../config/siteConfig";

interface HeaderProps {
  onGetStarted: () => void;
}

export function Header({ onGetStarted }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-gold-400">
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-navy-900">
              {siteConfig.companyName}
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">{siteConfig.eventTitle}</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#resources"
            className="hidden text-sm font-medium text-navy-700 transition-colors hover:text-navy-900 sm:block"
          >
            Event Resources
          </a>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:ring-offset-2"
          >
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}
