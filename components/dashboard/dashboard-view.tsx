"use client";

import Link from "next/link";
import { useCallback } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Card,
  EmptyPanel,
  ErrorPanel,
  Grid,
  Icon,
  LoadingPanel,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getDashboard } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useSession } from "@/lib/session";
import type { DashboardSummary } from "@/types";

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card className="col-span-2 flex flex-col gap-1 lg:col-span-3">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-xl font-medium text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{hint}</p>
    </Card>
  );
}

function CapacityCard({ plan }: { plan: DashboardSummary["plan"] }) {
  const capacity = plan.cvCapacity;
  return (
    <Card className="col-span-4 flex flex-col gap-3 lg:col-span-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-text-primary">CV capacity this cycle</h2>
        {/* TODO(spec): Solo capacity is OPEN */}
        <Badge tone="neutral">
          {capacity === null
            ? `${plan.cvUsed} used · capacity to be confirmed`
            : `${plan.cvUsed} of ${capacity} used`}
        </Badge>
      </div>
      {capacity !== null && (
        <>
          <div
            role="progressbar"
            aria-label="CV capacity used"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={plan.cvUsed}
            className="h-2 overflow-hidden rounded-full bg-subtle"
          >
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, (plan.cvUsed / capacity) * 100)}%` }}
            />
          </div>
          <p className="text-sm text-text-secondary">
            {Math.max(0, capacity - plan.cvUsed)} CVs left
            {plan.mode === "enterprise" ? ", shared across your team" : ""}.
          </p>
        </>
      )}
    </Card>
  );
}

export function DashboardView() {
  const { user } = useSession();
  const load = useCallback(() => getDashboard(user.planMode), [user.planMode]);
  const { state, retry } = useAsync(load);
  const firstName = user.name.split(" ")[0];

  if (state.status === "loading") return <LoadingPanel label="Loading your dashboard…" />;
  if (state.status === "error") {
    return <ErrorPanel message="We couldn't load your dashboard." onRetry={retry} />;
  }

  const summary = state.data;
  const openJobs = summary.jobs.filter((job) => job.status === "open");

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here's where your hiring stands." />

      {summary.jobs.length === 0 ? (
        <EmptyPanel
          title="No jobs yet"
          description="Create a job, then upload CVs to see them ranked."
          action={{ href: "/jobs", label: "Go to jobs" }}
        />
      ) : (
        <Grid>
          <Stat label="Open jobs" value={openJobs.length} hint="Accepting candidates" />
          <Stat label="Candidates" value={summary.totalCandidates} hint="Across all jobs" />
          <Stat
            label="Needs a closer look"
            value={summary.needsReviewCount}
            hint="Low-confidence CVs to check by hand"
          />
          <Stat
            label="Filtered out"
            value={summary.filteredOutCount}
            hint="Didn't meet a required filter"
          />

          <CapacityCard plan={summary.plan} />

          <Card className="col-span-4 flex flex-col gap-4 lg:col-span-7">
            <h2 className="text-lg font-medium text-text-primary">Your jobs</h2>
            <ul className="flex flex-col">
              {summary.jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default py-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-text-primary">{job.title}</p>
                    <p className="text-sm text-text-secondary">
                      {job.location} · {job.candidateCount} candidates
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.id}/upload`} className={buttonClass("secondary", "sm")}>
                      <Icon name="upload" size={16} /> Upload
                    </Link>
                    <Link href={`/jobs/${job.id}/candidates`} className={buttonClass("ghost", "sm")}>
                      Ranked list
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="col-span-4 flex flex-col gap-4 lg:col-span-5">
            <h2 className="text-lg font-medium text-text-primary">Recently added candidates</h2>
            {summary.recentCandidates.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No candidates yet. Upload a batch of CVs to get started.
              </p>
            ) : (
              <ul className="flex flex-col">
                {summary.recentCandidates.map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default py-3 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base text-text-primary">{candidate.fullName}</p>
                      <p className="truncate text-sm text-text-secondary">{candidate.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {candidate.lowConfidence && <Badge tone="warning">Low confidence</Badge>}
                      <Badge>{candidate.stage}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Grid>
      )}
    </>
  );
}
