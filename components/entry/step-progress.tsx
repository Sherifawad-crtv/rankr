import { cn } from "@/components/ui/cn";

export function StepProgress({
  steps,
  current,
  label = "Progress",
}: {
  steps: string[];
  current: number;
  label?: string;
}) {
  return (
    <ol className="flex items-center gap-2" aria-label={label}>
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col gap-1"
          >
            <span className="h-1.5 overflow-hidden rounded-full bg-border-default">
              <span
                className={cn(
                  "block h-full origin-left rounded-full bg-primary transition-transform duration-300 ease-[var(--ease-soft)] rtl:origin-right",
                  done || active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
            <span
              className={cn(
                "text-sm",
                active ? "font-medium text-text-primary" : "text-text-secondary",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
