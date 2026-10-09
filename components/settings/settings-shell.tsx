"use client";

import type { ReactNode } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { useLocale } from "@/lib/i18n/locale-context";
import { SettingsNav } from "./settings-nav";

export function SettingsShell({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.subtitle")} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <SettingsNav />
        <div className="flex min-w-0 max-w-2xl flex-col gap-6">{children}</div>
      </div>
    </>
  );
}
