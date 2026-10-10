"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Card, Icon } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getPublicJob } from "@/lib/api";
import { careersPath } from "@/lib/careers";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { CareersShell } from "./careers-shell";
import { CareersError, CareersLoading, CareersNotFound } from "./careers-states";

/** Confirmation. Applicants see that it was received, never scores or rankings. */
export function SubmittedView({ orgSlug, jobSlug }: { orgSlug: string; jobSlug: string }) {
  const { t } = useLocale();
  const load = useCallback(() => getPublicJob(orgSlug, jobSlug), [orgSlug, jobSlug]);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <CareersLoading />;
  if (state.status === "error") return <CareersError onRetry={retry} />;
  if (state.data === null) return <CareersNotFound />;

  const { org, job } = state.data;
  return (
    <CareersShell org={org}>
      <Card className="mx-auto flex max-w-md animate-fade-up flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-match/15 text-match">
          <Icon name="check" variant="bold" size={28} />
        </span>
        <h1 className="text-xl font-bold text-text-primary">{t("submitted.title")}</h1>
        <p className="text-base text-text-secondary">
          {t("submitted.body", { job: job.title, company: org.branding.name })}
        </p>
        <Link href={careersPath(org.slug)} className={buttonClass("secondary", "md")}>
          {t("submitted.more")}
        </Link>
      </Card>
    </CareersShell>
  );
}
