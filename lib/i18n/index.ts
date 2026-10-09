import type { Locale, LocalizedText } from "@/types";
import { ar } from "./messages/ar";
import { en, type MessageKey } from "./messages/en";

export type { MessageKey };
export type Params = Record<string, string | number>;

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

/** Picks the right language from text that exists in both, falling back to English. */
export function localize(text: LocalizedText, locale: Locale): string {
  return (locale === "ar" ? text.ar : undefined) ?? text.en;
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(value);
}
