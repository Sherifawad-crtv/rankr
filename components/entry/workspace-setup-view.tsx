"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Card, ChoiceChips, Icon, Input, StepTransition, type StepDirection } from "@/components/ui";
import { createWorkspace } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { useAccountProfile } from "@/lib/hooks/use-account-profile";
import { COMPANY_SIZES, type AccountProfile, type CompanySize, type PlanSelection } from "@/types";
import { StepProgress } from "./step-progress";

const STEPS = ["Company", "You", "Launch"];

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
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize | null>(null);
  const [fullName, setFullName] = useState(profile.fullName);
  const [jobTitle, setJobTitle] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const companyLabel = companyName.trim() || "Your company";
  const firstName = fullName.trim().split(" ")[0] || "there";

  function validateStep(): Errors {
    const found: Errors = {};
    if (step === 0) {
      if (!companyName.trim()) found.companyName = "What should we call your workspace?";
      if (!companySize) found.companySize = "Pick the closest size.";
    }
    if (step === 1) {
      if (!fullName.trim()) found.fullName = "Enter your name.";
      if (!jobTitle.trim()) found.jobTitle = "Tell us your role.";
    }
    return found;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
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
      await createWorkspace({
        companyName: companyName.trim(),
        companySize: companySize!,
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        plan: selection,
      });
      const next = selection.plan === "enterprise" ? "/invite-team" : "/welcome";
      router.push(`${next}?${planQuery(selection)}`);
    } catch {
      setErrors({ form: "We couldn't create your workspace. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex items-center gap-4">
        <span
          key={companyLabel.charAt(0).toUpperCase()}
          aria-hidden
          className="flex size-14 shrink-0 animate-pop items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-text-inverse shadow-md"
        >
          {companyLabel.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-text-primary">{companyLabel}</p>
          <p className="text-sm text-text-secondary">Your new Rankr workspace</p>
        </div>
      </div>

      <StepProgress steps={STEPS} current={step} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <StepTransition stepKey={step} direction={direction} className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Let&apos;s name your workspace</h1>
                <p className="mt-1 text-base text-text-secondary">
                  This is where your team will rank and review CVs.
                </p>
              </div>
              <Input
                label="Company name"
                autoComplete="organization"
                autoFocus
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                error={errors.companyName}
              />
              <ChoiceChips
                label="Company size"
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
                <h1 className="text-xl font-bold text-text-primary">Nice to meet you!</h1>
                <p className="mt-1 text-base text-text-secondary">
                  A little about you, so colleagues know who&apos;s who.
                </p>
              </div>
              <Input
                label="Your name"
                autoComplete="name"
                autoFocus
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                error={errors.fullName}
              />
              <Input
                label="Your role"
                autoComplete="organization-title"
                placeholder="e.g. HR Manager"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                error={errors.jobTitle}
              />
              <Input label="Work email" value={profile.email} readOnly hint="Verified at sign-up." />
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Ready to launch, {firstName}?
                </h1>
                <p className="mt-1 text-base text-text-secondary">
                  Here&apos;s what we&apos;ll set up. You can change all of this later.
                </p>
              </div>
              <dl className="rounded-md bg-subtle px-4">
                {[
                  ["Company", companyName.trim()],
                  ["Size", `${companySize} people`],
                  ["You", `${fullName.trim()}, ${jobTitle.trim()}`],
                  ["Email", profile.email],
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
              <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" size="lg" loading={submitting}>
            {step < STEPS.length - 1
              ? "Continue"
              : submitting
                ? "Creating workspace…"
                : "Create workspace"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function WorkspaceSetupView({ selection }: { selection: PlanSelection }) {
  const { state, retry } = useAccountProfile();

  if (state.status === "loading") {
    return (
      <p role="status" className="text-center text-text-secondary">
        Getting things ready…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <Icon name="alert" size={28} className="text-danger" />
        <p className="text-base text-text-primary">We couldn&apos;t load your account.</p>
        <Button onClick={retry}>Try again</Button>
        <Link href="/plans" className="text-sm font-medium text-primary hover:underline">
          Back to plans
        </Link>
      </Card>
    );
  }

  return <WorkspaceForm profile={state.data} selection={selection} />;
}
