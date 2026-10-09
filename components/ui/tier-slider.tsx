"use client";

import { useId } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { ENTERPRISE_CV_TIERS, type EnterpriseCvTier } from "@/types";
import { cn, focusRing } from "./cn";

interface TierSliderProps {
  value: EnterpriseCvTier;
  onChange: (tier: EnterpriseCvTier) => void;
}

/** Draggable 4-stop CV-capacity control (native range input, snapped to the tiers). */
export function TierSlider({ value, onChange }: TierSliderProps) {
  const id = useId();
  const { t } = useLocale();
  const index = ENTERPRISE_CV_TIERS.indexOf(value);
  const lastIndex = ENTERPRISE_CV_TIERS.length - 1;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {t("tier.label")}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={lastIndex}
        step={1}
        value={index}
        onChange={(event) => onChange(ENTERPRISE_CV_TIERS[Number(event.target.value)])}
        aria-valuetext={t("tier.valueText", { count: value })}
        className={cn("w-full accent-primary", focusRing)}
      />
      <div aria-hidden className="flex justify-between text-sm text-text-secondary">
        {ENTERPRISE_CV_TIERS.map((tier) => (
          <span key={tier} className={cn(tier === value && "font-medium text-primary")}>
            {tier}
          </span>
        ))}
      </div>
    </div>
  );
}
