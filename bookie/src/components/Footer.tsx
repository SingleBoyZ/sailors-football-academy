import { siteConfig } from "../config/siteConfig";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold tracking-wide text-white">
            {siteConfig.companyName}
          </p>
          <p className="text-xs text-slate-400">
            © {siteConfig.year} {siteConfig.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
