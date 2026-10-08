import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn, focusRing } from "./cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label: ReactNode;
}

/** Unchecked by default unless `defaultChecked`/`checked` is passed. Used for the consent gate. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  const id = useId();
  return (
    <div className="flex items-start gap-2">
      <input
        id={id}
        type="checkbox"
        className={cn("mt-1 size-4 accent-primary", focusRing, className)}
        {...rest}
      />
      <label htmlFor={id} className="text-base text-text-primary">
        {label}
      </label>
    </div>
  );
}
