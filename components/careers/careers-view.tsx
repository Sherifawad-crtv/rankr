"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Card, EmptyPanel } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getCareersPage } from "@/lib/api";
import { jobPublicPath } from "@/lib/careers";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { CareersShell } from "./careers-shell";
import { CareersError, CareersLoading, CareersNotFound } from "./careers-states";

/** A company's list of open roles. */
export function CareersView({ orgSlug }: { orgSlug: string }) {
  const { t } = useLocale();
  const load = useCallback(() => getCareersPage(orgSlug), [orgSlug]);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <CareersLoading />;
  if (state.status === "error") return <CareersError onRetry={retry} />;
  if (state.data === null) return <CareersNotFound />;

  const { org, jobs } = state.data;
  return (
    <CareersShell org={org}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t("careers.title", { company: org.branding.name })}</h1>
          <p className="mt-1 text-base text-text-secondary">{t("careers.subtitle")}</p>
        </div>
        {jobs.length === 0 ? (
          <EmptyPanel icon="briefcase" title={t("careers.empty.title")} description={t("careers.empty.body")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {jobs.map((job) => (
              <li key={job.slug}>
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-text-primary">{job.title}</h2>
                    <p className="text-sm text-text-secondary">{job.location}</p>
                  </div>
                  <Link href={jobPublicPath(org.slug, job.slug)} className={buttonClass("secondary", "md")}>
                    {t("careers.viewRole")}
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CareersShell>
  );
}
