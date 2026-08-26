import type { ButtonHTMLAttributes, ReactNode } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  primary: "bg-brand-ink text-brand-white [--fill:var(--color-brand-red)]",
  secondary:
    "bg-brand-white text-brand-ink border border-brand-ink [--fill:var(--color-brand-ink)] hover:text-brand-white",
  outline:
    "bg-transparent text-brand-white border border-brand-white [--fill:var(--color-brand-red)]",
} as const;

const SIZE_STYLES = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

type ButtonBaseProps = {
  children: ReactNode;
  variant?: keyof typeof VARIANT_STYLES;
  size?: keyof typeof SIZE_STYLES;
  className?: string;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  onClick?: () => void;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

function baseClasses(variant: keyof typeof VARIANT_STYLES, size: keyof typeof SIZE_STYLES, className?: string) {
  return cn(
    "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden font-display uppercase tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    className,
  );
}

const FILL_SPAN = (
  <span
    aria-hidden="true"
    className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[var(--fill)] transition-transform duration-300 ease-out group-hover:scale-x-100"
  />
);

/** Primary CTA button — red/ink fill slides in from the left on hover. Renders a Link when `href` is given. */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = "primary", size = "md", className } = props;
  const classes = baseClasses(variant, size, className);

  if ("href" in props) {
    return (
      <TransitionLink href={props.href} onClick={props.onClick} className={classes}>
        {FILL_SPAN}
        <span className="relative">{children}</span>
      </TransitionLink>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _children, ...buttonProps } = props;
  void _v;
  void _s;
  void _c;
  void _children;

  return (
    <button className={classes} {...buttonProps}>
      {FILL_SPAN}
      <span className="relative">{children}</span>
    </button>
  );
}
