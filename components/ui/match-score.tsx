import { cn } from "./cn";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, { box: string; text: string }> = {
  sm: { box: "size-10", text: "text-sm" },
  md: { box: "size-14", text: "text-base" },
  lg: { box: "size-24", text: "text-xl" },
};

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Match percentage as a ring. The colour is deliberately neutral (no red/green judgement);
 * pair it with the disclaimer wherever it is shown.
 */
export function MatchScore({ value, size = "md" }: { value: number; size?: Size }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={`Match score ${percent} percent`}
      className={cn("relative inline-flex shrink-0 items-center justify-center", sizes[size].box)}
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="22" cy="22" r={RADIUS} fill="none" strokeWidth="4" className="stroke-subtle" />
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-300 ease-[var(--ease-soft)]"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
        />
      </svg>
      <span className={cn("relative font-display font-bold text-text-primary", sizes[size].text)}>
        {percent}
        {size === "lg" && <span className="text-text-secondary">%</span>}
      </span>
    </span>
  );
}
