import type { Applicant, CandidateStage } from "@/types";

export type StageFilter = "all" | CandidateStage;
/** Candidates who passed the job's hard filters, or the ones a filter knocked out. */
export type GroupFilter = "all" | "ranked" | "filteredOut";

export interface ApplicantFilters {
  query: string;
  /** A job id, or "all". */
  jobId: string;
  stage: StageFilter;
  group: GroupFilter;
  lowConfidenceOnly: boolean;
}

export const NO_FILTERS: ApplicantFilters = {
  query: "",
  jobId: "all",
  stage: "all",
  group: "all",
  lowConfidenceOnly: false,
};

export function hasActiveFilters(filters: ApplicantFilters): boolean {
  return (Object.keys(NO_FILTERS) as Array<keyof ApplicantFilters>).some((key) => filters[key] !== NO_FILTERS[key]);
}

function matchesQuery(row: Applicant, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const { cv } = row.candidate;
  return [cv.fullName, cv.fullNameAr ?? "", cv.email, row.jobTitle, ...cv.skills.map((skill) => skill.label)].some((text) =>
    text.toLowerCase().includes(needle),
  );
}

/** Applies every filter except the stage, so the stage chips can show what each stage would return. */
export function filterApplicantsExceptStage(rows: Applicant[], filters: ApplicantFilters): Applicant[] {
  return rows.filter(
    (row) =>
      matchesQuery(row, filters.query) &&
      (filters.jobId === "all" || row.jobId === filters.jobId) &&
      (filters.group === "all" || (filters.group === "filteredOut") === (row.candidate.filteredOut !== null)) &&
      (!filters.lowConfidenceOnly || row.candidate.lowConfidence),
  );
}
