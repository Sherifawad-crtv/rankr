"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { StepProgress } from "@/components/entry/step-progress";
import { Button, Card, Icon, StepTransition, useToast, type StepDirection } from "@/components/ui";
import { createJob, updateJob } from "@/lib/api";
import { useLocale } from "@/lib/i18n/locale-context";
import { draftToInput, type JobDraft } from "@/lib/job-draft";
import type { Skill } from "@/types";
import { BasicsStep } from "./basics-step";
import { FiltersStep } from "./filters-step";
import { RequirementsStep } from "./requirements-step";
import { ReviewStep } from "./review-step";
import { STEP_LABEL_KEYS, WIZARD_STEPS, type StepErrors, type WizardStep } from "./steps";
import { WeightsStep } from "./weights-step";

interface JobWizardProps {
  /** Set when editing an existing job. */
  jobId?: string;
  initial: JobDraft;
  catalogue: Skill[];
}

export function JobWizard({ jobId, initial, catalogue }: JobWizardProps) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLocale();
  const editing = jobId !== undefined;

  const [draft, setDraft] = useState<JobDraft>(initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [errors, setErrors] = useState<StepErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const step: WizardStep = WIZARD_STEPS[stepIndex];
  const last = stepIndex === WIZARD_STEPS.length - 1;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial]);

  // Warn before closing the tab with unsaved work. (In-app navigation is not guarded yet.)
  useEffect(() => {
    if (!dirty || saved) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, saved]);

  function update(changes: Partial<JobDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
    setErrors({});
  }

  function validate(target: WizardStep): StepErrors {
    const found: StepErrors = {};
    if (target === "basics") {
      if (draft.title.trim().length < 3) found.title = t("job.error.title");
      if (!draft.location.trim()) found.location = t("job.error.location");
    }
    if (target === "requirements" && !draft.skills.some((item) => item.tier === "required")) {
      found.requiredSkill = t("job.error.requiredSkill");
    }
    if (target === "filters" && draft.filterLocation && !draft.filterLocationValue.trim()) {
      found.filterLocation = t("job.error.filterLocation");
    }
    return found;
  }

  function goTo(index: number, travel: StepDirection) {
    setDirection(travel);
    setErrors({});
    setStepIndex(index);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (!last) return goTo(stepIndex + 1, "forward");

    setSaving(true);
    try {
      const input = draftToInput(draft);
      if (editing) {
        await updateJob(jobId, input);
        toast.show(t("job.toast.updated"), "match");
        setSaved(true);
        router.push("/jobs");
      } else {
        const job = await createJob(input);
        toast.show(t("job.toast.created"), "match");
        setSaved(true);
        router.push(`/jobs/${job.id}/upload`);
      }
    } catch {
      setErrors({ form: t("job.review.error") });
      setSaving(false);
    }
  }

  function editStep(target: WizardStep) {
    goTo(WIZARD_STEPS.indexOf(target), "back");
  }

  const submitLabel = last
    ? editing
      ? saving
        ? t("job.review.saving")
        : t("job.review.save")
      : saving
        ? t("job.review.creating")
        : t("job.review.create")
    : t("common.continue");

  return (
    <Card className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <p className="text-sm font-semibold text-text-secondary">
        {editing ? t("job.wizard.editTitle") : t("job.wizard.createTitle")}
      </p>
      <StepProgress
        steps={WIZARD_STEPS.map((item) => t(STEP_LABEL_KEYS[item]))}
        current={stepIndex}
        label={t("job.wizard.progress")}
      />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <StepTransition stepKey={step} direction={direction} className="flex flex-col gap-4">
          {step === "basics" && <BasicsStep draft={draft} update={update} errors={errors} />}
          {step === "requirements" && (
            <RequirementsStep draft={draft} update={update} errors={errors} catalogue={catalogue} />
          )}
          {step === "filters" && <FiltersStep draft={draft} update={update} errors={errors} />}
          {step === "weights" && <WeightsStep draft={draft} update={update} />}
          {step === "review" && <ReviewStep draft={draft} onEdit={editStep} error={errors.form} />}
        </StepTransition>

        <div className="flex items-center justify-between gap-3">
          {stepIndex > 0 ? (
            <Button variant="ghost" disabled={saving} onClick={() => goTo(stepIndex - 1, "back")}>
              <Icon name="chevron-right" size={16} mirrorRtl className="rotate-180 rtl:rotate-0" />
              {t("common.back")}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
