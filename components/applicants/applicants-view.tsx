"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Button,
  ConfidenceIndicator,
  DataTable,
  Disclaimer,
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
  MatchScore,
  type Column,
} from "@/components/ui";
import { listApplicants } from "@/lib/api";
import {
  filterApplicantsExceptStage,
  NO_FILTERS,
  type ApplicantFilters,
  type StageFilter,
} from "@/lib/applicants";
import { candidateConfidence } from "@/lib/confidence";
import { useAsync } from "@/lib/hooks/use-async";
import { formatDate } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Applicant, CandidateStage } from "@/types";
import { ApplicantFilterBar } from "./applicant-filters";

const STAGE_SORT: Record<CandidateStage, number> = { new: 0, shortlisted: 1, hired: 2, rejected: 3 };
const CONFIDENCE_SORT = { low: 0, medium: 1, high: 2 } as const;

function ApplicantsList({ applicants }: { applicants: Applicant[] }) {
  const { t, tn, locale } = useLocale();
  const [filters, setFilters] = useState<ApplicantFilters>(NO_FILTERS);

  const jobs = useMemo(
    () => [...new Map(applicants.map((row) => [row.jobId, { id: row.jobId, title: row.jobTitle }])).values()],
    [applicants],
  );
  const beforeStage = useMemo(() => filterApplicantsExceptStage(applicants, filters), [applicants, filters]);
  const visible = useMemo(
    () => beforeStage.filter((row) => filters.stage === "all" || row.candidate.stage === filters.stage),
    [beforeStage, filters.stage],
  );
  const stageCounts = useMemo<Record<StageFilter, number>>(
    () => ({
      all: beforeStage.length,
      new: beforeStage.filter((row) => row.candidate.stage === "new").length,
      shortlisted: beforeStage.filter((row) => row.candidate.stage === "shortlisted").length,
      rejected: beforeStage.filter((row) => row.candidate.stage === "rejected").length,
      hired: beforeStage.filter((row) => row.candidate.stage === "hired").length,
    }),
    [beforeStage],
  );

  const columns: Column<Applicant>[] = [
    {
      id: "applicant",
      header: t("applicants.col.applicant"),
      sortValue: (row) => row.candidate.cv.fullName.toLowerCase(),
      cell: (row) => (
        <div className="flex min-w-48 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href={`/jobs/${row.jobId}/candidates/${row.candidate.id}`}
              className="text-base font-semibold text-text-primary hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
            >
              {row.candidate.cv.fullName}
            </Link>
            {row.candidate.cv.fullNameAr && (
              <span lang="ar" dir="rtl" className="text-sm text-text-secondary">
                {row.candidate.cv.fullNameAr}
              </span>
            )}
          </div>
          <span className="text-sm text-text-secondary">{row.candidate.cv.email}</span>
          {row.candidate.filteredOut && (
            <Badge tone="danger" className="self-start">
              {t("applicants.filteredOut", { reason: row.candidate.filteredOut.reason })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "job",
      header: t("applicants.col.job"),
      sortValue: (row) => row.jobTitle.toLowerCase(),
      cell: (row) => (
        <Link
          href={`/jobs/${row.jobId}/candidates`}
          className="text-base text-text-primary hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
        >
          {row.jobTitle}
        </Link>
      ),
    },
    {
      id: "source",
      header: t("applicants.col.source"),
      sortValue: (row) => row.candidate.source,
      cell: (row) => (
        <Badge tone={row.candidate.source === "application" ? "primary" : "neutral"}>
          {t(`source.${row.candidate.source}`)}
        </Badge>
      ),
    },
    {
      id: "match",
      header: t("applicants.col.match"),
      sortValue: (row) => row.matchPercent,
      cell: (row) => <MatchScore value={row.matchPercent} />,
    },
    {
      id: "confidence",
      header: t("applicants.col.confidence"),
      sortValue: (row) => CONFIDENCE_SORT[candidateConfidence(row.candidate)],
      cell: (row) => {
        const level = candidateConfidence(row.candidate);
        return <ConfidenceIndicator level={level} showLabel={level !== "high"} />;
      },
    },
    {
      id: "stage",
      header: t("applicants.col.stage"),
      sortValue: (row) => STAGE_SORT[row.candidate.stage],
      cell: (row) => (
        <Badge tone={row.candidate.stage === "shortlisted" || row.candidate.stage === "hired" ? "match" : "neutral"}>
          {t(`stage.${row.candidate.stage}`)}
        </Badge>
      ),
    },
    {
      id: "added",
      header: t("applicants.col.added"),
      sortValue: (row) => row.addedAt,
      cell: (row) => formatDate(locale, row.addedAt),
    },
  ];

  return (
    <>
      <ApplicantFilterBar filters={filters} onChange={setFilters} jobs={jobs} stageCounts={stageCounts} />
      <Disclaimer compact />
      <section aria-labelledby="applicants-heading" className="flex flex-col gap-3">
        <h2 id="applicants-heading" className="text-lg font-semibold text-text-primary" aria-live="polite">
          {tn("applicants.results", visible.length)}
        </h2>
        <DataTable
          columns={columns}
          rows={visible}
          getRowId={(row) => row.candidate.id}
          defaultSort={{ columnId: "added", direction: "desc" }}
          emptyMessage={
            <span className="flex flex-col items-center gap-2 py-4">
              {t("applicants.noMatch")}
              <Button variant="secondary" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                {t("applicants.filter.clear")}
              </Button>
            </span>
          }
        />
      </section>
    </>
  );
}

export function ApplicantsView() {
  const { t } = useLocale();
  const load = useCallback(() => listApplicants(), []);
  const { state, retry } = useAsync(load);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("applicants.title")} description={t("applicants.subtitle")} />
      {state.status === "loading" ? (
        <LoadingPanel label={t("applicants.loading")} />
      ) : state.status === "error" ? (
        <ErrorPanel message={t("applicants.loadError")} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyPanel
          icon="users"
          title={t("applicants.empty.title")}
          description={t("applicants.empty.body")}
          action={{ href: "/jobs", label: t("applicants.empty.action") }}
        />
      ) : (
        <ApplicantsList applicants={state.data} />
      )}
    </div>
  );
}
