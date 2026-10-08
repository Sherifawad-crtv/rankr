import type { HTMLAttributes } from "react";
import { cn } from "./cn";

type Tone = "neutral" | "primary" | "match" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-text-secondary",
  primary: "bg-primary/10 text-primary",
  match: "bg-match/10 text-match",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
