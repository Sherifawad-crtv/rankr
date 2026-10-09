"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  ChoiceChips,
  ErrorPanel,
  Icon,
  Input,
  LoadingPanel,
  StepTransition,
  type StepDirection,
} from "@/components/ui";
import { createWorkspace } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { useAccountProfile } from "@/lib/hooks/use-account-profile";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";
import { COMPANY_SIZES, type AccountProfile, type CompanySize, type PlanSelection } from "@/types";
import { StepProgress } from "./step-progress";

const STEP_KEYS = ["workspace.step.company", "workspace.step.you", "workspace.step.launch"] as const;

interface Errors {
  companyName?: string;
  companySize?: string;
  fullName?: string;
  jobTitle?: string;
  form?: string;
}

function WorkspaceForm({
  profile,
  selection,
}: {
  profile: AccountProfile;
  selection: PlanSelection;
}) {
  const router = useRouter();
  const session = useSession();
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize | null>(null);
  const [fullName, setFullName] = useState(profile.fullName);
  const [jobTitle, setJobTitle] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const companyLabel = companyName.trim() || t("workspace.defaultName");
  const firstName = fullName.trim().split(" ")[0] || "there";

  function validateStep(): Errors {
    const found: Errors = {};
    if (step === 0) {
      if (!companyName.trim()) found.companyName = t("workspace.error.name");
      if (!companySize) found.companySize = t("workspace.error.size");
    }
    if (step === 1) {
      if (!fullName.trim()) found.fullName = t("workspace.error.yourName");
      if (!jobTitle.trim()) found.jobTitle = t("workspace.error.role");
    }
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < STEP_KEYS.length - 1) {
      const found = validateStep();
      setErrors(found);
      if (Object.keys(found).length === 0) {
        setDirection("forward");
        setStep(step + 1);
      }
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const admin = await createWorkspace({
        companyName: companyName.trim(),
        companySize: companySize!,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        plan: selection,
      });
      session.signIn(admin);
      const next = selection.plan === "enterprise" ? "/invite-team" : "/welcome";
      router.push(`${next}?${planQuery(selection)}`);
    } catch {
      setErrors({ form: t("workspace.createError") });
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex items-center gap-4">
        <span
          key={companyLabel.charAt(0).toUpperCase()}
          aria-hidden
          className="flex size-14 shrink-0 animate-pop items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-contrast shadow-md"
        >
          {companyLabel.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-text-primary">{companyLabel}</p>
          <p className="text-sm text-text-secondary">{t("workspace.tagline")}</p>
        </div>
      </div>

      <StepProgress steps={STEP_KEYS.map((key) => t(key))} current={step} label={t("workspace.progress")} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <StepTransition stepKey={step} direction={direction} className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div>
                <h1 className="text-xl font-bold text-text-primary">{t("workspace.company.title")}</h1>
                <p className="mt-1 text-base text-text-secondary">
                  {t("workspace.company.subtitle")}
                </p>
              </div>
              <Input
                label={t("workspace.company.name")}
                autoComplete="organization"
                autoFocus
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                error={errors.companyName}
              />
              <ChoiceChips
                label={t("workspace.company.size")}
                options={COMPANY_SIZES}
                value={companySize}
                onChange={setCompanySize}
                error={errors.companySize}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h1 className="text-xl font-bold text-text-primary">{t("workspace.you.title")}</h1>
                <p className="mt-1 text-base text-text-secondary">
                  {t("workspace.you.subtitle")}
                </p>
              </div>
              <Input
                label={t("workspace.you.name")}
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                error={errors.fullName}
              />
              <Input
                label={t("workspace.you.role")}
                autoComplete="organization-title"
                placeholder={t("workspace.you.rolePlaceholder")}
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                error={errors.jobTitle}
              />
              <Input
                label={t("workspace.you.email")}
                value={profile.email}
                readOnly
                hint={t("workspace.you.emailHint")}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {t("workspace.launch.title", { name: firstName })}
                </h1>
                <p className="mt-1 text-base text-text-secondary">
                  {t("workspace.launch.subtitle")}
                </p>
              </div>
              <dl className="rounded-md bg-subtle px-4">
                {[
                  [t("workspace.recap.company"), companyName.trim()],
                  [t("workspace.recap.size"), t("workspace.recap.sizeValue", { size: companySize ?? "" })],
                  [t("workspace.recap.you"), `${fullName.trim()}, ${jobTitle.trim()}`],
                  [t("workspace.recap.email"), profile.email],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-border-default py-3 last:border-b-0"
                  >
                    <dt className="text-base text-text-secondary">{label}</dt>
                    <dd className="text-end text-base text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
              {errors.form && (
                <p role="alert" className="text-sm text-danger">
                  {errors.form}
                </p>
              )}
            </>
          )}
        </StepTransition>

        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={() => {
                setDirection("back");
                setStep(step - 1);
              }}
              disabled={submitting}
            >
              <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> {t("common.back")}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" loading={submitting}>
            {step < STEP_KEYS.length - 1
              ? t("common.continue")
              : submitting
                ? t("workspace.creating")
                : t("workspace.create")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function WorkspaceSetupView({ selection }: { selection: PlanSelection }) {
  const { t } = useLocale();
  const { state, retry } = useAccountProfile();

  if (state.status === "loading") return <LoadingPanel label={t("workspace.loading")} />;
  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorPanel message={t("workspace.profileError")} onRetry={retry} />
        <Link href="/plans" className="text-sm font-semibold text-primary hover:underline">
          {t("workspace.backToPlans")}
        </Link>
      </div>
    );
  }

  return <WorkspaceForm profile={state.data} selection={selection} />;
}
