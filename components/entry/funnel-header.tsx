"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { useLocale } from "@/lib/i18n/locale-context";
import type { MessageKey } from "@/lib/i18n";
import { StepProgress } from "./step-progress";

const STEPS: Array<{ path: string; labelKey: MessageKey; enterpriseOnly?: boolean }> = [
  { path: "/plans", labelKey: "funnel.step.plans" },
  { path: "/create-account", labelKey: "funnel.step.account" },
  { path: "/verify-email", labelKey: "funnel.step.verify" },
  { path: "/checkout", labelKey: "funnel.step.payment" },
  { path: "/workspace-setup", labelKey: "funnel.step.workspace" },
  { path: "/invite-team", labelKey: "funnel.step.team", enterpriseOnly: true },
  { path: "/welcome", labelKey: "funnel.step.welcome" },
];

/** Top bar of the sign-up screens: logo, sign-in link, and where you are in the steps. */
export function FunnelHeader() {
  const { t } = useLocale();
  const pathname = usePathname();
  const params = useSearchParams();

  // Solo accounts skip the team step; before a plan is chosen, show every step.
  const soloOnly = params.get("plan") === "solo";
  const steps = STEPS.filter((step) => !(step.enterpriseOnly && soloOnly));
  const current = steps.findIndex((step) => step.path === pathname);

  return (
    <header className="border-b border-border-default bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8">
        <Logo height={26} />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <p className="text-sm text-text-secondary">
            <span className="max-sm:hidden">{t("funnel.hasAccount")} </span>
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">
              {t("funnel.signIn")}
            </Link>
          </p>
        </div>
      </div>
      {current >= 0 && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-4 lg:px-8">
          <StepProgress steps={steps.map((step) => t(step.labelKey))} current={current} label={t("funnel.progress")} />
        </div>
      )}
    </header>
  );
}
