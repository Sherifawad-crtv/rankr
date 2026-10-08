import { cn, focusRing } from "./cn";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

export function Segmented<T extends string>({ label, value, onChange, options }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-full border border-border-default bg-surface p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-base font-medium",
              focusRing,
              selected ? "bg-primary text-text-inverse" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
