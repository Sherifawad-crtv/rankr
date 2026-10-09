import type { ReactNode } from "react";

export type StepDirection = "forward" | "back";

/** Remounts on `stepKey` change so the new step slides in from the direction of travel. */
export function StepTransition({
  stepKey,
  direction,
  children,
  className,
}: {
  stepKey: string | number;
  direction: StepDirection;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      key={stepKey}
      className={`${direction === "forward" ? "animate-step-forward" : "animate-step-back"} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
