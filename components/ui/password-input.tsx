"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { cn } from "./cn";
import { Field, controlClass } from "./field";
import { Icon } from "./icons";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  label: string;
  hint?: string;
  error?: string;
}

/** Password field with a show / hide toggle, so people can check what they typed (especially on a phone). */
export function PasswordInput({ label, hint, error, className, ...rest }: PasswordInputProps) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn(controlClass, "h-10 pe-11", className)}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? t("auth.password.hide") : t("auth.password.show")}
            aria-pressed={visible}
            className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
          >
            <Icon name={visible ? "eye-closed" : "eye"} size={18} />
          </button>
        </div>
      )}
    </Field>
  );
}
