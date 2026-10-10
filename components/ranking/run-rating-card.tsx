"use client";

import { useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import { track } from "@/lib/analytics";
import { submitRunRating } from "@/lib/api";
import { useLocale } from "@/lib/i18n/locale-context";
import type { RunRating } from "@/types";

type Phase = "asking" | "sending" | "thanks" | "failed";

/** One-tap feedback on the rankings. Not shown again for this job once answered. */
export function RunRatingCard({ jobId }: { jobId: string }) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<Phase>("asking");

  async function rate(rating: RunRating) {
    setPhase("sending");
    try {
      await submitRunRating(jobId, rating);
      track({ name: "run_rated", rating });
      setPhase("thanks");
    } catch {
      setPhase("failed");
    }
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 py-4">
      {phase === "thanks" ? (
        <p role="status" className="animate-fade-up flex items-center gap-2 text-base text-text-primary">
          <Icon name="check" variant="bold" size={18} className="text-match" /> {t("rating.thanks")}
        </p>
      ) : (
        <>
          <p className="text-base font-semibold text-text-primary">{t("rating.question")}</p>
          <div className="flex flex-wrap items-center gap-2">
            {phase === "failed" && (
              <span role="alert" className="text-sm text-danger">
                {t("rating.error")}
              </span>
            )}
            <Button variant="secondary" size="sm" disabled={phase === "sending"} onClick={() => rate("positive")}>
              {t("rating.positive")}
            </Button>
            <Button variant="ghost" size="sm" disabled={phase === "sending"} onClick={() => rate("negative")}>
              {t("rating.negative")}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
