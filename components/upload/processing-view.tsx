"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card, EmptyPanel, ErrorPanel, Icon, LoadingPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getProcessingStatus } from "@/lib/api";
import type { ProcessingBatch, ProcessingStatus } from "@/types";

const POLL_MS = 1000;

type View = { status: "loading" } | { status: "error" } | { status: "ready"; batch: ProcessingBatch | null };

const statusLabel: Record<ProcessingStatus, string> = {
  queued: "Queued",
  processing: "Reading…",
  done: "Scored",
  failed: "Couldn't read",
};

const statusTone: Record<ProcessingStatus, "neutral" | "primary" | "match" | "danger"> = {
  queued: "neutral",
  processing: "primary",
  done: "match",
  failed: "danger",
};

function isFinished(batch: ProcessingBatch): boolean {
  return batch.files.every((file) => file.status === "done" || file.status === "failed");
}

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
        if (batch && !isFinished(batch)) timer = setTimeout(tick, POLL_MS);
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
        title="Nothing is being processed"
        description="Upload a batch of CVs to get started."
        action={{ href: `/jobs/${jobId}/upload`, label: "Upload CVs" }}
      />
    );
  }

  const total = batch.files.length;
  const finishedCount = batch.files.filter(
    (file) => file.status === "done" || file.status === "failed",
  ).length;
  const failedCount = batch.files.filter((file) => file.status === "failed").length;
  const finished = isFinished(batch);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={finished ? "All done" : "Reading and scoring your CVs"}
        description={
          finished
            ? `${total - failedCount} of ${total} CVs scored. Review them in your ranked list.`
            : "You can leave this page. Processing continues in the background."
        }
      />

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium text-text-primary">
            {finishedCount} of {total} processed
          </p>
          {failedCount > 0 && <Badge tone="danger">{failedCount} couldn&apos;t be read</Badge>}
        </div>
        <div
          role="progressbar"
          aria-label="Processing progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={finishedCount}
          className="h-2 overflow-hidden rounded-full bg-subtle"
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(finishedCount / total) * 100}%` }}
          />
        </div>
      </Card>

      <Card className="p-0">
        <ul className="max-h-96 overflow-y-auto">
          {batch.files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 border-b border-border-default px-6 py-2 last:border-b-0"
            >
              <Icon name="file" size={18} className="shrink-0 text-text-secondary" />
              <span className="min-w-0 flex-1 truncate text-base text-text-primary">{file.fileName}</span>
              <Badge tone={statusTone[file.status]}>{statusLabel[file.status]}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      {failedCount > 0 && finished && (
        <p className="text-sm text-text-secondary">
          Files we couldn&apos;t read aren&apos;t counted against your capacity. Re-upload a clearer
          copy to try again. {/* TODO(spec): failed-file handling and capacity rules */}
        </p>
      )}

      {finished && (
        <div className="flex flex-wrap gap-2">
          <Link href={`/jobs/${jobId}/candidates`} className={buttonClass("primary", "lg")}>
            View ranked list
          </Link>
          <Link href={`/jobs/${jobId}/upload`} className={buttonClass("secondary", "lg")}>
            Upload more
          </Link>
        </div>
      )}
    </div>
  );
}
