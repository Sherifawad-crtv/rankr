"use client";

import { EmptyPanel, ErrorPanel, LoadingPanel } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";

/** Neutral frame for the moments before we know whose brand to show. */
function Plain({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-3xl px-4 py-12">{children}</main>;
}

export function CareersLoading() {
  const { t } = useLocale();
  return (
    <Plain>
      <LoadingPanel label={t("careers.loading")} />
    </Plain>
  );
}

export function CareersError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale();
  return (
    <Plain>
      <ErrorPanel message={t("careers.loadError")} onRetry={onRetry} />
    </Plain>
  );
}

export function CareersNotFound() {
  const { t } = useLocale();
  return (
    <Plain>
      <EmptyPanel icon="alert" title={t("careers.notFound.title")} description={t("careers.notFound.body")} />
    </Plain>
  );
}
