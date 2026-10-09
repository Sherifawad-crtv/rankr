import type { HTMLAttributes } from "react";
import { cn } from "./cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lifts on hover. Use for cards that are clickable or contain primary actions. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-surface p-6 shadow-sm",
        interactive &&
          "transition-all duration-200 ease-[var(--ease-soft)] hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      {...rest}
    />
  );
}
