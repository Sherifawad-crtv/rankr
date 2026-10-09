import type { DegreeLevel, HardFilter } from "@/types";

const DEGREE_LABELS: Record<DegreeLevel, string> = {
  none: "No degree required",
  diploma: "Diploma",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  doctorate: "Doctorate",
};

export function degreeLabel(level: DegreeLevel): string {
  return DEGREE_LABELS[level];
}

/** Plain-language description of a knock-out rule, shown to recruiters. TODO(i18n): translate. */
export function describeHardFilter(filter: HardFilter): string {
  switch (filter.kind) {
    case "requiredSkills":
      return `Must have: ${filter.skills.map((skill) => skill.name.en).join(", ")}`;
    case "minExperienceYears":
      return `Minimum ${filter.years} years of experience`;
    case "minDegree":
      return `Minimum ${degreeLabel(filter.level).toLowerCase()}`;
    case "location":
      return `Located in ${filter.value}`;
    case "workAuthorization":
      return "Authorised to work in the job's country";
  }
}
