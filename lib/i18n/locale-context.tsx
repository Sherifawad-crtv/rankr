"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale, LocalizedText } from "@/types";
import { directionOf, localize, translate, type MessageKey, type Params } from "./index";

const STORAGE_KEY = "rankr-locale";
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readStoredLocale(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked; the choice then lasts until reload.
  }
  listeners.forEach((listener) => listener());
}

interface LocaleValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Params) => string;
  /** Picks the right language from bilingual content such as skill names. */
  l: (text: LocalizedText) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

/**
 * Holds the chosen language, remembered in localStorage.
 * TODO(i18n): read the language on the server (cookie) to avoid a brief left-to-right flash for Arabic users.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, () => "en" as Locale);
  const dir = directionOf(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const t = useCallback((key: MessageKey, params?: Params) => translate(locale, key, params), [locale]);
  const l = useCallback((text: LocalizedText) => localize(text, locale), [locale]);

  const value = useMemo(() => ({ locale, dir, setLocale: storeLocale, t, l }), [locale, dir, t, l]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
