"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorPanel,
  Icon,
  LoadingPanel,
} from "@/components/ui";
import { RateLimitError, getJob, getPlan, getUploadQuota, submitCVBatch } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { MAX_CVS_PER_RUN } from "@/lib/limits";
import { useSession } from "@/lib/session";
import type { UploadProgress } from "@/types";
import { Dropzone } from "./dropzone";

// TODO(spec): accepted formats and size limit are not specified.
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_NOTICES = 5;

function fileKey(file: File): string {
  return `${file.name}:${file.size}`;
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-subtle"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-[var(--ease-soft)]"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

export function UploadView({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { user } = useSession();
  const { t, tn } = useLocale();
  const load = useCallback(
    () => Promise.all([getJob(jobId), getPlan(user.planMode), getUploadQuota()]),
    [jobId, user.planMode],
  );
  const { state, retry } = useAsync(load);

  const [files, setFiles] = useState<File[]>([]);
  const [notices, setNotices] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function addFiles(incoming: File[]) {
    const known = new Set(files.map(fileKey));
    const accepted: File[] = [];
    const messages: string[] = [];

    for (const file of incoming) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        messages.push(t("upload.err.type", { name: file.name }));
      } else if (file.size > MAX_FILE_BYTES) {
        messages.push(t("upload.err.size", { name: file.name }));
      } else if (known.has(fileKey(file))) {
        messages.push(t("upload.err.duplicate", { name: file.name }));
      } else if (files.length + accepted.length >= MAX_CVS_PER_RUN) {
        messages.push(t("upload.err.limit", { name: file.name, max: MAX_CVS_PER_RUN }));
      } else {
        known.add(fileKey(file));
        accepted.push(file);
      }
    }

    setNotices(
      messages.length > MAX_NOTICES
        ? [...messages.slice(0, MAX_NOTICES), tn("upload.err.more", messages.length - MAX_NOTICES)]
        : messages,
    );
    setFiles((current) => [...current, ...accepted]);
  }

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("upload.loadError")} onRetry={retry} />;

  const [job, plan, quota] = state.data;
  if (!job) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-base text-text-primary">{t("upload.notFound")}</p>
        <Link href="/jobs" className="text-base font-semibold text-primary hover:underline">
          {t("nav.backToJobs")}
        </Link>
      </Card>
    );
  }

  const rateLimited = quota.used >= quota.limit;
  const remaining = plan.cvCapacity === null ? null : plan.cvCapacity - plan.cvUsed;
  const overCapacity = remaining !== null && files.length > remaining;
  const uploading = progress !== null;
  const canSubmit = files.length > 0 && consent && !overCapacity && !uploading;

  async function onSubmit() {
    setSubmitError(null);
    setProgress({ phase: "uploading", done: 0, total: files.length });
    try {
      await submitCVBatch(jobId, files, setProgress);
      track({ name: "cv_batch_submitted", count: files.length });
      router.push(`/jobs/${jobId}/processing`);
    } catch (error) {
      setSubmitError(
        error instanceof RateLimitError
          ? t("upload.error.rateLimited", { minutes: error.resetsInMinutes })
          : t("upload.error.submit"),
      );
      setProgress(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("upload.title", { job: job.title })} description={job.location} />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-text-primary">{t("upload.capacity.title")}</p>
            <Badge tone={overCapacity ? "danger" : "neutral"}>
              {plan.cvCapacity === null
                ? t("upload.capacity.unknown", { used: plan.cvUsed }) // TODO(spec): Solo capacity is OPEN
                : t("upload.capacity.used", { used: plan.cvUsed, capacity: plan.cvCapacity })}
            </Badge>
          </div>
          {plan.cvCapacity !== null && (
            <Meter label={t("upload.capacity.aria")} value={plan.cvUsed} max={plan.cvCapacity} />
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-default pt-3">
          <p className="text-sm text-text-secondary">{t("upload.quota.label")}</p>
          <Badge tone={rateLimited ? "danger" : "neutral"}>
            {t("upload.quota.value", { used: quota.used, limit: quota.limit })}
          </Badge>
        </div>
      </Card>

      {rateLimited ? (
        <Card className="flex animate-fade-up flex-col items-center gap-3 text-center">
          <span className="flex size-14 animate-pop items-center justify-center rounded-full bg-warning/10 text-warning">
            <Icon name="clock" variant="bold" size={28} />
          </span>
          <h2 className="text-lg font-semibold text-text-primary">{t("upload.quota.exhaustedTitle")}</h2>
          <p className="text-base text-text-secondary">
            {t("upload.quota.exhaustedBody", { minutes: quota.resetsInMinutes })}
          </p>
          <Link href="/jobs" className="text-base font-semibold text-primary hover:underline">
            {t("nav.backToJobs")}
          </Link>
        </Card>
      ) : (
        <>
          <Dropzone accept={ACCEPTED_EXTENSIONS.join(",")} onFiles={addFiles} />

          {notices.length > 0 && (
            <ul role="alert" className="flex flex-col gap-1 text-sm text-danger">
              {notices.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {files.length > 0 && (
            <Card className="flex flex-col gap-3 p-0">
              <div className="flex items-center justify-between gap-3 px-6 pt-4">
                <p className="text-base font-semibold text-text-primary">
                  {tn("upload.ready", files.length)}
                  <span className="ms-2 text-sm font-normal text-text-secondary">
                    {t("upload.list.counter", { count: files.length, max: MAX_CVS_PER_RUN })}
                  </span>
                </p>
                <Button variant="ghost" size="sm" disabled={uploading} onClick={() => setFiles([])}>
                  {t("upload.list.clear")}
                </Button>
              </div>
              <ul className="max-h-80 overflow-y-auto border-t border-border-default">
                {files.map((file) => (
                  <li
                    key={fileKey(file)}
                    className="flex items-center gap-3 border-b border-border-default px-6 py-2 last:border-b-0"
                  >
                    <Icon name="file" size={18} className="shrink-0 text-text-secondary" />
                    <span className="min-w-0 flex-1 truncate text-base text-text-primary">{file.name}</span>
                    <span className="text-sm text-text-secondary">{formatSize(file.size)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={uploading}
                      aria-label={t("upload.list.remove", { name: file.name })}
                      onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                    >
                      <Icon name="close" size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {overCapacity && remaining !== null && (
            <p role="alert" className="text-sm text-danger">
              {t("upload.over.capacity", {
                count: files.length,
                remaining,
                excess: files.length - remaining,
              })}
            </p>
          )}

          {uploading ? (
            <Card className="flex animate-fade-up flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon
                    name={progress.phase === "scanning" ? "shield" : "upload"}
                    variant="bold"
                    className="animate-pulse"
                  />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-text-primary">
                    {t("upload.progress.title")}
                  </p>
                  <p role="status" className="text-sm text-text-secondary">
                    {progress.phase === "scanning"
                      ? t("upload.progress.scanning")
                      : t("upload.progress.uploading", { done: progress.done, total: progress.total })}
                  </p>
                </div>
              </div>
              <Meter label={t("upload.progress.title")} value={progress.done} max={progress.total} />
            </Card>
          ) : (
            <Card className="flex flex-col gap-4">
              {/* TODO(spec): consent wording */}
              <Checkbox
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                label={t("upload.consent")}
              />
              <p className="text-sm text-text-secondary">{t("upload.consentNote")}</p>
              {submitError && (
                <p role="alert" className="text-sm text-danger">
                  {submitError}
                </p>
              )}
              <Button size="lg" disabled={!canSubmit} onClick={onSubmit}>
                {files.length === 0 ? t("upload.submit.zero") : tn("upload.submit", files.length)}
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
