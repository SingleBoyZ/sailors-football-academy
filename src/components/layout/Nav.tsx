"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { signOutAction } from "@/lib/auth/actions";
import { useCart } from "@/store/cart";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { CartButton } from "@/components/cart/CartButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { HEADER_NAV_LINKS, NAV_LINKS, SITE, TRAINING_DROPDOWN_HREFS } from "@/content/site";
import { cn } from "@/lib/utils";

export type NavUser = { role: Role } | null;

// Sub-pages grouped under the header's "Training" dropdown — pulled from
// NAV_LINKS by href so the label stays single-sourced from site.ts.
const TRAINING_DROPDOWN_ITEMS = NAV_LINKS.filter((link) => TRAINING_DROPDOWN_HREFS.includes(link.href));

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

/** Desktop-only "Training" dropdown — groups Programmes and Full Fees and Schedule. */
function TrainingDropdown() {
  const pathname = usePathname();
  const active = TRAINING_DROPDOWN_ITEMS.some((item) => item.href === pathname);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div ref={containerRef} className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "group relative flex items-center gap-1 py-2 text-sm tracking-wide uppercase transition-colors",
          active ? "text-brand-white" : "text-brand-white/75 hover:text-brand-white",
        )}
      >
        Training
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        <span
          className={cn(
            "absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-brand-red transition-transform duration-300 group-hover:scale-x-100",
            active && "scale-x-100",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Training"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="border-brand-white/10 bg-brand-ink absolute top-full left-0 z-20 mt-3 min-w-60 border py-2 shadow-xl"
          >
            {TRAINING_DROPDOWN_ITEMS.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-brand-white/80 hover:bg-brand-white/5 hover:text-brand-white block px-4 py-2.5 text-sm tracking-wide uppercase transition-colors"
              >
                {item.label}
              </TransitionLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mobile-menu equivalent of TrainingDropdown — an inline expand/collapse disclosure. */
function TrainingDisclosure({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = TRAINING_DROPDOWN_ITEMS.some((item) => item.href === pathname);
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-brand-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "font-display flex w-full items-center justify-between py-4 text-3xl",
          active ? "text-brand-white" : "text-brand-white/90",
        )}
      >
        Training
        <ChevronDown className={cn("h-6 w-6 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 pb-4 pl-4">
              {TRAINING_DROPDOWN_ITEMS.map((item) => (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="text-brand-white/70 hover:text-brand-white py-2 text-lg"
                >
                  {item.label}
                </TransitionLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountLink({ user, className, onNavigate }: { user: NavUser; className?: string; onNavigate?: () => void }) {
  const href = user ? (user.role === "ADMIN" ? "/admin" : "/portal") : "/login";
  const label = user ? (user.role === "ADMIN" ? "Admin" : "Portal") : "Login / Sign Up";

  return (
    <TransitionLink href={href} onClick={onNavigate} className={className}>
      <User className="h-4 w-4" />
      {label}
    </TransitionLink>
  );
}

function SignOutButton({ user, className, onNavigate }: { user: NavUser; className?: string; onNavigate?: () => void }) {
  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.();
        // The server cart is kept (it belongs to the account), but the local
        // guest cart must not leak into the next browser session.
        useCart.getState().clear();
        void signOutAction();
      }}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}

// The flat header links (from site.ts), minus whatever now lives inside the
// Training dropdown (Programmes, Full Fees and Schedule) — rendered on
// either side of <TrainingDropdown />, which slots in right after Academy,
// the same spot Programmes used to sit.
const HEADER_FLAT_LINKS = HEADER_NAV_LINKS.filter((link) => !TRAINING_DROPDOWN_HREFS.includes(link.href));
const ACADEMY_INDEX = HEADER_FLAT_LINKS.findIndex((link) => link.href === "/academy");
const HEADER_NAV_BEFORE_TRAINING = HEADER_FLAT_LINKS.slice(0, ACADEMY_INDEX + 1);
const HEADER_NAV_AFTER_TRAINING = HEADER_FLAT_LINKS.slice(ACADEMY_INDEX + 1);

export function Nav({ user }: { user: NavUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[90] bg-brand-ink">
      <Container className="flex h-28 items-center justify-between gap-6 py-2">
        <TransitionLink href="/" className="flex shrink-0 items-center" onClick={() => setMobileOpen(false)}>
          <Image src="/brand/crest.svg" alt={`${SITE.name} crest`} width={96} height={96} priority />
        </TransitionLink>

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Primary">
          {HEADER_NAV_BEFORE_TRAINING.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <TrainingDropdown />
          {HEADER_NAV_AFTER_TRAINING.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <AccountLink user={user} className="hidden items-center gap-1.5 text-sm text-brand-white/75 hover:text-brand-white lg:flex" />
          <SignOutButton user={user} className="hidden items-center gap-1.5 text-sm text-brand-white/75 hover:text-brand-white lg:flex" />
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
              {HEADER_NAV_BEFORE_TRAINING.map((link) => (
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
                <TrainingDisclosure onNavigate={() => setMobileOpen(false)} />
              </StaggerItem>
              {HEADER_NAV_AFTER_TRAINING.map((link) => (
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
                  user={user}
                  className="text-brand-white/70 flex items-center gap-2 py-3 text-lg"
                  onNavigate={() => setMobileOpen(false)}
                />
              </StaggerItem>
              <StaggerItem>
                <SignOutButton
                  user={user}
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
