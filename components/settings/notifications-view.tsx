"use client";

import { useCallback, useState, type FormEvent } from "react";
import { ErrorPanel, LoadingPanel, Switch, useToast } from "@/components/ui";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import type { NotificationPreferences } from "@/types";
import { SaveBar } from "./save-bar";
import { SettingsSection } from "./settings-section";

function NotificationsForm({ preferences }: { preferences: NotificationPreferences }) {
  const { t } = useLocale();
  const toast = useToast();
  const [saved, setSaved] = useState(preferences);
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const dirty = draft.runCompleted !== saved.runCompleted || draft.productTips !== saved.productTips;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFailed(false);
    try {
      const next = await updateNotificationPreferences(draft);
      setSaved(next);
      setDraft(next);
      toast.show(t("settings.saved"), "match");
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <SettingsSection title={t("settings.notifications.title")} description={t("settings.notifications.description")}>
        {/* TODO(spec): the full list of notification emails */}
        <Switch
          label={t("settings.notifications.runCompleted")}
          description={t("settings.notifications.runCompletedDesc")}
          checked={draft.runCompleted}
          onChange={(runCompleted) => setDraft({ ...draft, runCompleted })}
        />
        <Switch
          label={t("settings.notifications.productTips")}
          description={t("settings.notifications.productTipsDesc")}
          checked={draft.productTips}
          onChange={(productTips) => setDraft({ ...draft, productTips })}
        />
        <SaveBar
          dirty={dirty}
          saving={saving}
          error={failed ? t("settings.error") : null}
          onDiscard={() => setDraft(saved)}
        />
      </SettingsSection>
    </form>
  );
}

export function NotificationsView() {
  const { t } = useLocale();
  const load = useCallback(() => getNotificationPreferences(), []);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("settings.loadError")} onRetry={retry} />;
  return <NotificationsForm preferences={state.data} />;
}
