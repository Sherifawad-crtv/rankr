"use client";

import { cn } from "@/components/ui/cn";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Plan } from "@/types";

const NEAR_LIMIT = 0.8;

/** CV usage against capacity. Turns amber near the limit and red once it is used up. */
export function CapacityMeter({ plan }: { plan: Plan }) {
  const { t, tn } = useLocale();
  const capacity = plan.cvCapacity;
  if (capacity === null) return null;

  const share = plan.cvUsed / capacity;
  return (
    <>
      <div
        role="progressbar"
        aria-label={t("upload.capacity.aria")}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={plan.cvUsed}
        className="h-2 overflow-hidden rounded-full bg-subtle"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-[var(--ease-soft)]",
            share >= 1 ? "bg-danger" : share >= NEAR_LIMIT ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${Math.min(100, share * 100)}%` }}
        />
      </div>
      <p className={cn("text-sm", share >= NEAR_LIMIT ? "text-warning" : "text-text-secondary")}>
        {share >= 1
          ? t("billing.usage.over")
          : share >= NEAR_LIMIT
            ? t("billing.usage.near")
            : tn(
                plan.mode === "enterprise" ? "dashboard.capacity.leftShared" : "dashboard.capacity.left",
                capacity - plan.cvUsed,
              )}
      </p>
    </>
  );
}
