"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, ErrorPanel, Icon, Skeleton } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getCandidateCvLink } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import type { CvLink } from "@/types";

/** Counts down the link's lifetime and flips to "expired" when it runs out. Remounts for each new link. */
function LinkPanel({ link, onRefresh }: { link: CvLink; onRefresh: () => void }) {
  const { t } = useLocale();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), link.expiresInSeconds * 1000);
    return () => clearTimeout(timer);
  }, [link.expiresInSeconds]);

  if (expired) {
    return (
      <div className="flex animate-fade-up flex-col gap-3">
        <p role="status" className="flex items-start gap-2 text-sm text-text-secondary">
          <Icon name="clock" variant="bold" size={18} className="mt-0.5 text-warning" />
          {t("detail.cv.expired")}
        </p>
        <Button variant="secondary" onClick={onRefresh}>
          <Icon name="refresh" size={18} /> {t("detail.cv.refresh")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass("secondary", "md")}
      >
        <Icon name="file" size={18} /> {t("detail.cv.open")}
      </a>
      <p className="text-sm text-text-secondary">
        {t("detail.cv.valid", { minutes: Math.round(link.expiresInSeconds / 60) })}
      </p>
    </div>
  );
}

/** Opens the original CV through a private, short-lived link. */
export function CvLinkCard({ candidateId }: { candidateId: string }) {
  const { t } = useLocale();
  const load = useCallback(() => getCandidateCvLink(candidateId), [candidateId]);
  const { state, retry } = useAsync(load);

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text-primary">{t("detail.cv.title")}</h2>
      {state.status === "loading" && <Skeleton className="h-10 w-full" />}
      {state.status === "error" && <ErrorPanel message={t("detail.cv.error")} onRetry={retry} />}
      {state.status === "ready" && <LinkPanel link={state.data} onRefresh={retry} />}
    </Card>
  );
}
