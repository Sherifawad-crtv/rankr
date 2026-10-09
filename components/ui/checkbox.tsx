import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn, focusRing } from "./cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label: ReactNode;
}

/** Unchecked by default unless `defaultChecked`/`checked` is passed. Used for the consent gate. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <span className="relative mt-0.5 inline-flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-md border-2 border-border-default bg-surface transition-all duration-150 ease-[var(--ease-soft)] checked:border-primary checked:bg-primary hover:border-primary active:scale-90",
            focusRing,
            className,
          )}
          {...rest}
        />
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute inset-0 m-auto size-3.5 scale-0 text-text-inverse transition-transform duration-200 ease-[var(--ease-spring)] peer-checked:scale-100"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <label htmlFor={id} className="cursor-pointer text-base text-text-primary">
        {label}
      </label>
    </div>
  );
}
