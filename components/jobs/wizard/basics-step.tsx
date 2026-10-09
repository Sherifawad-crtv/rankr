"use client";

import { Input, Textarea } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import type { JobDraft } from "@/lib/job-draft";
import type { StepErrors } from "./steps";

interface StepProps {
  draft: JobDraft;
  update: (changes: Partial<JobDraft>) => void;
  errors: StepErrors;
}

export function BasicsStep({ draft, update, errors }: StepProps) {
  const { t } = useLocale();
  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("job.basics.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("job.basics.subtitle")}</p>
      </div>
      <Input
        label={t("job.basics.jobTitle")}
        placeholder={t("job.basics.jobTitlePlaceholder")}
        autoFocus
        value={draft.title}
        onChange={(event) => update({ title: event.target.value })}
        error={errors.title}
      />
      <Input
        label={t("job.basics.location")}
        placeholder={t("job.basics.locationPlaceholder")}
        autoComplete="off"
        value={draft.location}
        onChange={(event) => update({ location: event.target.value })}
        error={errors.location}
      />
      <Textarea
        label={t("job.basics.description")}
        hint={t("job.basics.descriptionHint")}
        value={draft.description}
        onChange={(event) => update({ description: event.target.value })}
      />
    </>
  );
}
