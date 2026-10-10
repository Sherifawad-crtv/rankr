"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Dialog, ErrorPanel, Icon, LoadingPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { listJobs } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";

/** The two things you do with a job: upload a batch of CVs to screen, or open it for applications. */
export type JobPurpose = "screen" | "collect";

const DESTINATION: Record<JobPurpose, (jobId: string) => string> = {
  screen: (jobId) => `/jobs/${jobId}/upload`,
  collect: (jobId) => `/jobs/${jobId}/applications`,
};

function JobChoices({ purpose, onClose }: { purpose: JobPurpose; onClose: () => void }) {
  const { t, tn } = useLocale();
  const load = useCallback(() => listJobs(), []);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("choose.loadError")} onRetry={retry} />;

  const jobs = state.data.filter((job) => job.status === "open");
  return (
    <div className="flex flex-col gap-4">
      {jobs.length === 0 ? (
        <p className="text-base text-text-secondary">{t("choose.empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-default rounded-lg border border-border-default">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={DESTINATION[purpose](job.id)}
                onClick={onClose}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-100 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-border-focus"
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-text-primary">{job.title}</span>
                  <span className="block text-sm text-text-secondary">
                    {job.location} · {tn("jobs.candidates", job.candidateCount)}
                  </span>
                </span>
                <Icon name="chevron-right" size={18} className="shrink-0 text-text-secondary rtl:rotate-180" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={`/jobs/new?then=${purpose}`}
        onClick={onClose}
        className={buttonClass("secondary", "md") + " self-start"}
      >
        <Icon name="plus" size={18} /> {t("choose.new")}
      </Link>
    </div>
  );
}

/** Asks which job before starting either flow, so both start from one clear question. */
export function JobPickerDialog({
  purpose,
  open,
  onClose,
}: {
  purpose: JobPurpose;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t(purpose === "screen" ? "choose.screen.title" : "choose.collect.title")}
    >
      {open && <JobChoices purpose={purpose} onClose={onClose} />}
    </Dialog>
  );
}
