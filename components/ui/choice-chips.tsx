import { cn, focusRing } from "./cn";

interface ChoiceChipsProps<T extends string> {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  options: readonly T[];
  error?: string;
}

/** Wrapping single-choice chips (radio group). Nothing is selected until the user picks. */
export function ChoiceChips<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: ChoiceChipsProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-base transition-all duration-150 ease-[var(--ease-soft)] active:scale-95",
                focusRing,
                selected
                  ? "animate-pop border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border-default bg-surface text-text-secondary hover:border-primary hover:text-text-primary",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
