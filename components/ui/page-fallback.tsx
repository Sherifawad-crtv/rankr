"use client";

import { useLocale } from "@/lib/i18n/locale-context";

/** Shown by a page's Suspense boundary while its route parameters resolve. */
export function PageFallback() {
  const { t } = useLocale();
  return (
    <p role="status" className="py-12 text-center text-text-secondary">
      {t("common.loading")}
    </p>
  );
}
