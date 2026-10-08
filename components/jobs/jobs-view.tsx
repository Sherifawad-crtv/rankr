"use client";

import Link from "next/link";
import { Badge, Card, EmptyPanel, ErrorPanel, Icon, LoadingPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { listJobs } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { PageHeader } from "@/components/shell/page-header";

export function JobsView() {
  const { state, retry } = useAsync(listJobs);

  return (
    <>
      <PageHeader title="Jobs" description="Pick a job to upload CVs or review its ranked candidates." />
      {state.status === "loading" && <LoadingPanel label="Loading jobs…" />}
      {state.status === "error" && <ErrorPanel message="We couldn't load your jobs." onRetry={retry} />}
      {state.status === "ready" && state.data.length === 0 && (
        <EmptyPanel title="No jobs yet" description="Job creation is coming soon." />
      )}
      {state.status === "ready" && state.data.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {state.data.map((job) => (
            <li key={job.id}>
              <Card className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">{job.title}</h2>
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
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
