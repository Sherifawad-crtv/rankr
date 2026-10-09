"use client";

import type { ProcessingStatus, ProcessingStep } from "@/types";
import { useLocale } from "@/lib/i18n/locale-context";
import { Badge } from "./badge";
import { Spinner } from "./spinner";

const tones: Record<ProcessingStatus, "neutral" | "primary" | "match" | "danger"> = {
  pending: "neutral",
  processing: "primary",
  done: "match",
  failed: "danger",
};

/** Processing status for a CV. While processing it shows the current step with a spinner. */
export function StatusPill({
  status,
  step,
  duplicate = false,
}: {
  status: ProcessingStatus;
  step?: ProcessingStep | null;
  duplicate?: boolean;
}) {
  const { t } = useLocale();
  if (duplicate) return <Badge>{t("status.duplicate")}</Badge>;
  if (status === "processing") {
    return (
      <Badge tone="primary" className="gap-1.5">
        <Spinner className="size-3" /> {step ? t(`step.${step}`) : t("status.processing")}
      </Badge>
    );
  }
  return <Badge tone={tones[status]}>{t(`status.${status}`)}</Badge>;
}
