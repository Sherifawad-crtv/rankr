"use client";

import { useMemo, useState } from "react";
import { Button, Checkbox, ChoiceChips, Dialog, Disclaimer, Icon, useToast } from "@/components/ui";
import { track } from "@/lib/analytics";
import { downloadCsv, slugify, toCsv } from "@/lib/csv";
import {
  EXPORT_COLUMNS,
  exportCell,
  rowsForScope,
  type ExportColumnId,
  type ExportScope,
} from "@/lib/export";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Candidate, ScoreWeights } from "@/types";

const STORAGE_KEY = "rankr-export-columns";
const SCOPES: ExportScope[] = ["shortlisted", "ranked", "all"];

const DEFAULT_COLUMNS = EXPORT_COLUMNS.filter((column) => column.defaultOn).map((column) => column.id);

/** Remembers the recruiter's last column choice, since the same sheet is often exported again. */
function readSavedColumns(): ExportColumnId[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved)) {
      const valid = EXPORT_COLUMNS.map((column) => column.id).filter((id) => saved.includes(id));
      if (valid.length > 0) return valid;
    }
  } catch {
    // Storage can be blocked or hold something unexpected; fall back to the defaults.
  }
  return DEFAULT_COLUMNS;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
  ranked: Candidate[];
  filteredOut: Candidate[];
  /** The weights currently on screen, so the file matches what the recruiter sees. */
  weights: ScoreWeights;
}

export function ExportDialog({ open, onClose, jobTitle, ranked, filteredOut, weights }: ExportDialogProps) {
  const { t, tn, l } = useLocale();
  const toast = useToast();
  const [chosenScope, setChosenScope] = useState<ExportScope | null>(null);
  const [columns, setColumns] = useState<ExportColumnId[]>(readSavedColumns);
  const [error, setError] = useState(false);

  const counts: Record<ExportScope, number> = useMemo(
    () => ({
      shortlisted: ranked.filter((candidate) => candidate.stage === "shortlisted").length,
      ranked: ranked.length,
      all: ranked.length + filteredOut.length,
    }),
    [ranked, filteredOut],
  );

  const scope = chosenScope ?? (counts.shortlisted > 0 ? "shortlisted" : "ranked");
  const rows = rowsForScope(scope, ranked, filteredOut);
  const selected = EXPORT_COLUMNS.filter((column) => columns.includes(column.id));
  const canExport = rows.length > 0 && selected.length > 0;

  const scopeLabel = (item: ExportScope) => t(`export.scope.${item}`, { count: counts[item] });
  const scopeByLabel = Object.fromEntries(SCOPES.map((item) => [scopeLabel(item), item]));

  function toggle(id: ExportColumnId, checked: boolean) {
    setColumns((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));
  }

  function download() {
    setError(false);
    try {
      const csv = toCsv(
        selected.map((column) => t(column.labelKey)),
        rows.map((row) => selected.map((column) => exportCell(column.id, row, weights, { t, l }))),
      );
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`rankr-${slugify(jobTitle)}-${date}.csv`, csv);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
      } catch {
        // Not being able to remember the choice is fine.
      }
      track({ name: "csv_exported", rows: rows.length, columns: selected.length });
      toast.show(tn("export.toast", rows.length), "match");
      onClose();
    } catch {
      setError(true);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={t("export.title")}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-text-secondary">{t("export.hint")}</p>
        <Disclaimer compact />

        <ChoiceChips<string>
          label={t("export.scope")}
          options={SCOPES.map(scopeLabel)}
          value={scopeLabel(scope)}
          onChange={(label) => setChosenScope(scopeByLabel[label])}
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="flex w-full items-center justify-between gap-3 text-sm font-semibold text-text-primary">
            {t("export.columns")}
            <span className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setColumns(EXPORT_COLUMNS.map((c) => c.id))}>
                {t("export.selectAll")}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setColumns([])}>
                {t("export.selectNone")}
              </Button>
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXPORT_COLUMNS.map((column) => (
              <Checkbox
                key={column.id}
                checked={columns.includes(column.id)}
                onChange={(event) => toggle(column.id, event.target.checked)}
                label={t(column.labelKey)}
              />
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {t("export.error")}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4">
          <p role="status" className="text-sm text-text-secondary">
            {rows.length === 0
              ? t("export.empty")
              : tn("export.summary", rows.length, { columns: selected.length })}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button disabled={!canExport} onClick={download}>
              <Icon name="download" size={18} /> {t("export.confirm")}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
