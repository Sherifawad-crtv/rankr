"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Button,
  Card,
  ConfidenceIndicator,
  ConfirmDialog,
  DataTable,
  EmptyPanel,
  ErrorPanel,
  Icon,
  LoadingPanel,
  MatchScore,
  useToast,
  type Column,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getJob, listCandidates, setCandidateStage } from "@/lib/api";
import { track } from "@/lib/analytics";
import { candidateConfidence } from "@/lib/confidence";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { matchScore, rankCandidates, rebalanceWeights } from "@/lib/scoring";
import {
  DEFAULT_SCORE_WEIGHTS,
  SCORE_DIMENSIONS,
  type Candidate,
  type CandidateStage,
  type ScoreDimension,
  type ScoreWeights,
} from "@/types";
import { CandidateCell } from "./candidate-cell";
import { ExportDialog } from "./export-dialog";
import { RunRatingCard } from "./run-rating-card";
import { RankedToolbar, type StageFilter } from "./ranked-toolbar";
import { WeightPanel } from "./weight-panel";

const STAGE_SORT: Record<CandidateStage, number> = { new: 0, shortlisted: 1, hired: 2, rejected: 3 };
const CONFIDENCE_SORT = { low: 0, medium: 1, high: 2 } as const;

function matchesQuery(candidate: Candidate, query: string, localise: (c: Candidate) => string[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return localise(candidate).some((text) => text.toLowerCase().includes(needle));
}

export function RankedView({ jobId }: { jobId: string }) {
  const { t, tn, l } = useLocale();
  const toast = useToast();
  const load = useCallback(() => Promise.all([getJob(jobId), listCandidates(jobId)]), [jobId]);
  const { state, retry } = useAsync(load);

  // null means "use the job's saved weights"; a value is a temporary what-if for this visit.
  const [customWeights, setCustomWeights] = useState<ScoreWeights | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, CandidateStage>>({});
  const [acting, setActing] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const jobWeights = state.status === "ready" ? (state.data[0]?.weights ?? DEFAULT_SCORE_WEIGHTS) : DEFAULT_SCORE_WEIGHTS;
  const weights = customWeights ?? jobWeights;
  const loaded = state.status === "ready" ? state.data[1] : null;
  const candidates = useMemo(
    () => (loaded ?? []).map((c) => (overrides[c.id] ? { ...c, stage: overrides[c.id] } : c)),
    [loaded, overrides],
  );

  const { ranked, filteredOut } = useMemo(() => rankCandidates(candidates, weights), [candidates, weights]);
  const rankOf = useMemo(() => new Map(ranked.map((c, index) => [c.id, index + 1])), [ranked]);

  const searchable = useCallback(
    (c: Candidate) => [
      c.cv.fullName,
      c.cv.fullNameAr ?? "",
      ...c.cv.skills.map((skill) => skill.label),
      ...c.matchedSkills.map((skill) => l(skill.name)),
    ],
    [l],
  );

  const visible = useMemo(
    () =>
      ranked.filter(
        (c) =>
          matchesQuery(c, query, searchable) &&
          (stageFilter === "all" || c.stage === stageFilter) &&
          (!lowOnly || candidateConfidence(c) === "low"),
      ),
    [ranked, query, stageFilter, lowOnly, searchable],
  );
  const visibleFilteredOut = useMemo(
    () => filteredOut.filter((c) => matchesQuery(c, query, searchable)),
    [filteredOut, query, searchable],
  );

  const stageCounts = useMemo<Record<StageFilter, number>>(
    () => ({
      all: ranked.length,
      new: ranked.filter((c) => c.stage === "new").length,
      shortlisted: ranked.filter((c) => c.stage === "shortlisted").length,
      rejected: ranked.filter((c) => c.stage === "rejected").length,
      hired: ranked.filter((c) => c.stage === "hired").length,
    }),
    [ranked],
  );

  // Selection only counts rows that are still on screen.
  const visibleIds = useMemo(() => new Set(visible.map((c) => c.id)), [visible]);
  const actionable = selected.filter((id) => visibleIds.has(id));

  const candidateCount = loaded?.length;
  useEffect(() => {
    if (candidateCount !== undefined) track({ name: "ranked_list_viewed", candidates: candidateCount });
  }, [candidateCount]);

  if (state.status === "loading") return <LoadingPanel label={t("ranked.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("ranked.loadError")} onRetry={retry} />;

  const job = state.data[0];
  if (!job) {
    return (
      <EmptyPanel
        title={t("ranked.notFound")}
        action={{ href: "/jobs", label: t("nav.backToJobs") }}
      />
    );
  }

  const weightsCustomised = SCORE_DIMENSIONS.some((d) => weights[d] !== jobWeights[d]);

  async function changeStage(stage: CandidateStage) {
    const ids = actionable;
    setActing(true);
    try {
      await setCandidateStage(ids, stage);
      setOverrides((current) => ({ ...current, ...Object.fromEntries(ids.map((id) => [id, stage])) }));
      track({ name: "candidate_stage_changed", stage, count: ids.length });
      toast.show(tn(`ranked.toast.${stage}`, ids.length), "match");
      setSelected([]);
    } catch {
      toast.show(t("ranked.error.action"), "danger");
    } finally {
      setActing(false);
    }
  }

  function onAct(action: "shortlisted" | "rejected" | "new") {
    if (action === "rejected") setConfirmReject(true);
    else void changeStage(action);
  }

  function clearFilters() {
    setQuery("");
    setStageFilter("all");
    setLowOnly(false);
  }

  const columns: Column<Candidate>[] = [
    {
      id: "rank",
      header: t("ranked.col.rank"),
      cell: (c) => <span className="text-text-secondary">{rankOf.get(c.id)}</span>,
      sortValue: (c) => rankOf.get(c.id) ?? 0,
    },
    {
      id: "candidate",
      header: t("ranked.col.candidate"),
      cell: (c) => <CandidateCell candidate={c} jobId={jobId} />,
      sortValue: (c) => c.cv.fullName,
    },
    {
      id: "match",
      header: t("ranked.col.match"),
      cell: (c) => <MatchScore value={matchScore(c, weights)} />,
      sortValue: (c) => matchScore(c, weights),
    },
    {
      id: "confidence",
      header: t("ranked.col.confidence"),
      cell: (c) => {
        const level = candidateConfidence(c);
        return <ConfidenceIndicator level={level} showLabel={level !== "high"} />;
      },
      sortValue: (c) => CONFIDENCE_SORT[candidateConfidence(c)],
    },
    ...(showBreakdown
      ? SCORE_DIMENSIONS.map<Column<Candidate>>((dimension) => ({
          id: dimension,
          header: t(`dimension.${dimension}`),
          cell: (c) => c.breakdown[dimension],
          sortValue: (c) => c.breakdown[dimension],
        }))
      : []),
    {
      id: "stage",
      header: t("ranked.col.stage"),
      cell: (c) => <Badge tone={c.stage === "shortlisted" || c.stage === "hired" ? "match" : "neutral"}>{t(`stage.${c.stage}`)}</Badge>,
      sortValue: (c) => STAGE_SORT[c.stage],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={job.title} description={tn("ranked.subtitle", candidates.length)} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={candidates.length === 0} onClick={() => setExportOpen(true)}>
            <Icon name="download" size={18} /> {t("export.button")}
          </Button>
          <Link href={`/jobs/${jobId}/upload`} className={buttonClass("primary", "md")}>
            <Icon name="upload" size={18} /> {t("ranked.upload")}
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyPanel
          icon="ranking"
          title={t("ranked.noCandidates.title")}
          description={t("ranked.noCandidates.body")}
          action={{ href: `/jobs/${jobId}/upload`, label: t("ranked.upload") }}
        />
      ) : (
        <>
          <details className="group rounded-xl border border-border-default bg-surface shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-base font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Icon name="settings" size={18} className="text-text-secondary" />
                {t("weights.title")}
                {weightsCustomised && <Badge tone="primary">{t("ranked.weights.custom")}</Badge>}
              </span>
              <Icon
                name="chevron-down"
                className="transition-transform duration-200 ease-[var(--ease-soft)] group-open:rotate-180"
              />
            </summary>
            <div className="border-t border-border-default p-4">
              <WeightPanel
                showTitle={false}
                weights={weights}
                onChange={(dimension: ScoreDimension, value: number) => {
                  track({ name: "weights_changed" });
                  setCustomWeights(rebalanceWeights(weights, dimension, value));
                }}
                onReset={() => setCustomWeights(null)}
              />
            </div>
          </details>

          <RankedToolbar
            query={query}
            onQueryChange={setQuery}
            stageFilter={stageFilter}
            onStageFilterChange={setStageFilter}
            stageCounts={stageCounts}
            lowConfidenceOnly={lowOnly}
            onLowConfidenceOnlyChange={setLowOnly}
            showBreakdown={showBreakdown}
            onShowBreakdownChange={setShowBreakdown}
            selectedCount={actionable.length}
            acting={acting}
            onAct={onAct}
            onClearSelection={() => setSelected([])}
          />

          <section aria-labelledby="ranked-heading" className="flex flex-col gap-3">
            <h2 id="ranked-heading" className="text-lg font-semibold text-text-primary">
              {t("ranked.rankedTitle", { count: visible.length })}
            </h2>
            <DataTable
              columns={columns}
              rows={visible}
              getRowId={(c) => c.id}
              getRowLabel={(c) => c.cv.fullName}
              defaultSort={{ columnId: "match", direction: "desc" }}
              selectedIds={selected}
              onSelectionChange={setSelected}
              emptyMessage={
                <span className="flex flex-col items-center gap-2 py-4">
                  {t("ranked.empty.filtered")}
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    {t("ranked.empty.clear")}
                  </Button>
                </span>
              }
            />
          </section>

          <section aria-labelledby="filtered-heading" className="flex flex-col gap-3">
            <h2 id="filtered-heading" className="text-lg font-semibold text-text-primary">
              {t("ranked.filteredOut.title", { count: visibleFilteredOut.length })}
            </h2>
            <p className="text-sm text-text-secondary">{t("ranked.filteredOut.hint")}</p>
            {visibleFilteredOut.length === 0 ? (
              <Card className="text-sm text-text-secondary">{t("ranked.filteredOut.none")}</Card>
            ) : (
              <DataTable
                columns={[
                  {
                    id: "candidate",
                    header: t("ranked.col.candidate"),
                    cell: (c) => (
                      <span className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/jobs/${jobId}/candidates/${c.id}`}
                          className="font-semibold hover:text-primary hover:underline"
                        >
                          {c.cv.fullName}
                        </Link>
                        {c.lowConfidence && <ConfidenceIndicator level="low" />}
                      </span>
                    ),
                  },
                  {
                    id: "reason",
                    header: t("ranked.col.reason"),
                    cell: (c) => <Badge tone="danger">{c.filteredOut?.reason}</Badge>,
                  },
                ]}
                rows={visibleFilteredOut}
                getRowId={(c) => c.id}
              />
            )}
          </section>

          <RunRatingCard jobId={jobId} />
        </>
      )}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        jobTitle={job.title}
        ranked={ranked}
        filteredOut={filteredOut}
        weights={weights}
      />

      <ConfirmDialog
        open={confirmReject}
        onClose={() => setConfirmReject(false)}
        title={t("ranked.reject.title")}
        description={t("ranked.reject.body")}
        confirmLabel={t("ranked.action.reject")}
        tone="danger"
        onConfirm={() => changeStage("rejected")}
      />
    </div>
  );
}
