import { cn } from "@/components/ui/cn";

export function StepProgress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col gap-1"
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-colors",
                done || active ? "bg-primary" : "bg-border-default",
              )}
            />
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
