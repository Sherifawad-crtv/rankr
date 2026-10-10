"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, ErrorPanel, LoadingPanel } from "@/components/ui";
import { getJob, listSkills } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { EMPTY_DRAFT, jobToDraft } from "@/lib/job-draft";
import { JobWizard } from "./job-wizard";

/** Loads the skills catalogue (and the job, when editing) and then shows the wizard. */
export function JobWizardLoader({ jobId }: { jobId?: string }) {
  const { t } = useLocale();
  const next = useSearchParams().get("then") === "collect" ? "collect" : "screen";
  const load = useCallback(
    () => Promise.all([listSkills(), jobId ? getJob(jobId) : Promise.resolve(null)]),
    [jobId],
  );
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message="We couldn't load the job form." onRetry={retry} />;

  const [catalogue, job] = state.data;
  if (jobId && !job) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-base text-text-primary">We couldn&apos;t find that job.</p>
        <Link href="/jobs" className="text-base font-semibold text-primary hover:underline">
          {t("nav.jobs")}
        </Link>
      </Card>
    );
  }

  return <JobWizard jobId={jobId} initial={job ? jobToDraft(job) : EMPTY_DRAFT} catalogue={catalogue} next={next} />;
}
