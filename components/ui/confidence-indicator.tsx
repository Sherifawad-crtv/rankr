"use client";

import type { ConfidenceLevel } from "@/lib/confidence";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "./cn";

const BARS: Record<ConfidenceLevel, number> = { low: 1, medium: 2, high: 3 };

const tone: Record<ConfidenceLevel, string> = {
  low: "text-warning",
  medium: "text-text-secondary",
  high: "text-match",
};

/**
 * Parse-confidence signal: three bars plus a label. Low confidence always shows its label,
 * so the flag is never colour-only.
 */
export function ConfidenceIndicator({
  level,
  showLabel = level === "low",
  className,
}: {
  level: ConfidenceLevel;
  showLabel?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const label = t(`confidence.${level}`);
  return (
    <span
      title={level === "low" ? t("confidence.lowHint") : label}
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", tone[level], className)}
    >
      <span aria-hidden className="flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-1 rounded-full",
              bar === 1 ? "h-2" : bar === 2 ? "h-3" : "h-4",
              bar <= BARS[level] ? "bg-current" : "bg-border-default",
            )}
          />
        ))}
      </span>
      {showLabel ? label : <span className="sr-only">{label}</span>}
    </span>
  );
}
