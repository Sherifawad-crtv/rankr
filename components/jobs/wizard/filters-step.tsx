"use client";

import { Icon, Input, Switch } from "@/components/ui";
import { degreeLabel } from "@/lib/hardfilters";
import { useLocale } from "@/lib/i18n/locale-context";
import type { JobDraft } from "@/lib/job-draft";
import type { StepErrors } from "./steps";

interface StepProps {
  draft: JobDraft;
  update: (changes: Partial<JobDraft>) => void;
  errors: StepErrors;
}

export function FiltersStep({ draft, update, errors }: StepProps) {
  const { t, locale } = useLocale();
  const hasRequired = draft.skills.some((item) => item.tier === "required");
  const hasDegree = draft.degreeLevel !== "none";

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("job.filters.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("job.filters.subtitle")}</p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border-default bg-subtle p-4 text-sm text-text-secondary">
        <Icon name="shield" variant="bold" size={20} className="mt-0.5 text-primary" />
        {t("job.filters.callout")}
      </div>

      <div className="flex flex-col divide-y divide-border-default rounded-lg border border-border-default px-4">
        <div className="py-4">
          <Switch
            checked={draft.filterRequiredSkills && hasRequired}
            onChange={(checked) => update({ filterRequiredSkills: checked })}
            disabled={!hasRequired}
            label={t("job.filters.requiredSkills")}
            description={hasRequired ? undefined : t("job.filters.requiredSkillsDisabled")}
          />
        </div>
        <div className="py-4">
          <Switch
            checked={draft.filterMinExperience && draft.minExperienceYears > 0}
            onChange={(checked) => update({ filterMinExperience: checked })}
            disabled={draft.minExperienceYears === 0}
            label={t("job.filters.minExperience")}
            description={t("job.filters.minExperienceDesc", { years: draft.minExperienceYears })}
          />
        </div>
        <div className="py-4">
          <Switch
            checked={draft.filterMinDegree && hasDegree}
            onChange={(checked) => update({ filterMinDegree: checked })}
            disabled={!hasDegree}
            label={t("job.filters.minDegree")}
            description={
              hasDegree
                ? t("job.filters.minDegreeDesc", { degree: degreeLabel(draft.degreeLevel, locale) })
                : t("job.filters.minDegreeDisabled")
            }
          />
        </div>
        <div className="flex flex-col gap-3 py-4">
          <Switch
            checked={draft.filterLocation}
            onChange={(checked) => update({ filterLocation: checked })}
            label={t("job.filters.location")}
          />
          {draft.filterLocation && (
            <div className="animate-fade-up">
              <Input
                label={t("job.filters.locationLabel")}
                value={draft.filterLocationValue}
                onChange={(event) => update({ filterLocationValue: event.target.value })}
                error={errors.filterLocation}
              />
            </div>
          )}
        </div>
        <div className="py-4">
          <Switch
            checked={draft.filterWorkAuthorization}
            onChange={(checked) => update({ filterWorkAuthorization: checked })}
            label={t("job.filters.workAuthorization")}
          />
        </div>
      </div>
    </>
  );
}
