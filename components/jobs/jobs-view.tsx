"use client";

import Link from "next/link";
import { RunningBanner } from "@/components/dashboard/running-banner";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card, EmptyPanel, ErrorPanel, Icon, LoadingPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { stagger } from "@/components/ui/cn";
import { listJobs, listRuns } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";

const load = () => Promise.all([listJobs(), listRuns()]);

export function JobsView() {
  const { state, retry } = useAsync(load);
  const { t, tn } = useLocale();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={t("jobs.title")} description={t("jobs.subtitle")} />
        <Link href="/jobs/new" className={buttonClass("primary", "md")}>
          <Icon name="plus" variant="bold" size={18} /> {t("job.new")}
        </Link>
      </div>
      {state.status === "loading" && <LoadingPanel label={t("jobs.loading")} />}
      {state.status === "error" && <ErrorPanel message={t("jobs.error")} onRetry={retry} />}
      {state.status === "ready" && (
        <div className="flex flex-col gap-4">
          <RunningBanner runs={state.data[1]} />
          {state.data[0].length === 0 ? (
            <EmptyPanel
              icon="briefcase"
              title={t("jobs.empty.title")}
              description={t("jobs.empty.body")}
              action={{ href: "/jobs/new", label: t("job.new") }}
            />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {state.data[0].map((job, index) => (
                <li key={job.id} className="animate-stagger" style={stagger(index)}>
                  <Card interactive className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-text-primary">{job.title}</h2>
                        <p className="text-sm text-text-secondary">
                          {job.location} · {tn("jobs.candidates", job.candidateCount)}
                        </p>
                      </div>
                      <Badge tone={job.status === "open" ? "match" : "neutral"}>
                        {t(`jobstatus.${job.status}`)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/jobs/${job.id}/upload`} className={buttonClass("primary", "md")}>
                        <Icon name="upload" size={18} /> {t("jobs.upload")}
                      </Link>
                      <Link href={`/jobs/${job.id}/candidates`} className={buttonClass("secondary", "md")}>
                        {t("jobs.ranked")}
                      </Link>
                      <Link href={`/jobs/${job.id}/edit`} className={buttonClass("ghost", "md")}>
                        <Icon name="edit" size={18} /> {t("common.edit")}
                      </Link>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
