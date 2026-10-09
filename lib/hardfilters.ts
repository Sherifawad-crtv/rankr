import { localize, translate } from "@/lib/i18n";
import type { DegreeLevel, HardFilter, Locale } from "@/types";

export function degreeLabel(level: DegreeLevel, locale: Locale = "en"): string {
  return translate(locale, `degree.${level}`);
}

/** Plain-language description of a knock-out rule, shown to recruiters. */
export function describeHardFilter(filter: HardFilter, locale: Locale = "en"): string {
  switch (filter.kind) {
    case "requiredSkills":
      return translate(locale, "filter.requiredSkills", {
        skills: filter.skills.map((skill) => localize(skill.name, locale)).join(", "),
      });
    case "minExperienceYears":
      return translate(locale, "filter.minExperienceYears", { years: filter.years });
    case "minDegree":
      return translate(locale, "filter.minDegree", { degree: degreeLabel(filter.level, locale) });
    case "location":
      return translate(locale, "filter.location", { value: filter.value });
    case "workAuthorization":
      return translate(locale, "filter.workAuthorization");
  }
}
