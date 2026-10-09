"use client";

import { Button } from "@/components/ui";
import { useLocale } from "@/lib/i18n/locale-context";

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  error?: string | null;
  onDiscard: () => void;
  /** Overrides the default "Save changes" label. */
  submitLabel?: string;
}

/** Save and discard buttons for a settings form. Save only lights up once something has changed. */
export function SaveBar({ dirty, saving, error, onDiscard, submitLabel }: SaveBarProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="animate-fade-up text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={!dirty} loading={saving}>
          {saving ? t("settings.saving") : (submitLabel ?? t("settings.save"))}
        </Button>
        {dirty && !saving && (
          <Button type="button" variant="ghost" onClick={onDiscard}>
            {t("settings.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
