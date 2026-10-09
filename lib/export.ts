import type { Candidate, LocalizedText, ScoreWeights } from "@/types";
import type { MessageKey } from "@/lib/i18n";
import { candidateConfidence } from "@/lib/confidence";
import type { CsvCell } from "@/lib/csv";
import { matchScore } from "@/lib/scoring";

export type ExportColumnId =
  | "rank"
  | "name"
  | "nameAr"
  | "email"
  | "phone"
  | "match"
  | "skillsScore"
  | "experienceScore"
  | "educationScore"
  | "profileScore"
  | "confidence"
  | "stage"
  | "rationale"
  | "matchedSkills"
  | "missingSkills"
  | "years"
  | "filteredReason";

export interface ExportColumn {
  id: ExportColumnId;
  labelKey: MessageKey;
  defaultOn: boolean;
}

/** Everything a recruiter can put in the file. Only data already on screen: no personal attributes. */
export const EXPORT_COLUMNS: ExportColumn[] = [
  { id: "rank", labelKey: "export.col.rank", defaultOn: true },
  { id: "name", labelKey: "export.col.name", defaultOn: true },
  { id: "nameAr", labelKey: "export.col.nameAr", defaultOn: true },
  { id: "email", labelKey: "export.col.email", defaultOn: true },
  { id: "phone", labelKey: "export.col.phone", defaultOn: false },
  { id: "match", labelKey: "export.col.match", defaultOn: true },
  { id: "skillsScore", labelKey: "export.col.skillsScore", defaultOn: true },
  { id: "experienceScore", labelKey: "export.col.experienceScore", defaultOn: true },
  { id: "educationScore", labelKey: "export.col.educationScore", defaultOn: true },
  { id: "profileScore", labelKey: "export.col.profileScore", defaultOn: true },
  { id: "confidence", labelKey: "export.col.confidence", defaultOn: false },
  { id: "stage", labelKey: "export.col.stage", defaultOn: true },
  { id: "rationale", labelKey: "export.col.rationale", defaultOn: false },
  { id: "matchedSkills", labelKey: "export.col.matchedSkills", defaultOn: true },
  { id: "missingSkills", labelKey: "export.col.missingSkills", defaultOn: true },
  { id: "years", labelKey: "export.col.years", defaultOn: false },
  { id: "filteredReason", labelKey: "export.col.filteredReason", defaultOn: false },
];

export type ExportScope = "shortlisted" | "ranked" | "all";

export interface ExportRow {
  candidate: Candidate;
  /** Position in the ranking; null for candidates filtered out by a hard filter. */
  rank: number | null;
}

/** Picks the candidates for a scope, in ranked order (filtered-out candidates last). */
export function rowsForScope(
  scope: ExportScope,
  ranked: Candidate[],
  filteredOut: Candidate[],
): ExportRow[] {
  const rankedRows = ranked.map((candidate, index) => ({ candidate, rank: index + 1 }));
  if (scope === "shortlisted") return rankedRows.filter((row) => row.candidate.stage === "shortlisted");
  if (scope === "ranked") return rankedRows;
  return [...rankedRows, ...filteredOut.map((candidate) => ({ candidate, rank: null }))];
}

interface Labels {
  t: (key: MessageKey) => string;
  l: (text: LocalizedText) => string;
}

/** Value of one cell. Scores are whole numbers so Excel can sort and chart them. */
export function exportCell(
  id: ExportColumnId,
  row: ExportRow,
  weights: ScoreWeights,
  { t, l }: Labels,
): CsvCell {
  const { candidate, rank } = row;
  switch (id) {
    case "rank":
      return rank ?? "";
    case "name":
      return candidate.cv.fullName;
    case "nameAr":
      return candidate.cv.fullNameAr ?? "";
    case "email":
      return candidate.cv.email;
    case "phone":
      return candidate.cv.phone ?? "";
    case "match":
      return Math.round(matchScore(candidate, weights));
    case "skillsScore":
      return candidate.breakdown.skills;
    case "experienceScore":
      return candidate.breakdown.experience;
    case "educationScore":
      return candidate.breakdown.education;
    case "profileScore":
      return candidate.breakdown.profileQuality;
    case "confidence":
      return t(`confidence.${candidateConfidence(candidate)}`);
    case "stage":
      return t(`stage.${candidate.stage}`);
    case "rationale":
      return candidate.rationale;
    case "matchedSkills":
      return candidate.matchedSkills.map((skill) => l(skill.name)).join("; ");
    case "missingSkills":
      return candidate.missingRequiredSkills.map((skill) => l(skill.name)).join("; ");
    case "years":
      return candidate.cv.experienceYears;
    case "filteredReason":
      return candidate.filteredOut?.reason ?? "";
  }
}
