import { useId, type ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label + hint + error wrapper. Wires ids so inputs stay accessible. */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  const message = error ?? hint;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      {children({ id, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message && (
        <p id={messageId} className={error ? "animate-fade-up text-sm text-danger" : "text-sm text-text-secondary"}>
          {message}
        </p>
      )}
    </div>
  );
}

export const controlClass =
  "w-full rounded-md border border-border-default bg-surface px-3 text-base text-text-primary placeholder:text-text-disabled focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-border-focus disabled:bg-subtle disabled:text-text-disabled aria-[invalid=true]:border-danger transition-colors duration-150 hover:border-text-disabled";
