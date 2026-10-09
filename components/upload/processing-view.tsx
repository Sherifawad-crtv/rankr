"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatedNumber,
  Badge,
  Card,
  EmptyPanel,
  ErrorPanel,
  Icon,
  LoadingPanel,
  StatusPill,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { cn, stagger } from "@/components/ui/cn";
import { getProcessingStatus } from "@/lib/api";
import { track } from "@/lib/analytics";
import {
  PIPELINE_STAGES,
  activeStageIndex,
  isFinished,
  stageProgress,
} from "@/lib/processing";
import type { ProcessingBatch } from "@/types";
import { DocumentStack } from "./processing/document-stack";
import { RotatingTip } from "./processing/rotating-tip";
import { StageStepper } from "./processing/stage-stepper";

const POLL_MS = 800;

type View =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; batch: ProcessingBatch | null };

export function ProcessingView({ jobId }: { jobId: string }) {
  const [view, setView] = useState<View>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        const batch = await getProcessingStatus(jobId);
        if (cancelled) return;
        setView({ status: "ready", batch });
        if (batch && !isFinished(batch.files)) {
          timer = setTimeout(tick, POLL_MS);
        } else if (batch) {
          track({
            name: "run_completed",
            total: batch.files.length,
            failed: batch.files.filter((file) => file.status === "failed").length,
          });
        }
      } catch {
        if (!cancelled) setView({ status: "error" });
      }
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, attempt]);

  function retry() {
    setView({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  if (view.status === "loading") return <LoadingPanel label="Checking progress…" />;
  if (view.status === "error") {
    return <ErrorPanel message="We couldn't check the progress." onRetry={retry} />;
  }

  const { batch } = view;
  if (!batch) {
    return (
      <EmptyPanel
        icon="upload"
        title="Nothing is being processed"
        description="Upload a batch of CVs to get started."
        action={{ href: `/jobs/${jobId}/upload`, label: "Upload CVs" }}
      />
    );
  }

  const { files } = batch;
  const total = files.length;
  const settled = files.filter((file) => file.status === "done" || file.status === "failed").length;
  const failedCount = files.filter((file) => file.status === "failed").length;
  const scoredCount = settled - failedCount;
  const finished = isFinished(files);

  const progress = stageProgress(files);
  const activeIndex = activeStageIndex(progress);
  const stage = PIPELINE_STAGES[Math.min(activeIndex, PIPELINE_STAGES.length - 1)];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card
        key={finished ? "done" : "running"}
        className="flex animate-fade-up flex-col items-center gap-8 overflow-hidden bg-gradient-to-b from-primary/10 to-surface px-6 py-10 text-center"
      >
        {finished ? (
          <>
            <span className="flex size-24 animate-pop items-center justify-center rounded-full bg-match/15 text-match">
              <Icon name="check" variant="bold" size={52} />
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold text-text-primary">Your shortlist is ready</h1>
              <p className="text-base text-text-secondary">
                <span className="font-display font-bold text-text-primary">{scoredCount}</span> of{" "}
                {total} CVs scored. A person should review every candidate before deciding.
              </p>
              {failedCount > 0 && (
                <p>
                  <Badge tone="danger">{failedCount} couldn&apos;t be read</Badge>
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href={`/jobs/${jobId}/candidates`} className={buttonClass("primary", "lg")}>
                See ranked candidates <Icon name="arrow-right" size={18} mirrorRtl />
              </Link>
              <Link href={`/jobs/${jobId}/upload`} className={buttonClass("secondary", "lg")}>
                Upload more
              </Link>
            </div>
          </>
        ) : (
          <>
            <DocumentStack icon={stage.icon} stageKey={stage.id} />
            <div className="flex min-h-24 flex-col gap-2">
              <h1 key={`headline-${stage.id}`} className="animate-fade-up text-xl font-bold text-text-primary">
                {stage.headline}
              </h1>
              <RotatingTip key={`tip-${stage.id}`} tips={stage.tips} />
            </div>
            <div className="w-full max-w-xl">
              <StageStepper progress={progress} active={activeIndex} />
            </div>
            <p className="text-base text-text-secondary">
              <span className="font-display text-lg font-bold text-text-primary">
                <AnimatedNumber value={settled} duration={400} />
              </span>{" "}
              of {total} CVs done. You can leave this page, it keeps going.
            </p>
            <p role="status" className="sr-only">
              {stage.headline}. {settled} of {total} CVs done.
            </p>
          </>
        )}
      </Card>

      <details className="group rounded-xl border border-border-default bg-surface shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-base font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          See each file
          <Icon
            name="chevron-down"
            className="transition-transform duration-300 ease-[var(--ease-soft)] group-open:rotate-180"
          />
        </summary>
        <ul className="max-h-96 overflow-y-auto border-t border-border-default">
          {files.map((file, index) => (
            <li
              key={file.id}
              className={cn(
                "animate-stagger flex items-center gap-3 border-b border-border-default px-6 py-2.5 last:border-b-0",
              )}
              style={stagger(index)}
            >
              <Icon name="file" size={18} className="text-text-secondary" />
              <span className="min-w-0 flex-1 truncate text-base text-text-primary">{file.fileName}</span>
              <StatusPill status={file.status} step={file.step} duplicate={file.isDuplicate} />
            </li>
          ))}
        </ul>
      </details>

      {failedCount > 0 && finished && (
        <p className="text-sm text-text-secondary">
          Files we couldn&apos;t read aren&apos;t counted against your capacity. Re-upload a clearer
          copy to try again. {/* TODO(spec): failed-file handling and capacity rules */}
        </p>
      )}
    </div>
  );
}
