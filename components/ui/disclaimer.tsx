"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "./cn";
import { Icon } from "./icons";

/** The human-in-the-loop notice. Show it wherever scores appear. */
export function Disclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLocale();
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border-default bg-subtle text-sm text-text-secondary",
        compact ? "px-3 py-2 text-xs" : "p-4",
        className,
      )}
    >
      <Icon name="info" variant="bold" size={compact ? 16 : 18} className="mt-0.5 text-primary" />
      {t("disclaimer.scores")}
    </div>
  );
}
