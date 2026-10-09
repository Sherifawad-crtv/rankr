export type CsvCell = string | number;

/** Cells that start with these characters can be run as formulas by Excel and Sheets. */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * Makes one cell safe for CSV. Text is quoted when it contains a comma, quote or line break.
 * Text that could be read as a formula is prefixed with an apostrophe (CSV injection guard),
 * since candidate names and skills come from untrusted CVs. Numbers are left alone.
 */
export function escapeCell(value: CsvCell): string {
  if (typeof value === "number") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Builds the file text. Starts with a UTF-8 byte-order mark so Excel reads Arabic correctly,
 * and uses CRLF line endings as Excel expects.
 */
export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** Keeps letters (including Arabic) and digits, so the file name stays readable. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "export"
  );
}

/** Saves text as a file in the browser. */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
