"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import type { MessageKey } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n/locale-context";

/** Shown when a funnel screen is opened without a chosen plan in the URL. */
export function NoPlanNotice({ messageKey }: { messageKey: MessageKey }) {
  const { t } = useLocale();
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <p className="text-base text-text-primary">{t(messageKey)}</p>
      <Link href="/plans" className="text-base font-semibold text-primary hover:underline">
        {t("plans.view")}
      </Link>
    </Card>
  );
}
