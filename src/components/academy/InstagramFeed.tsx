const REEL_URL = "https://www.instagram.com/reel/DVD-qEFAWS4/";

/** lucide-react dropped brand/social glyphs — the official Instagram camera mark, inlined. */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/**
 * A simple, self-contained card instead of Instagram's raw client-side
 * embed — that embed's fallback markup (account tags, "View more on
 * Instagram" link) rendered visibly overlapping the video frame whenever
 * embed.js hadn't finished swapping it for the real iframe yet, which
 * looked broken. This avoids that failure mode entirely.
 */
export function InstagramFeed() {
  return (
    <a
      href={REEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="border-brand-ink/10 hover:border-brand-red/40 group mt-10 flex items-center gap-4 border bg-white p-5 transition-colors"
    >
      <span className="bg-brand-red text-brand-white flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
        <InstagramGlyph className="h-6 w-6" />
      </span>
      <span>
        <span className="font-display text-brand-red-dark block text-sm tracking-[0.2em] uppercase">Follow Our Journey</span>
        <span className="text-brand-muted mt-1 block text-sm">See our latest moments on Instagram</span>
      </span>
    </a>
  );
}
