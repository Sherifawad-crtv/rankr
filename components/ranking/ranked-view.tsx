"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Card,
  EmptyPanel,
  ErrorPanel,
  Icon,
  LoadingPanel,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getJob, listCandidates } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { rankCandidates, rebalanceWeights, weightedScore } from "@/lib/scoring";
import { DEFAULT_SCORE_WEIGHTS, type Candidate, type ScoreDimension, type ScoreWeights } from "@/types";
import { WeightPanel } from "./weight-panel";

function LowConfidenceBadge() {
  return (
    <Badge tone="warning" title="We were not confident reading this CV. Review it manually.">
      Low confidence
    </Badge>
  );
}

export function RankedView({ jobId }: { jobId: string }) {
  const load = useCallback(() => Promise.all([getJob(jobId), listCandidates(jobId)]), [jobId]);
  const { state, retry } = useAsync(load);
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_SCORE_WEIGHTS);

  const candidates = state.status === "ready" ? state.data[1] : null;
  const { ranked, filteredOut } = useMemo(
    () => rankCandidates(candidates ?? [], weights),
    [candidates, weights],
  );

  if (state.status === "loading") return <LoadingPanel label="Loading candidates…" />;
  if (state.status === "error") {
    return <ErrorPanel message="We couldn't load the candidates." onRetry={retry} />;
  }

  const [job, all] = state.data;
  if (!job) {
    return (
      <EmptyPanel
        title="We couldn't find that job"
        action={{ href: "/jobs", label: "Back to jobs" }}
      />
    );
  }

  function onWeightChange(dimension: ScoreDimension, value: number) {
    setWeights((current) => rebalanceWeights(current, dimension, value));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={job.title} description={`${all.length} candidates · ranked list`} />
        <Link href={`/jobs/${jobId}/upload`} className={buttonClass("primary", "md")}>
          <Icon name="upload" size={18} /> Upload CVs
        </Link>
      </div>

      {/* Human-in-the-loop disclaimer: required wherever scores appear. */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-md border border-border-default bg-subtle p-4 text-sm text-text-secondary"
      >
        <Icon name="alert" size={18} className="mt-0.5 shrink-0 text-warning" />
        Scores are a decision aid, not a decision. A person must review every candidate. Rankr
        never rejects anyone automatically.
      </div>

      {all.length === 0 ? (
        <EmptyPanel
          title="No candidates yet"
          description="Upload a batch of CVs and they'll be ranked here."
          action={{ href: `/jobs/${jobId}/upload`, label: "Upload CVs" }}
        />
      ) : (
        <>
          <WeightPanel
            weights={weights}
            onChange={onWeightChange}
            onReset={() => setWeights(DEFAULT_SCORE_WEIGHTS)}
          />

          <section aria-labelledby="ranked-heading" className="flex flex-col gap-3">
            <h2 id="ranked-heading" className="text-lg font-medium text-text-primary">
              Ranked ({ranked.length})
            </h2>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Candidate</Th>
                  <Th>Score</Th>
                  <Th>Skills</Th>
                  <Th>Experience</Th>
                  <Th>Education</Th>
                  <Th>Profile</Th>
                  <Th>Stage</Th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((candidate, index) => (
                  <CandidateRow key={candidate.id} candidate={candidate} rank={index + 1} weights={weights} />
                ))}
              </tbody>
            </Table>
          </section>

          <section aria-labelledby="filtered-heading" className="flex flex-col gap-3">
            <h2 id="filtered-heading" className="text-lg font-medium text-text-primary">
              Filtered out ({filteredOut.length})
            </h2>
            <p className="text-sm text-text-secondary">
              These candidates didn&apos;t meet a required filter. They&apos;re shown so nobody is
              dropped silently. Review them if you disagree.
            </p>
            {filteredOut.length === 0 ? (
              <Card className="text-sm text-text-secondary">No candidates were filtered out.</Card>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Candidate</Th>
                    <Th>Reason</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOut.map((candidate) => (
                    <tr key={candidate.id}>
                      <Td>
                        <span className="flex flex-wrap items-center gap-2">
                          {candidate.cv.fullName}
                          {candidate.lowConfidence && <LowConfidenceBadge />}
                        </span>
                      </Td>
                      <Td>
                        <Badge tone="danger">{candidate.filteredOut?.reason}</Badge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function CandidateRow({
  candidate,
  rank,
  weights,
}: {
  candidate: Candidate;
  rank: number;
  weights: ScoreWeights;
}) {
  return (
    <tr>
      <Td className="text-text-secondary">{rank}</Td>
      <Td>
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{candidate.cv.fullName}</span>
          {candidate.lowConfidence && <LowConfidenceBadge />}
        </span>
      </Td>
      <Td>
        <span className="font-medium text-primary">{Math.round(weightedScore(candidate, weights))}</span>
      </Td>
      <Td>{candidate.breakdown.skills}</Td>
      <Td>{candidate.breakdown.experience}</Td>
      <Td>{candidate.breakdown.education}</Td>
      <Td>{candidate.breakdown.profileQuality}</Td>
      <Td>
        <Badge>{candidate.stage}</Badge>
      </Td>
    </tr>
  );
}
