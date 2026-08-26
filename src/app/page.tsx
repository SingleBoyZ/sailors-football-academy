import { SITE } from "@/content/site";

export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-display text-brand-red text-sm">{SITE.hashtag}</p>
      <h1 className="font-display text-5xl">{SITE.name}</h1>
      <p className="text-brand-muted max-w-md">{SITE.tagline}</p>
    </div>
  );
}
