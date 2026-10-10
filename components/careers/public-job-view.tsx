"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Icon, SkillChip } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getPublicJob } from "@/lib/api";
import { careersPath, jobPublicPath } from "@/lib/careers";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { CareersShell } from "./careers-shell";
import { CareersError, CareersLoading, CareersNotFound } from "./careers-states";

/** One role, with a single clear action: apply. */
export function PublicJobView({ orgSlug, jobSlug }: { orgSlug: string; jobSlug: string }) {
  const { t, l } = useLocale();
  const load = useCallback(() => getPublicJob(orgSlug, jobSlug), [orgSlug, jobSlug]);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <CareersLoading />;
  if (state.status === "error") return <CareersError onRetry={retry} />;
  if (state.data === null) return <CareersNotFound />;

  const { org, job } = state.data;
  return (
    <CareersShell org={org}>
      <div className="flex flex-col gap-6">
        <Link
          href={careersPath(org.slug)}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-text-secondary hover:text-text-primary"
        >
          <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> {t("careers.back")}
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{job.title}</h1>
          <p className="mt-1 text-base text-text-secondary">{job.location}</p>
        </div>
        <Link href={`${jobPublicPath(org.slug, job.slug)}/apply`} className={buttonClass("primary", "lg")}>
          {t("careers.job.apply")}
        </Link>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">{t("careers.job.about")}</h2>
          <p className="whitespace-pre-line text-base text-text-primary">{job.description}</p>
        </section>
        {job.skills.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-text-primary">{t("careers.job.skills")}</h2>
            <ul className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <li key={skill.id}>
                  <SkillChip label={l(skill.name)} state="neutral" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </CareersShell>
  );
}
