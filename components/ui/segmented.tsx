import { cn, focusRing } from "./cn";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

/** Equal-width segments with a pill that slides to the selected option. */
export function Segmented<T extends string>({ label, value, onChange, options }: SegmentedProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative inline-grid auto-cols-fr grid-flow-col rounded-full border border-border-default bg-surface p-1 [--dir:1] rtl:[--dir:-1]"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 start-1 rounded-full bg-primary shadow-sm transition-transform duration-200 ease-[var(--ease-soft)]"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(calc(${index} * 100% * var(--dir)))`,
        }}
      />
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
              "relative z-10 rounded-full px-5 py-1.5 text-base font-semibold transition-colors duration-200",
              focusRing,
              selected ? "text-primary-contrast" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
