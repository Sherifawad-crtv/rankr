"use client";

import { Button } from "./button";
import { Icon } from "./icons";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Text shown for the current value, e.g. "3 years". */
  valueText: string;
}

/** Minus / value / plus control for small whole numbers. */
export function NumberStepper({ label, value, onChange, min = 0, max = 30, valueText }: NumberStepperProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <div className="inline-flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`${label}: -1`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Icon name="chevron-down" size={16} className="rotate-90 rtl:-rotate-90" />
        </Button>
        <span aria-live="polite" className="min-w-20 text-center font-display text-lg font-bold text-text-primary">
          {valueText}
        </span>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`${label}: +1`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Icon name="chevron-down" size={16} className="-rotate-90 rtl:rotate-90" />
        </Button>
      </div>
    </div>
  );
}
