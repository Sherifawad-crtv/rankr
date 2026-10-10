"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfidenceIndicator,
  EmptyPanel,
  ErrorPanel,
  Icon,
  LoadingPanel,
  StatusPill,
} from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getProcessingStatus, retryFailedFiles } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n/locale-context";
import { PIPELINE_STAGES, activeStageIndex, isFinished, stageProgress } from "@/lib/processing";
import type { ProcessingBatch } from "@/types";
import { DocumentStack } from "./processing/document-stack";
import { RotatingTip } from "./processing/rotating-tip";
import { StageStepper } from "./processing/stage-stepper";

const POLL_MS = 800;
const ALL = "__all";

type View =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; batch: ProcessingBatch | null };

export function ProcessingView({ jobId }: { jobId: string }) {
  const { t, tn } = useLocale();
  const [view, setView] = useState<View>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState<string[]>([]);

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

  function reload() {
    setView({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  /** Re-queues failed files and starts polling again (polling stops once a run is finished). */
  async function retry(ids?: string[]) {
    const keys = ids ?? [ALL];
    setRetrying((current) => [...current, ...keys]);
    try {
      await retryFailedFiles(jobId, ids);
      setAttempt((count) => count + 1);
    } finally {
      setRetrying((current) => current.filter((key) => !keys.includes(key)));
    }
  }

  if (view.status === "loading") return <LoadingPanel label={t("processing.loading")} />;
  if (view.status === "error") return <ErrorPanel message={t("processing.error")} onRetry={reload} />;

  const { batch } = view;
  if (!batch) {
    return (
      <EmptyPanel
        icon="upload"
        title={t("processing.empty.title")}
        description={t("processing.empty.body")}
        action={{ href: `/jobs/${jobId}/upload`, label: t("processing.empty.action") }}
      />
    );
  }

  const { files, etaSeconds } = batch;
  const total = files.length;
  const settled = files.filter((file) => file.status === "done" || file.status === "failed").length;
  const failedFiles = files.filter((file) => file.status === "failed");
  const duplicateCount = files.filter((file) => file.isDuplicate).length;
  const scoredFiles = files.filter((file) => file.status === "done" && !file.isDuplicate);
  const reviewCount = scoredFiles.filter((file) => file.lowConfidence).length;
  const ocrCount = scoredFiles.filter((file) => file.ocrUsed).length;
  const finished = isFinished(files);

  const progress = stageProgress(files);
  const activeIndex = activeStageIndex(progress);
  const stage = PIPELINE_STAGES[Math.min(activeIndex, PIPELINE_STAGES.length - 1)];
  const headline = t(`processing.stage.${stage.id}.headline`);

  const eta =
    etaSeconds === null
      ? null
      : etaSeconds < 60
        ? tn("processing.eta.seconds", etaSeconds)
        : tn("processing.eta.minutes", Math.ceil(etaSeconds / 60));

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
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{t("processing.done.title")}</h1>
              <p className="text-base text-text-secondary">
                {t("processing.done.summary", { scored: scoredFiles.length, total })}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {reviewCount > 0 && (
                  <Badge tone="warning">{tn("processing.summary.review", reviewCount)}</Badge>
                )}
                {ocrCount > 0 && <Badge>{tn("processing.summary.ocr", ocrCount)}</Badge>}
              </div>
              {duplicateCount > 0 && (
                <p className="text-sm text-text-secondary">{tn("processing.duplicates", duplicateCount)}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href={`/jobs/${jobId}/candidates`} className={buttonClass("primary", "lg")}>
                {t("processing.done.cta")} <Icon name="arrow-right" size={18} mirrorRtl />
              </Link>
              <Link href={`/jobs/${jobId}/upload`} className={buttonClass("secondary", "lg")}>
                {t("processing.done.more")}
              </Link>
            </div>
          </>
        ) : (
          <>
            <DocumentStack icon={stage.icon} stageKey={stage.id} />
            <div className="flex min-h-24 flex-col gap-2">
              <h1 key={`headline-${stage.id}`} className="animate-fade-up text-xl font-bold text-text-primary">
                {headline}
              </h1>
              <RotatingTip key={`tip-${stage.id}`} tips={stage.tipKeys.map((key) => t(key))} />
            </div>
            <div className="w-full max-w-xl">
              <StageStepper progress={progress} active={activeIndex} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base text-text-secondary">
                <span className="font-display text-lg font-bold text-text-primary">
                  {settled}
                </span>{" "}
                {t("processing.progress", { total })}
              </p>
              {eta && <p className="text-sm font-semibold text-primary">{eta}</p>}
            </div>
            <p role="status" className="sr-only">
              {headline}. {settled} / {total}. {eta}
            </p>
          </>
        )}
      </Card>

      {failedFiles.length > 0 && (
        <Card className="flex animate-fade-up flex-col gap-3 border-danger/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
              <Icon name="alert" variant="bold" className="text-danger" />
              {tn("processing.failed.title", failedFiles.length)}
            </h2>
            {failedFiles.length > 1 && (
              <Button
                variant="secondary"
                size="sm"
                loading={retrying.includes(ALL)}
                onClick={() => retry()}
              >
                <Icon name="refresh" size={16} /> {t("processing.retryAll")}
              </Button>
            )}
          </div>
          <ul className="flex flex-col">
            {failedFiles.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default py-3 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-primary">{file.fileName}</p>
                  {file.error && <p className="text-sm text-text-secondary">{file.error}</p>}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={retrying.includes(file.id) || retrying.includes(ALL)}
                  aria-label={t("processing.retryFile", { name: file.fileName })}
                  onClick={() => retry([file.id])}
                >
                  <Icon name="refresh" size={16} /> {t("processing.retry")}
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-secondary">{t("processing.failed.note")}</p>
        </Card>
      )}

      <details className="group rounded-xl border border-border-default bg-surface shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-base font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
          {t("processing.files")}
          <Icon
            name="chevron-down"
            className="transition-transform duration-200 ease-[var(--ease-soft)] group-open:rotate-180"
          />
        </summary>
        <ul className="max-h-96 overflow-y-auto border-t border-border-default">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-default px-6 py-2.5 last:border-b-0"
            >
              <Icon name="file" size={18} className="text-text-secondary" />
              <span className="min-w-0 flex-1 truncate text-base text-text-primary">{file.fileName}</span>
              {file.ocrUsed && (
                <Badge title={t("processing.flag.ocr")} className="gap-1">
                  <Icon name="scan" size={14} /> OCR
                </Badge>
              )}
              {file.lowConfidence && <ConfidenceIndicator level="low" />}
              <StatusPill status={file.status} step={file.step} duplicate={file.isDuplicate} />
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
