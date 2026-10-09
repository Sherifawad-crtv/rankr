"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { stagger } from "@/components/ui/cn";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorPanel,
  Icon,
  LoadingPanel,
} from "@/components/ui";
import { getJob, getPlan, submitCVBatch } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useSession } from "@/lib/session";
import { Dropzone } from "./dropzone";

// TODO(spec): accepted formats and size limit are not specified.
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function fileKey(file: File): string {
  return `${file.name}:${file.size}`;
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadView({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { user } = useSession();
  const load = useCallback(
    () => Promise.all([getJob(jobId), getPlan(user.planMode)]),
    [jobId, user.planMode],
  );
  const { state, retry } = useAsync(load);

  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  function addFiles(incoming: File[]) {
    const accepted: File[] = [];
    const bad: string[] = [];
    for (const file of incoming) {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(extension)) bad.push(`${file.name}: unsupported file type`);
      else if (file.size > MAX_FILE_BYTES) bad.push(`${file.name}: larger than 10 MB`);
      else accepted.push(file);
    }
    setRejected(bad);
    setFiles((current) => {
      const known = new Set(current.map(fileKey));
      return [...current, ...accepted.filter((file) => !known.has(fileKey(file)))];
    });
  }

  if (state.status === "loading") return <LoadingPanel label="Loading…" />;
  if (state.status === "error") {
    return <ErrorPanel message="We couldn't load this job." onRetry={retry} />;
  }

  const [job, plan] = state.data;
  if (!job) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <p className="text-base text-text-primary">We couldn&apos;t find that job.</p>
        <Link href="/jobs" className="text-base font-medium text-primary hover:underline">
          Back to jobs
        </Link>
      </Card>
    );
  }

  const remaining = plan.cvCapacity === null ? null : plan.cvCapacity - plan.cvUsed;
  const overCapacity = remaining !== null && files.length > remaining;
  const canSubmit = files.length > 0 && consent && !overCapacity && !submitting;

  async function onSubmit() {
    setSubmitting(true);
    setSubmitError(false);
    try {
      await submitCVBatch(jobId, files);
      router.push(`/jobs/${jobId}/processing`);
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={`Upload CVs for ${job.title}`} description={job.location} />

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-medium text-text-primary">CV capacity this cycle</p>
          <Badge tone={overCapacity ? "danger" : "neutral"}>
            {plan.cvCapacity === null
              ? `${plan.cvUsed} used · capacity to be confirmed` // TODO(spec): Solo capacity is OPEN
              : `${plan.cvUsed} of ${plan.cvCapacity} used`}
          </Badge>
        </div>
        {plan.cvCapacity !== null && (
          <div
            role="progressbar"
            aria-label="CV capacity used"
            aria-valuemin={0}
            aria-valuemax={plan.cvCapacity}
            aria-valuenow={plan.cvUsed}
            className="h-2 overflow-hidden rounded-full bg-subtle"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[var(--ease-soft)]"
              style={{ width: `${Math.min(100, (plan.cvUsed / plan.cvCapacity) * 100)}%` }}
            />
          </div>
        )}
      </Card>

      <Dropzone
        accept={ACCEPTED_EXTENSIONS.join(",")}
        hint="PDF, DOC or DOCX, up to 10 MB each. Upload as many as you like at once."
        onFiles={addFiles}
      />

      {rejected.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-sm text-danger">
          {rejected.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <Card className="flex flex-col gap-3 p-0">
          <div className="flex items-center justify-between px-6 pt-4">
            <p className="text-base font-medium text-text-primary">
              {files.length} {files.length === 1 ? "CV" : "CVs"} ready
            </p>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Clear all
            </Button>
          </div>
          <ul className="max-h-80 overflow-y-auto border-t border-border-default">
            {files.map((file, index) => (
              <li
                key={fileKey(file)}
                className="animate-stagger flex items-center gap-3 border-b border-border-default px-6 py-2 last:border-b-0"
                style={stagger(index)}
              >
                <Icon name="file" size={18} className="shrink-0 text-text-secondary" />
                <span className="min-w-0 flex-1 truncate text-base text-text-primary">{file.name}</span>
                <span className="text-sm text-text-secondary">{formatSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove ${file.name}`}
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
          This batch has {files.length} CVs but you only have {remaining} left this cycle. Remove{" "}
          {files.length - remaining} or upgrade your plan.
        </p>
      )}

      <Card className="flex flex-col gap-4">
        {/* TODO(spec): consent wording */}
        <Checkbox
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          label="I confirm I have the right to process these CVs and that candidates have been informed."
        />
        <p className="text-sm text-text-secondary">
          Rankr scores CVs to help you decide. It never rejects anyone automatically, and a person
          reviews every candidate.
        </p>
        {submitError && (
          <p role="alert" className="text-sm text-danger">
            We couldn&apos;t start processing. Please try again.
          </p>
        )}
        <Button size="lg" disabled={!canSubmit} loading={submitting} onClick={onSubmit}>
          {submitting ? "Uploading…" : `Process ${files.length || ""} ${files.length === 1 ? "CV" : "CVs"}`}
        </Button>
      </Card>
    </div>
  );
}
