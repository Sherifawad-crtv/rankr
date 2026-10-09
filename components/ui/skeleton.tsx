import { cn } from "./cn";

/** Shimmering placeholder block. Size it with width/height classes. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} />;
}
