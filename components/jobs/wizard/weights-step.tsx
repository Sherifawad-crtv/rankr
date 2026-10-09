"use client";

import { WeightPanel } from "@/components/ranking/weight-panel";
import { useLocale } from "@/lib/i18n/locale-context";
import type { JobDraft } from "@/lib/job-draft";
import { rebalanceWeights } from "@/lib/scoring";
import { DEFAULT_SCORE_WEIGHTS, type ScoreDimension } from "@/types";

interface StepProps {
  draft: JobDraft;
  update: (changes: Partial<JobDraft>) => void;
}

export function WeightsStep({ draft, update }: StepProps) {
  const { t } = useLocale();
  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("job.weights.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("job.weights.subtitle")}</p>
      </div>
      <WeightPanel
        weights={draft.weights}
        onChange={(dimension: ScoreDimension, value: number) =>
          update({ weights: rebalanceWeights(draft.weights, dimension, value) })
        }
        onReset={() => update({ weights: DEFAULT_SCORE_WEIGHTS })}
      />
    </>
  );
}
