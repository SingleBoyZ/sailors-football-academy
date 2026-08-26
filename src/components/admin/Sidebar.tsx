"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CreditCard,
  Receipt,
  ShoppingBag,
  Package,
  Star,
  Settings,
} from "lucide-react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList, exact: false },
  { href: "/admin/players", label: "Players", icon: Users, exact: false },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, exact: false },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/success-stories", label: "Success Stories", icon: Star, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-brand-white sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-brand-ink/10">
      <div className="border-b border-brand-ink/10 px-5 py-5">
        <span className="font-display text-brand-red text-lg">Sailors Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <TransitionLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "border-brand-red bg-brand-red/5 text-brand-ink font-semibold"
                  : "text-brand-muted hover:text-brand-ink border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </TransitionLink>
          );
        })}
      </nav>
      <div className="border-t border-brand-ink/10 p-3">
        <TransitionLink href="/" className="text-brand-muted hover:text-brand-ink block px-3 py-2 text-xs">
          &larr; Back to site
        </TransitionLink>
      </div>
    </aside>
  );
}
