"use client";

import { ChoiceChips, NumberStepper } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import { isCustomSkill } from "@/lib/skills";
import type { JobDraft } from "@/lib/job-draft";
import { DEGREE_LEVELS, SKILL_TIERS, type DegreeLevel, type Skill, type SkillRef, type SkillTier } from "@/types";
import { SkillPicker } from "./skill-picker";
import type { StepErrors } from "./steps";

interface RequirementsStepProps {
  draft: JobDraft;
  update: (changes: Partial<JobDraft>) => void;
  errors: StepErrors;
  catalogue: Skill[];
}

export function RequirementsStep({ draft, update, errors, catalogue }: RequirementsStepProps) {
  const { t, l } = useLocale();
  const takenIds = new Set(draft.skills.map((item) => item.skill.id));

  function addSkill(skill: SkillRef, tier: SkillTier) {
    update({ skills: [...draft.skills, { skill, tier }] });
  }

  function removeSkill(id: string) {
    update({ skills: draft.skills.filter((item) => item.skill.id !== id) });
  }

  const degreeLabels = Object.fromEntries(DEGREE_LEVELS.map((level) => [t(`degree.${level}`), level]));

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("job.requirements.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("job.requirements.subtitle")}</p>
      </div>

      {SKILL_TIERS.map((tier) => {
        const items = draft.skills.filter((item) => item.tier === tier);
        const heading = t(`skill.${tier}`);
        return (
          <section
            key={tier}
            aria-label={heading}
            className="flex flex-col gap-3 rounded-lg border border-border-default p-4"
          >
            <div>
              <h2 className="text-base font-semibold text-text-primary">{heading}</h2>
              <p className="text-sm text-text-secondary">{t(`job.requirements.${tier}Hint`)}</p>
            </div>
            <SkillPicker
              label={heading}
              catalogue={catalogue}
              takenIds={takenIds}
              onAdd={(skill) => addSkill(skill, tier)}
            />
            {items.length === 0 ? (
              <p className="text-sm text-text-secondary">{t("job.requirements.empty")}</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <li key={item.skill.id} className="animate-pop">
                    <span className="inline-flex items-center gap-1 rounded-full bg-subtle py-1 ps-3 pe-1 text-sm font-semibold text-text-primary">
                      {l(item.skill.name)}
                      {isCustomSkill(item.skill.id) && (
                        <span className="rounded-full bg-warning/10 px-2 text-xs font-semibold text-warning">
                          {t("skillPicker.needsReview")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSkill(item.skill.id)}
                        aria-label={t("skillPicker.removeSkill", { name: l(item.skill.name) })}
                        className="flex size-6 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border-default hover:text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                      >
                        ×
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {tier === "required" && errors.requiredSkill && (
              <p role="alert" className="animate-fade-up text-sm text-danger">
                {errors.requiredSkill}
              </p>
            )}
          </section>
        );
      })}

      <div className="grid gap-6 sm:grid-cols-2">
        <NumberStepper
          label={t("job.requirements.experience")}
          value={draft.minExperienceYears}
          onChange={(value) => update({ minExperienceYears: value })}
          valueText={t("job.requirements.experienceValue", { years: draft.minExperienceYears })}
        />
        <ChoiceChips<string>
          label={t("job.requirements.degree")}
          options={DEGREE_LEVELS.map((level) => t(`degree.${level}`))}
          value={t(`degree.${draft.degreeLevel}`)}
          onChange={(label) => update({ degreeLevel: degreeLabels[label] as DegreeLevel })}
        />
      </div>
    </>
  );
}

