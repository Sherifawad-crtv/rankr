"use client";

import Link from "next/link";
import { Card, ConfidenceIndicator, Disclaimer, MatchScore } from "@/components/ui";
import { stagger } from "@/components/ui/cn";
import { useLocale } from "@/lib/i18n/locale-context";
import type { TopMatch } from "@/types";

/** The answer-first strip for busy founders: the best candidates across open jobs, one click from their detail. */
export function TopMatches({ matches }: { matches: TopMatch[] }) {
  const { t } = useLocale();
  return (
    <section aria-labelledby="top-matches-heading" className="flex flex-col gap-3">
      <div>
        <h2 id="top-matches-heading" className="text-lg font-semibold text-text-primary">
          {t("dashboard.top.title")}
        </h2>
        <p className="text-sm text-text-secondary">{t("dashboard.top.hint")}</p>
      </div>
      {matches.length === 0 ? (
        <Card className="text-sm text-text-secondary">{t("dashboard.top.empty")}</Card>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match, index) => (
              <li key={match.candidateId} className="animate-stagger" style={stagger(index)}>
                <Link
                  href={`/jobs/${match.jobId}/candidates/${match.candidateId}`}
                  className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                >
                  <Card interactive className="flex items-center gap-4">
                    <MatchScore value={match.matchPercent} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-text-primary">{match.fullName}</p>
                      <p className="truncate text-sm text-text-secondary">{match.jobTitle}</p>
                      {match.lowConfidence && <ConfidenceIndicator level="low" />}
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <Disclaimer compact />
        </>
      )}
    </section>
  );
}
