import type { CSSProperties } from "react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

const MAX_STAGGER = 10;

/** Sets the stagger index for `animate-stagger` items. Capped so long lists don't wait. */
export function stagger(index: number): CSSProperties {
  return { "--i": Math.min(index, MAX_STAGGER) } as CSSProperties;
}
