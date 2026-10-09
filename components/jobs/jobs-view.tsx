"use client";

import Link from "next/link";
import { Badge, Card, EmptyPanel, ErrorPanel, Icon, LoadingPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { listJobs } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/shell/page-header";
import { useLocale } from "@/lib/i18n/locale-context";
import { stagger } from "@/components/ui/cn";

export function JobsView() {
  const { state, retry } = useAsync(listJobs);
  const { t } = useLocale();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Jobs" description="Pick a job to upload CVs or review its ranked candidates." />
        <Link href="/jobs/new" className={buttonClass("primary", "md")}>
          <Icon name="plus" variant="bold" size={18} /> {t("job.new")}
        </Link>
      </div>
      {state.status === "loading" && <LoadingPanel label="Loading jobs…" />}
      {state.status === "error" && <ErrorPanel message="We couldn't load your jobs." onRetry={retry} />}
      {state.status === "ready" && state.data.length === 0 && (
        <EmptyPanel
          icon="briefcase"
          title="No jobs yet"
          description="Create your first job, then upload CVs to see them ranked."
          action={{ href: "/jobs/new", label: t("job.new") }}
        />
      )}
      {state.status === "ready" && state.data.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {state.data.map((job, index) => (
            <li key={job.id} className="animate-stagger" style={stagger(index)}>
              <Card interactive className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{job.title}</h2>
                    <p className="text-sm text-text-secondary">
                      {job.location} · {job.candidateCount} candidates
                    </p>
                  </div>
                  <Badge tone={job.status === "open" ? "match" : "neutral"}>{job.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/jobs/${job.id}/upload`} className={buttonClass("primary", "md")}>
                    <Icon name="upload" size={18} /> Upload CVs
                  </Link>
                  <Link href={`/jobs/${job.id}/candidates`} className={buttonClass("secondary", "md")}>
                    Ranked list
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
    </>
  );
}
