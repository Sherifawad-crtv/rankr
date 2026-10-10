import type { HTMLAttributes } from "react";
import { cn } from "./cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Subtle hover state. Only for cards that are themselves a link or button. */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-surface p-6 shadow-sm",
        interactive &&
          "transition-colors duration-100 hover:border-text-disabled hover:bg-subtle/50",
        className,
      )}
      {...rest}
    />
  );
}
