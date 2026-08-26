"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { type AnchorHTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { useRouteTransition } from "@/store/route-transition";

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    children: ReactNode;
  };

/**
 * Drop-in replacement for next/link on internal navigation: plays the red
 * curtain wipe (see RouteTransitionOverlay) before/after the route changes.
 * External links, downloads, and modified clicks (cmd/ctrl/middle) fall
 * through to a plain navigation.
 */
export function TransitionLink({ href, children, onClick, ...rest }: TransitionLinkProps) {
  const pathname = usePathname();
  const startTransition = useRouteTransition((state) => state.startTransition);
  const targetPath = typeof href === "string" ? href : href.pathname ?? "";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (targetPath === pathname) return;

    event.preventDefault();
    startTransition(targetPath);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
