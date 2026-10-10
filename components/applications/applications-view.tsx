"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { BrandScope } from "@/components/brand/brand-scope";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Button, Card, EmptyPanel, ErrorPanel, Icon, LoadingPanel, useToast } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getJob, getOrgPublicProfile, listCandidates, setAcceptingApplications } from "@/lib/api";
import { jobPublicPath } from "@/lib/careers";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Job, OrgPublicProfile } from "@/types";

function ApplicationsContent({
  initialJob,
  org,
  received,
}: {
  initialJob: Job;
  org: OrgPublicProfile;
  received: number;
}) {
  const { t } = useLocale();
  const toast = useToast();
  const [job, setJob] = useState(initialJob);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const path = jobPublicPath(org.slug, job.slug);
  const url = `${window.location.origin}${path}`;
  const jobOpen = job.status === "open";
  const live = jobOpen && job.acceptingApplications;

  async function toggle() {
    setBusy(true);
    setFailed(false);
    try {
      const next = await setAcceptingApplications(job.id, !job.acceptingApplications);
      setJob(next);
      toast.show(t(next.acceptingApplications ? "applications.toggle.openDone" : "applications.toggle.closeDone"), "match");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.show(t("applications.link.copied"), "match");
    } catch {
      toast.show(t("applications.link.copyError"));
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">{t("applications.status.title")}</h2>
          <Badge tone={live ? "match" : "neutral"}>
            {t(live ? "applications.status.open" : "applications.status.closed")}
          </Badge>
        </div>
        {!jobOpen && <p className="text-sm text-text-secondary">{t("applications.status.jobClosed")}</p>}
        {failed && (
          <p role="alert" className="text-sm text-danger">
            {t("applications.toggle.error")}
          </p>
        )}
        <Button
          className="self-start"
          variant={job.acceptingApplications ? "secondary" : "primary"}
          disabled={!jobOpen}
          loading={busy}
          onClick={toggle}
        >
          {t(job.acceptingApplications ? "applications.toggle.close" : "applications.toggle.open")}
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{t("applications.link.title")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t("applications.link.hint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={url}
            aria-label={t("applications.link.title")}
            onFocus={(event) => event.target.select()}
            className="h-10 min-w-0 flex-1 rounded-md border border-border-default bg-subtle px-3 text-base text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
          />
          <Button variant="secondary" onClick={copy}>
            {t("applications.link.copy")}
          </Button>
          {live && (
            <a href={path} target="_blank" rel="noreferrer" className={buttonClass("ghost", "md")}>
              {t("applications.link.open")}
            </a>
          )}
        </div>
        {!live && <p className="text-sm text-text-secondary">{t("applications.link.inactive")}</p>}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">{t("applications.preview.title")}</h2>
        <BrandScope
          branding={org.branding}
          className="flex flex-col gap-3 rounded-xl border border-border-default bg-canvas p-4"
        >
          <p className="font-display text-base font-bold text-text-primary">{org.branding.name}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-default bg-surface p-4">
            <div>
              <p className="text-base font-semibold text-text-primary">{job.title}</p>
              <p className="text-sm text-text-secondary">{job.location}</p>
            </div>
            <span aria-hidden className="rounded-lg bg-primary px-4 py-2 text-base font-semibold text-primary-contrast">
              {t("careers.job.apply")}
            </span>
          </div>
        </BrandScope>
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{t("applications.how.title")}.</span>{" "}
          {t("applications.how.body")}
        </p>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{t("applications.count")}</p>
          <p className="font-display text-xl font-bold text-text-primary">{received}</p>
        </div>
        <Link href={`/jobs/${job.id}/candidates`} className={buttonClass("secondary", "md")}>
          {t("applications.viewApplicants")}
        </Link>
      </Card>
    </div>
  );
}

export function ApplicationsView({ jobId }: { jobId: string }) {
  const { t } = useLocale();
  const load = useCallback(
    () => Promise.all([getJob(jobId), getOrgPublicProfile(), listCandidates(jobId)]),
    [jobId],
  );
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("applications.loadError")} onRetry={retry} />;
  const [job, org, candidates] = state.data;
  if (!job) return <EmptyPanel icon="alert" title={t("applications.loadError")} action={{ href: "/jobs", label: t("applications.back") }} />;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-text-secondary hover:text-text-primary"
      >
        <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> {t("applications.back")}
      </Link>
      <PageHeader title={t("applications.title")} description={t("applications.subtitle", { job: job.title })} />
      <ApplicationsContent
        initialJob={job}
        org={org}
        received={candidates.filter((candidate) => candidate.source === "application").length}
      />
    </div>
  );
}
