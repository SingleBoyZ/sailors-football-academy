"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, User, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { CartButton } from "@/components/cart/CartButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { NAV_LINKS, SITE } from "@/content/site";
import { cn } from "@/lib/utils";

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <TransitionLink
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative py-2 text-sm tracking-wide uppercase transition-colors",
        active ? "text-brand-white" : "text-brand-white/75 hover:text-brand-white",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100",
          active && "scale-x-100",
        )}
      />
    </TransitionLink>
  );
}

function AccountLink({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { data: session } = useSession();
  const href = session ? (session.user.role === "ADMIN" ? "/admin" : "/portal") : "/login";
  const label = session ? (session.user.role === "ADMIN" ? "Admin" : "Portal") : "Login";

  return (
    <TransitionLink href={href} onClick={onNavigate} className={className}>
      <User className="h-4 w-4" />
      {label}
    </TransitionLink>
  );
}

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[90] bg-brand-ink">
      <Container className="flex h-18 items-center justify-between py-3">
        <TransitionLink href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <Image src="/brand/crest.svg" alt={`${SITE.name} crest`} width={40} height={40} priority />
          <span className="font-display hidden text-lg leading-none text-brand-white sm:block">
            Sailors
            <br />
            Football Academy
          </span>
        </TransitionLink>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <AccountLink className="hidden items-center gap-1.5 text-sm text-brand-white/75 hover:text-brand-white lg:flex" />
          <CartButton />
          <Button href="/enrol" size="md" className="hidden sm:inline-flex">
            Enrol Now
          </Button>
          <button
            type="button"
            className="p-2 text-brand-white lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col bg-brand-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Container className="flex h-18 items-center justify-between py-3">
              <span className="font-display text-lg text-brand-white">Menu</span>
              <button
                type="button"
                className="p-2 text-brand-white"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </Container>
            <Stagger as="div" className="flex flex-1 flex-col justify-center gap-2 px-8" gap="tight">
              {NAV_LINKS.map((link) => (
                <StaggerItem key={link.href}>
                  <TransitionLink
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display block border-b border-brand-white/10 py-4 text-3xl text-brand-white"
                  >
                    {link.label}
                  </TransitionLink>
                </StaggerItem>
              ))}
              <StaggerItem>
                <AccountLink
                  className="text-brand-white/70 flex items-center gap-2 py-3 text-lg"
                  onNavigate={() => setMobileOpen(false)}
                />
              </StaggerItem>
              <StaggerItem>
                <Button href="/enrol" size="lg" className="mt-2 w-full" onClick={() => setMobileOpen(false)}>
                  Enrol Now
                </Button>
              </StaggerItem>
            </Stagger>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
