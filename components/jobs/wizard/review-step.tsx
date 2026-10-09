"use client";

import { Button, SkillChip } from "@/components/ui";
import { degreeLabel, describeHardFilter } from "@/lib/hardfilters";
import { useLocale } from "@/lib/i18n/locale-context";
import { draftHardFilters, type JobDraft } from "@/lib/job-draft";
import { SCORE_DIMENSIONS, SKILL_TIERS } from "@/types";
import type { ReactNode } from "react";
import type { WizardStep } from "./steps";

interface ReviewStepProps {
  draft: JobDraft;
  onEdit: (step: WizardStep) => void;
  error?: string;
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border-default p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          {t("common.edit")}
        </Button>
      </div>
      {children}
    </section>
  );
}

export function ReviewStep({ draft, onEdit, error }: ReviewStepProps) {
  const { t, l, locale } = useLocale();
  const filters = draftHardFilters(draft);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("job.review.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("job.review.subtitle")}</p>
      </div>

      <Section title={t("job.review.basics")} onEdit={() => onEdit("basics")}>
        <p className="text-base font-semibold text-text-primary">{draft.title}</p>
        <p className="text-sm text-text-secondary">{draft.location}</p>
        {draft.description && <p className="text-base text-text-primary">{draft.description}</p>}
      </Section>

      <Section title={t("job.review.skills")} onEdit={() => onEdit("requirements")}>
        {SKILL_TIERS.map((tier) => {
          const items = draft.skills.filter((item) => item.tier === tier);
          if (items.length === 0) return null;
          return (
            <div key={tier} className="flex flex-col gap-1">
              <p className="text-sm font-medium text-text-secondary">{t(`skill.${tier}`)}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <SkillChip key={item.skill.id} label={l(item.skill.name)} />
                ))}
              </div>
            </div>
          );
        })}
        <p className="text-sm text-text-secondary">
          {t("job.requirements.experienceValue", { years: draft.minExperienceYears })} ·{" "}
          {degreeLabel(draft.degreeLevel, locale)}
        </p>
      </Section>

      <Section title={t("job.review.filters")} onEdit={() => onEdit("filters")}>
        {filters.length === 0 ? (
          <p className="text-base text-text-secondary">{t("job.review.noFilters")}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {filters.map((filter) => (
              <li key={filter.id} className="text-base text-text-primary">
                {describeHardFilter(filter, locale)}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t("job.review.weights")} onEdit={() => onEdit("weights")}>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCORE_DIMENSIONS.map((dimension) => (
            <li key={dimension} className="text-sm text-text-secondary">
              {t(`dimension.${dimension}`)}{" "}
              <span className="font-display font-bold text-text-primary">{draft.weights[dimension]}%</span>
            </li>
          ))}
        </ul>
      </Section>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </>
  );
}
