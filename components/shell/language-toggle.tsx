"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { flags } from "@/lib/flags";

/** Switches English / Arabic. Hidden until the Arabic UI flag is on; dev builds always show it for RTL testing. */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  if (!flags.arabicUi() && process.env.NODE_ENV === "production") return null;

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="h-8 rounded-md border border-border-default bg-surface px-3 text-sm font-semibold text-text-primary transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-border-focus"
    >
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
