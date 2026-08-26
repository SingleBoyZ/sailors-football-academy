import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/content/site";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Preloader } from "@/components/motion/Preloader";
import { RouteTransitionOverlay } from "@/components/motion/RouteTransitionOverlay";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-sand text-brand-ink">
        <AuthSessionProvider>
          <SmoothScroll />
          <Preloader />
          <RouteTransitionOverlay />
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
