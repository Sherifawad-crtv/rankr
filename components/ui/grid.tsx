import type { HTMLAttributes } from "react";
import { cn } from "./cn";

/** Page layout grid: 4 columns on mobile, 12 from the lg breakpoint. Children set their own `col-span-*`. */
export function Grid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-4 gap-4 lg:grid-cols-12 lg:gap-6", className)} {...rest} />;
}
