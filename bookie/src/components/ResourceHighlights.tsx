import { resources } from "../config/resources";

export function ResourceHighlights() {
  return (
    <section id="resources" className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            What You'll Get Access To
          </h2>
          <p className="mt-3 text-base text-slate-600">
            A curated set of resources built for exhibition visitors like you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map(({ title, description, icon: Icon }, index) => (
            <div
              key={title}
              className="group animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
