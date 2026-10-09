import { useId, type ReactNode } from "react";
import { cn, focusRing } from "./cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

/** On/off setting. The whole row is the control; the thumb slides (and mirrors in RTL). */
export function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className={cn("text-base font-semibold text-text-primary", disabled && "opacity-60")}>
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm text-text-secondary">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          focusRing,
          checked ? "bg-primary" : "bg-border-default",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute start-0.5 top-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform duration-300 ease-[var(--ease-spring)]",
            checked && "translate-x-5 rtl:-translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
