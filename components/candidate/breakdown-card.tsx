"use client";

import { Card } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import { SCORE_DIMENSIONS, type Candidate, type ScoreWeights } from "@/types";

/** The four scored dimensions: the candidate's score and how much each one counts for this job. */
export function BreakdownCard({ candidate, weights }: { candidate: Candidate; weights: ScoreWeights }) {
  const { t } = useLocale();
  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-text-primary">{t("detail.breakdown.title")}</h2>
      <ul className="flex flex-col gap-4">
        {SCORE_DIMENSIONS.map((dimension) => {
          const score = candidate.breakdown[dimension];
          return (
            <li key={dimension} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-base font-semibold text-text-primary">{t(`dimension.${dimension}`)}</span>
                <span className="text-sm text-text-secondary">
                  {t("detail.breakdown.weight", { weight: weights[dimension] })}
                </span>
              </div>
              <div
                role="meter"
                aria-label={t(`dimension.${dimension}`)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
                aria-valuetext={t("detail.breakdown.outOf", { score })}
                className="h-2.5 overflow-hidden rounded-full bg-subtle"
              >
                <div
                  className="h-full origin-left rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-soft)] rtl:origin-right"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="font-display text-sm font-bold text-text-primary">{score}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
