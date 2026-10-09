"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Checkbox } from "./checkbox";
import { cn } from "./cn";
import { Icon } from "./icons";
import { Table, Td, Th } from "./table";

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable by this value. */
  sortValue?: (row: T) => string | number;
  align?: "start" | "end";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  /** Plain-text name for a row, used in the select checkbox's accessible label. */
  getRowLabel?: (row: T) => string;
  defaultSort?: { columnId: string; direction: "asc" | "desc" };
  /** Provide both to turn on row selection. */
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  emptyMessage?: string;
}

type Direction = "asc" | "desc";

function compare(a: string | number, b: string | number): number {
  return typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
}

/** Sortable, optionally selectable table. Headers are buttons; the sorted column announces `aria-sort`. */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  getRowLabel,
  defaultSort,
  selectedIds,
  onSelectionChange,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useLocale();
  const [sort, setSort] = useState<{ columnId: string; direction: Direction } | null>(defaultSort ?? null);
  const selectable = selectedIds !== undefined && onSelectionChange !== undefined;
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const sorted = useMemo(() => {
    const column = columns.find((item) => item.id === sort?.columnId);
    if (!sort || !column?.sortValue) return rows;
    const getValue = column.sortValue;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => factor * compare(getValue(a), getValue(b)));
  }, [rows, columns, sort]);

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(getRowId(row)));
  const someSelected = !allSelected && rows.some((row) => selected.has(getRowId(row)));
  const headRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = someSelected;
  }, [someSelected]);

  function toggleSort(columnId: string) {
    setSort((current) =>
      current?.columnId === columnId
        ? { columnId, direction: current.direction === "asc" ? "desc" : "asc" }
        : { columnId, direction: "asc" },
    );
  }

  function toggleRow(id: string) {
    if (!onSelectionChange) return;
    onSelectionChange(selected.has(id) ? [...selected].filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <Table>
      <thead>
        <tr>
          {selectable && (
            <Th className="w-10">
              <Checkbox
                ref={headRef}
                checked={allSelected}
                onChange={() => onSelectionChange(allSelected ? [] : rows.map(getRowId))}
                label={<span className="sr-only">{t("table.selectAll")}</span>}
              />
            </Th>
          )}
          {columns.map((column) => {
            const active = sort?.columnId === column.id;
            return (
              <Th
                key={column.id}
                aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                className={cn(column.align === "end" && "text-end")}
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column.id)}
                    className="inline-flex items-center gap-1 font-semibold hover:text-text-primary focus-visible:outline-2 focus-visible:outline-border-focus"
                  >
                    {column.header}
                    <Icon
                      name="chevron-down"
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        active ? "text-primary" : "opacity-30",
                        active && sort.direction === "asc" && "rotate-180",
                      )}
                    />
                  </button>
                ) : (
                  column.header
                )}
              </Th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 && (
          <tr>
            <Td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center text-text-secondary">
              {emptyMessage ?? "Nothing to show."}
            </Td>
          </tr>
        )}
        {sorted.map((row) => {
          const id = getRowId(row);
          return (
            <tr
              key={id}
              className={cn("transition-colors hover:bg-subtle/60", selected.has(id) && "bg-primary/5")}
            >
              {selectable && (
                <Td>
                  <Checkbox
                    checked={selected.has(id)}
                    onChange={() => toggleRow(id)}
                    label={
                      <span className="sr-only">
                        {t("table.selectRow", { name: getRowLabel ? getRowLabel(row) : id })}
                      </span>
                    }
                  />
                </Td>
              )}
              {columns.map((column) => (
                <Td key={column.id} className={cn(column.align === "end" && "text-end")}>
                  {column.cell(row)}
                </Td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
