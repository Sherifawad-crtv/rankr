import { Icon } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { useLocale } from "@/lib/i18n/locale-context";
import { PIPELINE_STAGES } from "@/lib/processing";

interface StageStepperProps {
  progress: number[];
  active: number;
}

/** Five-stage pipeline. Connectors fill as the batch moves through; the active stage pulses. */
export function StageStepper({ progress, active }: StageStepperProps) {
  const { t } = useLocale();
  return (
    <ol className="flex items-start" aria-label={t("processing.stagesAria")}>
      {PIPELINE_STAGES.map((stage, index) => {
        const complete = progress[index] >= 1;
        const current = index === active;
        return (
          <li
            key={stage.id}
            aria-current={current ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2"
          >
            {index > 0 && (
              <span
                aria-hidden
                className="absolute end-1/2 top-5 h-0.5 w-full overflow-hidden rounded-full bg-border-default"
              >
                <span
                  className="block h-full origin-left rounded-full bg-primary transition-transform duration-700 ease-[var(--ease-soft)] rtl:origin-right"
                  style={{ transform: `scaleX(${progress[index - 1]})` }}
                />
              </span>
            )}
            <span
              className={cn(
                "relative z-10 flex size-10 items-center justify-center rounded-full border-2 transition-all duration-500 ease-[var(--ease-soft)]",
                complete && "border-primary bg-primary text-primary-contrast",
                current && "animate-pulse-ring border-primary bg-surface text-primary",
                !complete && !current && "border-border-default bg-surface text-text-disabled",
              )}
            >
              <Icon
                name={complete ? "check" : stage.icon}
                variant={complete || current ? "bold" : "linear"}
                size={20}
                className={cn(current && "animate-bounce-soft")}
              />
            </span>
            <span
              className={cn(
                "text-center text-sm font-semibold transition-colors duration-300",
                current ? "text-text-primary" : "text-text-secondary",
                !current && "max-sm:hidden",
              )}
            >
              {t(`processing.stage.${stage.id}.label`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
