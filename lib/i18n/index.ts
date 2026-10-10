import type { Locale, LocalizedText } from "@/types";
import { ar } from "./messages/ar";
import { en, type MessageKey } from "./messages/en";

export type { MessageKey };
export type Params = Record<string, string | number>;

/** Keys that have plural forms: "x.one", "x.other" (and Arabic "x.few" etc.) exist, and you pass "x". */
export type PluralKey = MessageKey extends infer K ? (K extends `${infer Base}.other` ? Base : never) : never;

export const LOCALES: Locale[] = ["en", "ar"];
const RTL_LOCALES: Locale[] = ["ar"];

export function directionOf(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** Looks up a message, falling back to English, and fills in {placeholders}. */
export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  const template = (locale === "ar" ? ar[key] : undefined) ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Chooses the plural form for `count` using the locale's rules (English one/other; Arabic has more),
 * falling back to ".other". {count} is filled in automatically.
 */
export function translatePlural(locale: Locale, base: PluralKey, count: number, params?: Params): string {
  const category = new Intl.PluralRules(locale).select(count);
  const messages: Partial<Record<string, string>> = locale === "ar" ? { ...en, ...ar } : en;
  const key = (messages[`${base}.${category}`] ? `${base}.${category}` : `${base}.other`) as MessageKey;
  return translate(locale, key, { count, ...params });
}

/** Picks the right language from text that exists in both, falling back to English. */
export function localize(text: LocalizedText, locale: Locale): string {
  return (locale === "ar" ? text.ar : undefined) ?? text.en;
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(value);
}

/** Date and time such as "2 Jan 2026, 9:00 AM", in the chosen language. */
export function formatDateTime(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", { dateStyle: "medium" }).format(new Date(iso));
}
