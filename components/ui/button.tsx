import type { ButtonHTMLAttributes } from "react";
import { cn, focusRing } from "./cn";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-contrast hover:bg-primary-hover",
  secondary:
    "bg-surface text-text-primary border border-border-default hover:bg-subtle hover:border-text-disabled",
  ghost: "bg-transparent text-text-primary hover:bg-subtle",
  danger: "bg-danger text-text-inverse hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-100 ease-[var(--ease-soft)] disabled:cursor-not-allowed disabled:opacity-50";

/** Button styling for non-button elements such as links. */
export function buttonClass(variant: Variant = "primary", size: Size = "md"): string {
  return cn(base, focusRing, variants[variant], sizes[size]);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass(variant, size), className)}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
