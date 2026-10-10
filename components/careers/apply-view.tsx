"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { Button, Checkbox, Icon, Input } from "@/components/ui";
import { Field } from "@/components/ui/field";
import { ApplicationsClosedError, getPublicJob, submitApplication } from "@/lib/api";
import { isValidEmail } from "@/lib/auth";
import { jobPublicPath } from "@/lib/careers";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { ACCEPTED_CV_EXTENSIONS, MAX_CV_BYTES } from "@/lib/limits";
import { CareersShell } from "./careers-shell";
import { CareersError, CareersLoading, CareersNotFound } from "./careers-states";

interface Errors {
  fullName?: string;
  email?: string;
  cv?: string;
  consent?: string;
  form?: string;
}

function extensionOf(name: string): string {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

/** The application form: name, email, phone, CV and an unticked consent box. Nothing else is collected. */
export function ApplyView({ orgSlug, jobSlug }: { orgSlug: string; jobSlug: string }) {
  const { t } = useLocale();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const load = useCallback(() => getPublicJob(orgSlug, jobSlug), [orgSlug, jobSlug]);
  const { state, retry } = useAsync(load);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (state.status === "loading") return <CareersLoading />;
  if (state.status === "error") return <CareersError onRetry={retry} />;
  if (state.data === null) return <CareersNotFound />;

  const { org, job } = state.data;
  const company = org.branding.name;

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_CV_EXTENSIONS.includes(extensionOf(file.name))) {
      setCv(null);
      setErrors((current) => ({ ...current, cv: t("apply.error.cvType") }));
    } else if (file.size > MAX_CV_BYTES) {
      setCv(null);
      setErrors((current) => ({ ...current, cv: t("apply.error.cvSize") }));
    } else {
      setCv(file);
      setErrors((current) => ({ ...current, cv: undefined }));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!fullName.trim()) found.fullName = t("apply.error.name");
    if (!isValidEmail(email.trim())) found.email = t("apply.error.email");
    if (!cv) found.cv = errors.cv ?? t("apply.error.cv");
    if (!consent) found.consent = t("apply.error.consent");
    setErrors(found);
    if (Object.keys(found).length > 0 || !cv) return;

    setSubmitting(true);
    try {
      await submitApplication(orgSlug, jobSlug, { fullName, email, phone, cv, consent: true });
      router.push(`${jobPublicPath(orgSlug, jobSlug)}/submitted`);
    } catch (error) {
      setErrors({ form: error instanceof ApplicationsClosedError ? t("apply.error.closed") : t("apply.error.generic") });
      setSubmitting(false);
    }
  }

  return (
    <CareersShell org={org}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div>
          <Link
            href={jobPublicPath(orgSlug, jobSlug)}
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            <Icon name="chevron-right" size={16} className="rotate-180 rtl:rotate-0" /> {job.title}
          </Link>
          <h1 className="text-xl font-bold text-text-primary">{t("apply.title", { job: job.title })}</h1>
          <p className="mt-1 text-base text-text-secondary">
            {t("apply.subtitle", { company, location: job.location })}
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface p-6">
          <Input
            label={t("apply.name")}
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            error={errors.fullName}
          />
          <Input
            label={t("apply.email")}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
          <Input
            label={t("apply.phone")}
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Field label={t("apply.cv")} hint={t("apply.cvHint")} error={errors.cv}>
            {({ id, describedBy }) => (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInput}
                  id={id}
                  type="file"
                  accept={ACCEPTED_CV_EXTENSIONS.join(",")}
                  aria-describedby={describedBy}
                  className="sr-only"
                  onChange={(event) => {
                    onFile(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
                  <Icon name="upload" size={18} /> {cv ? t("apply.cvChange") : t("apply.cvChoose")}
                </Button>
                {cv && <span className="min-w-0 truncate text-base text-text-primary">{cv.name}</span>}
              </div>
            )}
          </Field>
          <p className="text-sm text-text-secondary">{t("apply.privacy")}</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* TODO(spec): consent wording */}
          <Checkbox
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            label={t("apply.consent", { company })}
          />
          {errors.consent && (
            <p role="alert" className="text-sm text-danger">
              {errors.consent}
            </p>
          )}
          <p className="text-sm text-text-secondary">{t("apply.consentNote")}</p>
        </div>

        {errors.form && (
          <p role="alert" className="text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" loading={submitting} className="self-start">
          {submitting ? t("apply.submitting") : t("apply.submit")}
        </Button>
      </form>
    </CareersShell>
  );
}
