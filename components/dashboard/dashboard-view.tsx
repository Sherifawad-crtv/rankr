"use client";

import Link from "next/link";
import { useCallback } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  AnimatedNumber,
  Badge,
  Card,
  ErrorPanel,
  Grid,
  Icon,
  LoadingPanel,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { cn, stagger } from "@/components/ui/cn";
import { getDashboard } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";
import type { DashboardSummary } from "@/types";
import { CapacityMeter } from "@/components/billing/capacity-meter";
import { OnboardingChecklist } from "./onboarding-checklist";
import { RecentRunsCard } from "./recent-runs-card";
import { RunningBanner } from "./running-banner";
import { TopMatches } from "./top-matches";

function Stat({
  label,
  value,
  hint,
  index,
}: {
  label: string;
  value: number;
  hint: string;
  index: number;
}) {
  return (
    <Card
      interactive
      className="animate-stagger col-span-2 flex flex-col gap-1 lg:col-span-3"
      style={stagger(index)}
    >
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="font-display text-xl font-bold text-text-primary">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-sm text-text-secondary">{hint}</p>
    </Card>
  );
}

function CapacityCard({ plan }: { plan: DashboardSummary["plan"] }) {
  const { t } = useLocale();
  const { user } = useSession();
  const capacity = plan.cvCapacity;
  return (
    <Card className="animate-stagger col-span-4 flex flex-col gap-3 lg:col-span-12" style={stagger(4)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{t("upload.capacity.title")}</h2>
        {/* TODO(spec): Solo capacity is OPEN */}
        <Badge tone="neutral">
          {capacity === null
            ? t("upload.capacity.unknown", { used: plan.cvUsed })
            : t("upload.capacity.used", { used: plan.cvUsed, capacity })}
        </Badge>
      </div>
      <CapacityMeter plan={plan} />
      {user.role !== "recruiter" && (
        <Link href="/settings/billing" className="self-start text-base font-semibold text-primary hover:underline">
          {t("billing.manage")}
        </Link>
      )}
    </Card>
  );
}

function JobsCard({ jobs, className }: { jobs: DashboardSummary["jobs"]; className: string }) {
  const { t, tn } = useLocale();
  return (
    <Card className={cn("animate-stagger flex flex-col gap-4", className)} style={stagger(5)}>
      <h2 className="text-lg font-semibold text-text-primary">{t("dashboard.jobs.title")}</h2>
      <ul className="flex flex-col">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default py-3 first:border-t-0 first:pt-0"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text-primary">{job.title}</p>
              <p className="text-sm text-text-secondary">
                {job.location} · {tn("jobs.candidates", job.candidateCount)} ·{" "}
                {t("jobs.shortlisted", { count: job.shortlistedCount })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/jobs/${job.id}/upload`} className={buttonClass("secondary", "sm")}>
                <Icon name="upload" size={16} /> {t("dashboard.jobs.upload")}
              </Link>
              <Link href={`/jobs/${job.id}/candidates`} className={buttonClass("ghost", "sm")}>
                {t("jobs.ranked")}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DashboardView() {
  const { user } = useSession();
  const { t } = useLocale();
  const load = useCallback(() => getDashboard(user.planMode), [user.planMode]);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("dashboard.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("dashboard.error")} onRetry={retry} />;

  const summary = state.data;
  const openJobs = summary.jobs.filter((job) => job.status === "open");
  const firstJobId = summary.jobs[0]?.id ?? null;
  const hasJobs = summary.jobs.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={t("dashboard.welcome", { name: user.name.split(" ")[0] })}
          description={t("dashboard.subtitle")}
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs" className={buttonClass("secondary", "md")}>
            <Icon name="upload" size={18} /> {t("dashboard.uploadCvs")}
          </Link>
          <Link href="/jobs/new" className={buttonClass("primary", "md")}>
            <Icon name="plus" variant="bold" size={18} /> {t("job.new")}
          </Link>
        </div>
      </div>

      <RunningBanner runs={summary.recentRuns} />

      <OnboardingChecklist
        hasJob={hasJobs}
        hasRun={summary.recentRuns.length > 0}
        hasShortlist={summary.shortlistedCount > 0}
        firstJobId={firstJobId}
      />

      {hasJobs && (
        <>
          <TopMatches matches={summary.topMatches} />

          <Grid>
            <Stat
              label={t("dashboard.stat.openJobs")}
              value={openJobs.length}
              hint={t("dashboard.stat.openJobsHint")}
              index={0}
            />
            <Stat
              label={t("dashboard.stat.candidates")}
              value={summary.totalCandidates}
              hint={t("dashboard.stat.candidatesHint")}
              index={1}
            />
            <Stat
              label={t("dashboard.stat.shortlisted")}
              value={summary.shortlistedCount}
              hint={t("dashboard.stat.shortlistedHint")}
              index={2}
            />
            <Stat
              label={t("dashboard.stat.review")}
              value={summary.needsReviewCount}
              hint={t("dashboard.stat.reviewHint")}
              index={3}
            />

            <CapacityCard plan={summary.plan} />
            <JobsCard jobs={summary.jobs} className="col-span-4 lg:col-span-7" />
            <RecentRunsCard runs={summary.recentRuns} className="col-span-4 lg:col-span-5" />
          </Grid>
        </>
      )}
    </div>
  );
}
