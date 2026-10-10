"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfidenceIndicator,
  ConfirmDialog,
  Disclaimer,
  EmptyPanel,
  ErrorPanel,
  Icon,
  LoadingPanel,
  MatchScore,
  SkillChip,
  useToast,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getCandidate, getJob, listCandidates, setCandidateStage } from "@/lib/api";
import { track } from "@/lib/analytics";
import { candidateConfidence } from "@/lib/confidence";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { matchScore, rankCandidates, weightedScore } from "@/lib/scoring";
import type { Candidate, CandidateStage } from "@/types";
import { BreakdownCard } from "./breakdown-card";
import { CvLinkCard } from "./cv-link-card";
import { ProfileCard } from "./profile-card";

type ActionVariant = "primary" | "secondary" | "ghost";

const ACTIONS: Array<{ stage: CandidateStage; labelKey: "shortlist" | "hire" | "reject" | "reset"; variant: ActionVariant }> = [
  { stage: "shortlisted", labelKey: "shortlist", variant: "primary" },
  { stage: "hired", labelKey: "hire", variant: "secondary" },
  { stage: "rejected", labelKey: "reject", variant: "secondary" },
  { stage: "new", labelKey: "reset", variant: "ghost" },
];

function Callout({ tone, children }: { tone: "warning" | "info"; children: React.ReactNode }) {
  return (
    <div
      role="note"
      className={`flex animate-fade-up items-start gap-3 rounded-lg border p-4 text-sm ${
        tone === "warning"
          ? "border-warning/30 bg-warning/5 text-text-primary"
          : "border-border-default bg-subtle text-text-secondary"
      }`}
    >
      <Icon
        name={tone === "warning" ? "alert" : "info"}
        variant="bold"
        size={18}
        className={`mt-0.5 ${tone === "warning" ? "text-warning" : "text-primary"}`}
      />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export function CandidateDetailView({ jobId, candidateId }: { jobId: string; candidateId: string }) {
  const { t, tn, l } = useLocale();
  const toast = useToast();
  const load = useCallback(
    () => Promise.all([getJob(jobId), getCandidate(candidateId), listCandidates(jobId)]),
    [jobId, candidateId],
  );
  const { state, retry } = useAsync(load);

  const [stageOverride, setStageOverride] = useState<CandidateStage | null>(null);
  const [acting, setActing] = useState<CandidateStage | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("detail.loadError")} onRetry={retry} />;

  const [job, found, all] = state.data;
  if (!job || !found || found.jobId !== jobId) {
    return (
      <EmptyPanel
        title={t("detail.notFound")}
        action={{ href: `/jobs/${jobId}/candidates`, label: t("detail.back") }}
      />
    );
  }

  const candidate: Candidate = stageOverride ? { ...found, stage: stageOverride } : found;
  const stage = candidate.stage;
  const level = candidateConfidence(candidate);
  const weighted = weightedScore(candidate, job.weights);
  const score = matchScore(candidate, job.weights);

  // Previous / next in the ranked order (ranked candidates first, then filtered-out ones).
  const { ranked, filteredOut } = rankCandidates(all, job.weights);
  const order = [...ranked, ...filteredOut];
  const index = order.findIndex((item) => item.id === candidate.id);
  const previous = index > 0 ? order[index - 1] : null;
  const next = index >= 0 && index < order.length - 1 ? order[index + 1] : null;

  async function changeStage(target: CandidateStage) {
    setActing(target);
    try {
      await setCandidateStage([candidate.id], target);
      setStageOverride(target);
      track({ name: "candidate_stage_changed", stage: target, count: 1 });
      toast.show(tn(`ranked.toast.${target}`, 1), "match");
    } catch {
      toast.show(t("ranked.error.action"), "danger");
    } finally {
      setActing(null);
    }
  }

  const unmapped = candidate.cv.skills.filter((skill) => skill.skillId === null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/jobs/${jobId}/candidates`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-text-primary"
        >
          <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" />
          {t("detail.back")}
        </Link>
        <nav aria-label={t("detail.position", { position: index + 1, total: order.length })} className="flex items-center gap-2">
          {previous ? (
            <Link href={`/jobs/${jobId}/candidates/${previous.id}`} className={buttonClass("ghost", "sm")}>
              <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> {t("detail.prev")}
            </Link>
          ) : null}
          <span className="text-sm text-text-secondary">
            {t("detail.position", { position: index + 1, total: order.length })}
          </span>
          {next ? (
            <Link href={`/jobs/${jobId}/candidates/${next.id}`} className={buttonClass("ghost", "sm")}>
              {t("detail.next")} <Icon name="chevron-right" size={16} className="rtl:rotate-180" />
            </Link>
          ) : null}
        </nav>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={candidate.cv.fullName} size="lg" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-text-primary">{candidate.cv.fullName}</h1>
              {candidate.cv.fullNameAr && (
                <p lang="ar" dir="rtl" className="text-base text-text-secondary">
                  {candidate.cv.fullNameAr}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone={stage === "shortlisted" || stage === "hired" ? "match" : "neutral"}>
                  {t(`stage.${stage}`)}
                </Badge>
                <ConfidenceIndicator level={level} showLabel={level !== "high"} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MatchScore value={score} size="lg" />
            <span className="text-sm font-semibold text-text-secondary">{t("detail.match")}</span>
          </div>
        </div>

        {candidate.cv.confidence < 1 && (
          <p className="text-sm text-text-secondary">
            {t("detail.scoreNote", {
              weighted: Math.round(weighted),
              confidence: Math.round(candidate.cv.confidence * 100),
            })}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border-default pt-4">
          {ACTIONS.filter((action) => action.stage !== stage).map(
            (action) => (
              <Button
                key={action.stage}
                variant={action.variant}
                loading={acting === action.stage}
                disabled={acting !== null}
                onClick={() => (action.stage === "rejected" ? setConfirmReject(true) : changeStage(action.stage))}
              >
                {action.stage === "shortlisted" && <Icon name="star" size={18} />}
                {t(`detail.action.${action.labelKey}`)}
              </Button>
            ),
          )}
        </div>
      </Card>

      <Disclaimer />

      {candidate.filteredOut && (
        <Callout tone="warning">
          <p className="font-semibold">{t("detail.banner.filtered", { reason: candidate.filteredOut.reason })}</p>
          <p className="text-text-secondary">{t("detail.banner.filteredHint")}</p>
        </Callout>
      )}
      {level === "low" && <Callout tone="warning">{t("detail.banner.low")}</Callout>}
      {candidate.ocrUsed && <Callout tone="info">{t("detail.banner.ocr")}</Callout>}
      {candidate.duplicateOf && <Callout tone="info">{t("detail.banner.duplicate")}</Callout>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{t("detail.rationale.title")}</h2>
            <p className="text-base text-text-primary">{candidate.rationale}</p>
          </Card>

          <BreakdownCard candidate={candidate} weights={job.weights} />

          <Card className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">{t("detail.skills.title")}</h2>
            {[
              {
                title: t("detail.skills.matched"),
                chips: candidate.matchedSkills.map((skill) => (
                  <SkillChip key={skill.id} label={l(skill.name)} state="matched" />
                )),
              },
              {
                title: t("detail.skills.missing"),
                chips: candidate.missingRequiredSkills.map((skill) => (
                  <SkillChip key={skill.id} label={l(skill.name)} state="missing" />
                )),
              },
              {
                title: t("detail.skills.extra"),
                chips: candidate.extraSkills.map((skill) => (
                  <SkillChip key={skill.id} label={l(skill.name)} state="extra" />
                )),
              },
              {
                title: t("detail.skills.unmapped"),
                chips: unmapped.map((skill) => <SkillChip key={skill.label} label={skill.label} />),
              },
            ].map((group) => (
              <section key={group.title} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-text-secondary">{group.title}</h3>
                {group.chips.length === 0 ? (
                  <p className="text-sm text-text-secondary">{t("detail.skills.none")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">{group.chips}</div>
                )}
              </section>
            ))}
          </Card>

          <ProfileCard candidate={candidate} />
        </div>

        <div className="flex flex-col gap-6">
          <CvLinkCard candidateId={candidate.id} />
        </div>
      </div>

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
