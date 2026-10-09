"use client";

import type { SkillTier } from "@/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "./cn";
import { Icon, type IconName } from "./icons";

export type SkillState = "neutral" | "matched" | "missing" | "extra";

const states: Record<SkillState, { className: string; icon: IconName | null }> = {
  neutral: { className: "bg-subtle text-text-primary", icon: null },
  matched: { className: "bg-match/10 text-match", icon: "check" },
  missing: { className: "bg-danger/10 text-danger", icon: "close" },
  extra: { className: "bg-subtle text-text-secondary", icon: "plus" },
};

/** A skill with an optional tier and a matched / missing / extra state. State is shown by icon and hidden text, not colour alone. */
export function SkillChip({
  label,
  tier,
  state = "neutral",
}: {
  label: string;
  tier?: SkillTier;
  state?: SkillState;
}) {
  const { t } = useLocale();
  const { className, icon } = states[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        className,
      )}
    >
      {icon && <Icon name={icon} variant="bold" size={14} />}
      {state !== "neutral" && <span className="sr-only">{t(`skill.${state}`)}:</span>}
      {label}
      {tier && <span className="font-normal opacity-70">· {t(`skill.${tier}`)}</span>}
    </span>
  );
}
