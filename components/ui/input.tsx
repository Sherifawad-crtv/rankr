import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { Field, controlClass } from "./field";

interface FieldExtras {
  label: string;
  hint?: string;
  error?: string;
}

export function Input({
  label,
  hint,
  error,
  className,
  ...rest
}: FieldExtras & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClass, "h-10", className)}
          {...rest}
        />
      )}
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  ...rest
}: FieldExtras & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClass, "min-h-24 py-2", className)}
          {...rest}
        />
      )}
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: FieldExtras & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={cn(controlClass, "h-10", className)}
          {...rest}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
