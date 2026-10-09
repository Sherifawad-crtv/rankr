"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, Icon, type IconName } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useLocale } from "@/lib/i18n/locale-context";

const STORAGE_KEY = "rankr-checklist-hidden";

function readHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

interface Step {
  id: "job" | "upload" | "review";
  icon: IconName;
  done: boolean;
  /** Where the step's button goes; null while an earlier step is still missing. */
  href: string | null;
}

interface OnboardingChecklistProps {
  hasJob: boolean;
  hasRun: boolean;
  hasShortlist: boolean;
  /** The job the later steps open, once there is one. */
  firstJobId: string | null;
}

/** First-run guide for non-technical users. Disappears once all three steps are done, or when hidden. */
export function OnboardingChecklist({ hasJob, hasRun, hasShortlist, firstJobId }: OnboardingChecklistProps) {
  const { t } = useLocale();
  const [hidden, setHidden] = useState(readHidden);

  const steps: Step[] = [
    { id: "job", icon: "briefcase", done: hasJob, href: "/jobs/new" },
    { id: "upload", icon: "upload", done: hasRun, href: firstJobId ? `/jobs/${firstJobId}/upload` : null },
    { id: "review", icon: "star", done: hasShortlist, href: hasRun && firstJobId ? `/jobs/${firstJobId}/candidates` : null },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  if (hidden || doneCount === steps.length) return null;

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Not remembering is fine; the checklist just returns next visit.
    }
  }

  return (
    <Card className="flex animate-fade-up flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{t("dashboard.checklist.title")}</h2>
          <p className="text-sm text-text-secondary">
            {t("dashboard.checklist.progress", { done: doneCount, total: steps.length })}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={hide}>
          {t("dashboard.checklist.hide")}
        </Button>
      </div>
      <div
        role="progressbar"
        aria-label={t("dashboard.checklist.title")}
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        className="h-2 overflow-hidden rounded-full bg-subtle"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[var(--ease-soft)]"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ol className="flex flex-col divide-y divide-border-default">
        {steps.map((step) => (
          <li key={step.id} className="flex flex-wrap items-center gap-3 py-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                step.done ? "bg-match/15 text-match" : "bg-primary/10 text-primary",
              )}
            >
              <Icon name={step.done ? "check" : step.icon} variant="bold" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-base font-semibold", step.done ? "text-text-secondary line-through" : "text-text-primary")}>
                {t(`dashboard.checklist.${step.id}.title`)}
              </p>
              <p className="text-sm text-text-secondary">{t(`dashboard.checklist.${step.id}.body`)}</p>
            </div>
            {step.done ? (
              <span className="text-sm font-semibold text-match">{t("dashboard.checklist.done")}</span>
            ) : (
              step.href && (
                <Link href={step.href} className={buttonClass("primary", "sm")}>
                  {t(`dashboard.checklist.${step.id}.action`)}
                </Link>
              )
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
