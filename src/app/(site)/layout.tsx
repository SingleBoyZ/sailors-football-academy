import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Preloader } from "@/components/motion/Preloader";
import { RouteTransitionOverlay } from "@/components/motion/RouteTransitionOverlay";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartSync } from "@/components/cart/CartSync";
import { auth } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <>
      <SmoothScroll />
      <Preloader />
      <RouteTransitionOverlay />
      <Nav user={session?.user ?? null} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <CartSync signedIn={!!session} />
      <WhatsAppFloat />
    </>
  );
}
