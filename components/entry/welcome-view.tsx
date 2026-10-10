"use client";

import Link from "next/link";
import { Card, Icon } from "@/components/ui";
import { buttonClass } from "@/components/ui/button";
import { getWorkspace } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";

/** The last step: a short celebration, then straight into the product. */
export function WelcomeView({ invited }: { invited: number }) {
  const { t, tn } = useLocale();
  const { user } = useSession();
  const { state } = useAsync(getWorkspace);
  const company = state.status === "ready" ? state.data?.companyName : undefined;

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-10 text-center">
      <span className="flex size-24 animate-pop items-center justify-center rounded-full bg-match/15 text-match">
        <Icon name="check" variant="bold" size={52} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-text-primary">
          {t("welcome.title", { name: user.name.split(" ")[0] })}
        </h1>
        <p className="text-base text-text-secondary">
          {company ? t("welcome.subtitle", { company }) : t("welcome.subtitleNoCompany")}
        </p>
        {invited > 0 && <p className="text-sm text-text-secondary">{tn("welcome.invited", invited)}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/jobs/new" className={buttonClass("primary", "lg")}>
          <Icon name="plus" size={18} /> {t("welcome.createJob")}
        </Link>
        <Link href="/dashboard" className={buttonClass("secondary", "lg")}>
          {t("welcome.dashboard")}
        </Link>
      </div>
    </Card>
  );
}
