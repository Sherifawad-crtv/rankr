"use client";

import { Button, Checkbox, ChoiceChips, Disclaimer, Icon } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";
import type { CandidateStage } from "@/types";

export type StageFilter = "all" | CandidateStage;

interface RankedToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  stageFilter: StageFilter;
  onStageFilterChange: (filter: StageFilter) => void;
  stageCounts: Record<StageFilter, number>;
  lowConfidenceOnly: boolean;
  onLowConfidenceOnlyChange: (value: boolean) => void;
  showBreakdown: boolean;
  onShowBreakdownChange: (value: boolean) => void;
  selectedCount: number;
  acting: boolean;
  onAct: (action: "shortlisted" | "rejected" | "new") => void;
  onClearSelection: () => void;
}

const STAGE_ORDER: StageFilter[] = ["all", "new", "shortlisted", "rejected", "hired"];

/**
 * Search and filters above the list, plus a sticky strip (a direct child of the page container, so it can stick) with the human-in-the-loop reminder and,
 * once rows are selected, the Shortlist / Reject actions.
 */
export function RankedToolbar(props: RankedToolbarProps) {
  const { t, tn } = useLocale();

  const labelFor = (filter: StageFilter) =>
    filter === "all"
      ? t("ranked.filter.all", { count: props.stageCounts.all })
      : t("ranked.filter.stageCount", { stage: t(`stage.${filter}`), count: props.stageCounts[filter] });

  const options = STAGE_ORDER.map(labelFor);
  const filterByLabel = Object.fromEntries(STAGE_ORDER.map((filter) => [labelFor(filter), filter]));

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="search"
              value={props.query}
              onChange={(event) => props.onQueryChange(event.target.value)}
              aria-label={t("ranked.search.label")}
              placeholder={t("ranked.search.placeholder")}
              className="h-10 w-full rounded-lg border border-border-default bg-surface ps-10 pe-3 text-base text-text-primary transition-colors duration-150 placeholder:text-text-disabled hover:border-text-disabled focus-visible:outline-2 focus-visible:outline-border-focus"
            />
          </div>
          <Checkbox
            checked={props.lowConfidenceOnly}
            onChange={(event) => props.onLowConfidenceOnlyChange(event.target.checked)}
            label={t("ranked.filter.lowOnly")}
          />
          <Checkbox
            checked={props.showBreakdown}
            onChange={(event) => props.onShowBreakdownChange(event.target.checked)}
            label={t("ranked.breakdown")}
          />
        </div>

        <ChoiceChips<string>
          label={t("ranked.filter.stage")}
          options={options}
          value={labelFor(props.stageFilter)}
          onChange={(label) => props.onStageFilterChange(filterByLabel[label])}
        />
      </div>

      {/* Stays in view while scrolling a long list: the reminder, and the actions for selected rows. */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 bg-canvas/95 px-4 py-2 backdrop-blur lg:-mx-8 lg:px-8">
        <Disclaimer compact />
        {props.selectedCount > 0 && (
          <div
            role="region"
            aria-label={tn("ranked.selected", props.selectedCount)}
            className="flex animate-fade-up flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2"
          >
            <span className="me-auto text-base font-semibold text-text-primary">
              {tn("ranked.selected", props.selectedCount)}
            </span>
            <Button size="sm" loading={props.acting} onClick={() => props.onAct("shortlisted")}>
              <Icon name="star" variant="bold" size={16} /> {t("ranked.action.shortlist")}
            </Button>
            <Button size="sm" variant="secondary" disabled={props.acting} onClick={() => props.onAct("rejected")}>
              {t("ranked.action.reject")}
            </Button>
            <Button size="sm" variant="ghost" disabled={props.acting} onClick={() => props.onAct("new")}>
              {t("ranked.action.reset")}
            </Button>
            <Button size="sm" variant="ghost" onClick={props.onClearSelection}>
              {t("ranked.action.clear")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
