"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "./cn";
import { Icon } from "./icons";

/** The human-in-the-loop notice. Show it wherever scores appear. */
export function Disclaimer({ className }: { className?: string }) {
  const { t } = useLocale();
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border-default bg-subtle p-4 text-sm text-text-secondary",
        className,
      )}
    >
      <Icon name="info" variant="bold" size={18} className="mt-0.5 text-primary" />
      {t("disclaimer.scores")}
    </div>
  );
}
