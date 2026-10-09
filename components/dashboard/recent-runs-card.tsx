"use client";

import Link from "next/link";
import { Badge, Card, Spinner } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { formatDateTime } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ScreeningRun } from "@/types";

/** Each run is one uploaded batch: how it went, and where to go next. */
export function RecentRunsCard({ runs, className }: { runs: ScreeningRun[]; className?: string }) {
  const { t, tn, locale } = useLocale();
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <h2 className="text-lg font-semibold text-text-primary">{t("dashboard.runs.title")}</h2>
      {runs.length === 0 ? (
        <p className="text-sm text-text-secondary">{t("dashboard.runs.empty")}</p>
      ) : (
        <ul className="flex flex-col">
          {runs.map((run) => (
            <li
              key={run.id}
              className="flex flex-col gap-2 border-t border-border-default py-3 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="truncate text-base font-semibold text-text-primary">{run.jobTitle}</p>
                <p className="text-sm text-text-secondary">{formatDateTime(locale, run.createdAt)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {run.status === "processing" ? (
                  <Badge tone="primary" className="gap-1.5">
                    <Spinner className="size-3" /> {t("dashboard.runs.processing")}
                  </Badge>
                ) : (
                  <Badge tone="match">{t("dashboard.runs.scored", { count: run.scored })}</Badge>
                )}
                {run.failed > 0 && <Badge tone="danger">{tn("dashboard.runs.failed", run.failed)}</Badge>}
                {run.duplicates > 0 && <Badge>{tn("dashboard.runs.duplicates", run.duplicates)}</Badge>}
                <Link
                  href={`/jobs/${run.jobId}/${run.status === "processing" ? "processing" : "candidates"}`}
                  className={cn(buttonClass("ghost", "sm"), "ms-auto")}
                >
                  {run.status === "processing" ? t("dashboard.runs.progress") : t("dashboard.runs.results")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
