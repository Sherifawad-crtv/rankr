"use client";

import { Button, Checkbox, ChoiceChips, Icon, Select } from "@/components/ui";
import { hasActiveFilters, NO_FILTERS, type ApplicantFilters, type GroupFilter, type StageFilter } from "@/lib/applicants";
import { useLocale } from "@/lib/i18n/locale-context";

const STAGES: StageFilter[] = ["all", "new", "shortlisted", "rejected", "hired"];
const GROUPS: GroupFilter[] = ["all", "ranked", "filteredOut"];

interface ApplicantFiltersProps {
  filters: ApplicantFilters;
  onChange: (filters: ApplicantFilters) => void;
  jobs: Array<{ id: string; title: string }>;
  stageCounts: Record<StageFilter, number>;
}

/** Search, job, group, confidence and stage filters for the Applicants list. */
export function ApplicantFilterBar({ filters, onChange, jobs, stageCounts }: ApplicantFiltersProps) {
  const { t } = useLocale();
  const set = (changes: Partial<ApplicantFilters>) => onChange({ ...filters, ...changes });

  const labelFor = (stage: StageFilter) =>
    stage === "all"
      ? t("ranked.filter.all", { count: stageCounts.all })
      : t("ranked.filter.stageCount", { stage: t(`stage.${stage}`), count: stageCounts[stage] });
  const stageByLabel = Object.fromEntries(STAGES.map((stage) => [labelFor(stage), stage]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-56 flex-1">
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            aria-label={t("applicants.search.label")}
            placeholder={t("applicants.search.placeholder")}
            className="h-10 w-full rounded-lg border border-border-default bg-surface ps-10 pe-3 text-base text-text-primary transition-colors duration-150 placeholder:text-text-disabled hover:border-text-disabled focus-visible:outline-2 focus-visible:outline-border-focus"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select label={t("applicants.filter.job")} value={filters.jobId} onChange={(event) => set({ jobId: event.target.value })}>
            <option value="all">{t("applicants.filter.allJobs")}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select
            label={t("applicants.filter.source")}
            value={filters.source}
            onChange={(event) => set({ source: event.target.value as ApplicantFilters["source"] })}
          >
            <option value="all">{t("applicants.filter.source.all")}</option>
            <option value="upload">{t("source.upload")}</option>
            <option value="application">{t("source.application")}</option>
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select
            label={t("applicants.filter.group")}
            value={filters.group}
            onChange={(event) => set({ group: event.target.value as GroupFilter })}
          >
            {GROUPS.map((group) => (
              <option key={group} value={group}>
                {t(`applicants.filter.group.${group}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          checked={filters.lowConfidenceOnly}
          onChange={(event) => set({ lowConfidenceOnly: event.target.checked })}
          label={t("applicants.filter.lowOnly")}
        />
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={() => onChange(NO_FILTERS)}>
            {t("applicants.filter.clear")}
          </Button>
        )}
      </div>

      <ChoiceChips<string>
        label={t("applicants.filter.stage")}
        options={STAGES.map(labelFor)}
        value={labelFor(filters.stage)}
        onChange={(label) => set({ stage: stageByLabel[label] })}
      />
    </div>
  );
}
