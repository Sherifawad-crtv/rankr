"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ScreeningRun } from "@/types";

const MAX_BANNERS = 3;

/** One banner per run that is still processing, so a recruiter who left the page can find their way back. */
export function RunningBanner({ runs }: { runs: ScreeningRun[] }) {
  const { t } = useLocale();
  const running = runs.filter((run) => run.status === "processing").slice(0, MAX_BANNERS);
  if (running.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {running.map((run) => (
        <div
          key={run.id}
          role="status"
          className="flex animate-fade-up flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3"
        >
          <p className="flex items-center gap-3 text-base font-semibold text-text-primary">
            <Spinner className="text-primary" />
            {t("dashboard.running.title", { job: run.jobTitle, total: run.total })}
          </p>
          <Link href={`/jobs/${run.jobId}/processing`} className={buttonClass("secondary", "sm")}>
            {t("dashboard.running.action")}
          </Link>
        </div>
      ))}
    </div>
  );
}
