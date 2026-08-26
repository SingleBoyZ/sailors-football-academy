import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { InstagramGlyph } from "@/components/ui/icons";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SITE, NAV_LINKS } from "@/content/site";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
] as const;

export function Footer() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE.location.mapQuery)}&output=embed`;

  return (
    <footer className="bg-brand-ink text-brand-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/crest.svg" alt={`${SITE.name} crest`} width={44} height={44} />
            <span className="font-display text-lg">{SITE.name}</span>
          </div>
          <p className="text-brand-white/70 max-w-xs text-sm">{SITE.tagline}</p>
          <p className="font-display text-brand-red-light text-sm">{SITE.hashtag}</p>
          <Button href={SITE.contact.whatsappHref} variant="outline" size="md" className="w-fit">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Us
          </Button>
        </div>

        <nav className="flex flex-col gap-3 lg:col-span-2" aria-label="Footer">
          <span className="text-brand-white/50 text-xs tracking-wide uppercase">Explore</span>
          {NAV_LINKS.map((link) => (
            <TransitionLink
              key={link.href}
              href={link.href}
              className="text-brand-white/80 hover:text-brand-red-light text-sm transition-colors"
            >
              {link.label}
            </TransitionLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <span className="text-brand-white/50 text-xs tracking-wide uppercase">Follow</span>
          <a
            href={SITE.contact.instagramClub.url}
            target="_blank"
            rel="noreferrer"
            className="text-brand-white/80 hover:text-brand-red-light flex items-center gap-2 text-sm transition-colors"
          >
            <InstagramGlyph className="h-4 w-4" /> {SITE.contact.instagramClub.handle}
          </a>
          <a
            href={SITE.contact.instagramAcademy.url}
            target="_blank"
            rel="noreferrer"
            className="text-brand-white/80 hover:text-brand-red-light flex items-center gap-2 text-sm transition-colors"
          >
            <InstagramGlyph className="h-4 w-4" /> {SITE.contact.instagramAcademy.handle}
          </a>
          <a
            href={SITE.contact.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="text-brand-white/80 hover:text-brand-red-light flex items-center gap-2 text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> {SITE.contact.whatsappDisplay}
          </a>
          <div className="mt-2 flex flex-col gap-1">
            {LEGAL_LINKS.map((link) => (
              <TransitionLink
                key={link.href}
                href={link.href}
                className="text-brand-white/50 hover:text-brand-red-light text-xs transition-colors"
              >
                {link.label}
              </TransitionLink>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <span className="text-brand-white/50 text-xs tracking-wide uppercase">
            {SITE.location.venue}
          </span>
          <p className="mt-1 mb-3 text-sm text-brand-white/80">{SITE.location.area}</p>
          <div className="h-48 w-full overflow-hidden border border-brand-white/10">
            <iframe
              src={mapSrc}
              title={`Map to ${SITE.location.venue}`}
              className="h-full w-full grayscale invert-[0.92]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Container>

      <div className="border-t border-brand-white/10 py-6">
        <Container className="text-brand-white/50 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {SITE.club} ({SITE.clubShort}). All rights reserved.
          </span>
          <span>{SITE.shortName} — {SITE.location.area}</span>
        </Container>
      </div>
    </footer>
  );
}
