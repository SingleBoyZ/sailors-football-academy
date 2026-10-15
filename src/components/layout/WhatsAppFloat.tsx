import { WhatsAppGlyph } from "@/components/ui/icons";
import { SITE } from "@/content/site";

/** Fixed WhatsApp shortcut, always reachable from any public/portal page. */
export function WhatsAppFloat() {
  return (
    <a
      href={SITE.contact.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label={`Chat with ${SITE.shortName} on WhatsApp`}
      className="fixed right-5 bottom-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform hover:scale-105"
    >
      <WhatsAppGlyph className="h-7 w-7" />
    </a>
  );
}
