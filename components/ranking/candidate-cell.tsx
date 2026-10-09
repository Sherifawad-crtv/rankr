"use client";

import Link from "next/link";
import { SkillChip } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Candidate } from "@/types";

const MAX_MATCHED_CHIPS = 3;

/** Name, one-line rationale and the top matched skills for a ranked row. */
export function CandidateCell({ candidate, jobId }: { candidate: Candidate; jobId: string }) {
  const { t, tn, l } = useLocale();
  const matched = candidate.matchedSkills.slice(0, MAX_MATCHED_CHIPS);
  const hiddenMatched = candidate.matchedSkills.length - matched.length;
  const missing = candidate.missingRequiredSkills.length;

  return (
    <div className="flex min-w-56 flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <Link
          href={`/jobs/${jobId}/candidates/${candidate.id}`}
          className="text-base font-semibold text-text-primary hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
        >
          {candidate.cv.fullName}
        </Link>
        {candidate.cv.fullNameAr && (
          <span lang="ar" dir="rtl" className="text-sm text-text-secondary">
            {candidate.cv.fullNameAr}
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm text-text-secondary">{candidate.rationale}</p>
      {(matched.length > 0 || missing > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {matched.map((skill) => (
            <SkillChip key={skill.id} label={l(skill.name)} state="matched" />
          ))}
          {hiddenMatched > 0 && (
            <span className="self-center text-sm text-text-secondary">
              {t("ranked.skills.more", { count: hiddenMatched })}
            </span>
          )}
          {missing > 0 && <SkillChip label={tn("ranked.skills.missing", missing)} state="missing" />}
        </div>
      )}
    </div>
  );
}
