import { CheckCircle2, Download, Lock, RotateCcw } from "lucide-react";
import { resources } from "../config/resources";

interface SuccessScreenProps {
  fullName: string;
  onReset: () => void;
}

export function SuccessScreen({ fullName, onReset }: SuccessScreenProps) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="animate-scale-in inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-11 w-11" aria-hidden="true" />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          Thank You{firstName !== "there" ? `, ${firstName}` : ""}!
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          Thank you for visiting our booth! Your submission has been recorded successfully.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-700 shadow-card">
          <Download className="h-4 w-4 text-gold-600" aria-hidden="true" />
          Your lead submission PDF has been downloaded automatically.
        </div>

        <div className="mt-14 text-left">
          <h3 className="text-center text-lg font-semibold text-navy-900">Your Resources</h3>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(({ title, description, icon: Icon, url }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h4 className="text-base font-semibold text-navy-900">{title}</h4>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
                <button
                  type="button"
                  disabled={url === null}
                  className="mt-5 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500 disabled:cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Resource Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-14 inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Submit Another Response
        </button>
      </div>
    </section>
  );
}
