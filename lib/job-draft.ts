import {
  DEFAULT_SCORE_WEIGHTS,
  type DegreeLevel,
  type HardFilter,
  type Job,
  type JobInput,
  type JobSkill,
  type ScoreWeights,
} from "@/types";

/** The wizard's working state. Hard filters are toggles here and become typed rules on save. */
export interface JobDraft {
  title: string;
  description: string;
  location: string;
  skills: JobSkill[];
  minExperienceYears: number;
  degreeLevel: DegreeLevel;
  filterRequiredSkills: boolean;
  filterMinExperience: boolean;
  filterMinDegree: boolean;
  filterLocation: boolean;
  filterLocationValue: string;
  filterWorkAuthorization: boolean;
  weights: ScoreWeights;
}

export const EMPTY_DRAFT: JobDraft = {
  title: "",
  description: "",
  location: "",
  skills: [],
  minExperienceYears: 0,
  degreeLevel: "none",
  filterRequiredSkills: false,
  filterMinExperience: false,
  filterMinDegree: false,
  filterLocation: false,
  filterLocationValue: "",
  filterWorkAuthorization: false,
  weights: DEFAULT_SCORE_WEIGHTS,
};

export function jobToDraft(job: Job): JobDraft {
  const has = (kind: HardFilter["kind"]) => job.hardFilters.some((filter) => filter.kind === kind);
  const location = job.hardFilters.find((filter) => filter.kind === "location");
  return {
    title: job.title,
    description: job.description,
    location: job.location,
    skills: job.skills,
    minExperienceYears: job.minExperienceYears,
    degreeLevel: job.degreeLevel,
    filterRequiredSkills: has("requiredSkills"),
    filterMinExperience: has("minExperienceYears"),
    filterMinDegree: has("minDegree"),
    filterLocation: location !== undefined,
    filterLocationValue: location?.kind === "location" ? location.value : "",
    filterWorkAuthorization: has("workAuthorization"),
    weights: job.weights,
  };
}

/** Builds the typed hard-filter rules from the toggles. Filters that can't apply (no skills, no degree) are dropped. */
export function draftHardFilters(draft: JobDraft): HardFilter[] {
  const filters: HardFilter[] = [];
  const required = draft.skills.filter((item) => item.tier === "required").map((item) => item.skill);
  if (draft.filterRequiredSkills && required.length > 0) {
    filters.push({ id: "requiredSkills", kind: "requiredSkills", skills: required });
  }
  if (draft.filterMinExperience && draft.minExperienceYears > 0) {
    filters.push({ id: "minExperienceYears", kind: "minExperienceYears", years: draft.minExperienceYears });
  }
  if (draft.filterMinDegree && draft.degreeLevel !== "none") {
    filters.push({ id: "minDegree", kind: "minDegree", level: draft.degreeLevel });
  }
  if (draft.filterLocation && draft.filterLocationValue.trim()) {
    filters.push({ id: "location", kind: "location", value: draft.filterLocationValue.trim() });
  }
  if (draft.filterWorkAuthorization) {
    filters.push({ id: "workAuthorization", kind: "workAuthorization" });
  }
  return filters;
}

export function draftToInput(draft: JobDraft): JobInput {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    skills: draft.skills,
    minExperienceYears: draft.minExperienceYears,
    degreeLevel: draft.degreeLevel,
    hardFilters: draftHardFilters(draft),
    weights: draft.weights,
  };
}
