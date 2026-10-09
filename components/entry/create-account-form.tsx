"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleIcon } from "@/components/brand/google-icon";
import { Button, Card, Checkbox, Input, PasswordInput } from "@/components/ui";
import { EmailTakenError, createAccount, signInWithGoogle } from "@/lib/api";
import { MIN_PASSWORD_LENGTH, isValidEmail } from "@/lib/auth";
import { planQuery } from "@/lib/entry-flow";
import { useLocale } from "@/lib/i18n/locale-context";
import type { PlanSelection } from "@/types";
import { PlanSummary } from "./plan-summary";

// TODO(spec): terms/privacy acceptance is not specified.

interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  terms?: string;
  form?: string;
}

export function CreateAccountForm({ selection }: { selection: PlanSelection }) {
  const router = useRouter();
  const { t } = useLocale();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!fullName.trim()) found.fullName = t("account.error.name");
    if (!isValidEmail(email)) found.email = t("auth.error.email");
    if (password.length < MIN_PASSWORD_LENGTH) {
      found.password = t("account.error.password", { min: MIN_PASSWORD_LENGTH });
    }
    if (!terms) found.terms = t("account.error.terms");
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy("email");
    try {
      await createAccount({ fullName: fullName.trim(), email, password, plan: selection });
      const params = new URLSearchParams(planQuery(selection));
      params.set("email", email);
      router.push(`/verify-email?${params.toString()}`);
    } catch (error) {
      setErrors(
        error instanceof EmailTakenError
          ? { email: t("account.error.taken") }
          : { form: t("auth.error.generic") },
      );
      setBusy(null);
    }
  }

  /** Google accounts already have a verified email, so they go straight to checkout. */
  async function onGoogle() {
    setErrors({});
    setBusy("google");
    try {
      await signInWithGoogle();
      router.push(`/checkout?${planQuery(selection)}`);
    } catch {
      setErrors({ form: t("auth.error.google") });
      setBusy(null);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("account.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("account.subtitle")}</p>
      </div>
      <PlanSummary selection={selection} />

      <Button variant="secondary" size="lg" loading={busy === "google"} disabled={busy !== null} onClick={onGoogle}>
        {busy !== "google" && <GoogleIcon />}
        {busy === "google" ? t("auth.google.opening") : t("auth.google")}
      </Button>
      <div className="flex items-center gap-3 text-sm text-text-secondary">
        <span className="h-px flex-1 bg-border-default" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t("account.name")}
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={errors.fullName}
        />
        <Input
          label={t("account.email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <PasswordInput
          label={t("account.password")}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={t("account.passwordHint", { min: MIN_PASSWORD_LENGTH })}
          error={errors.password}
        />
        <div className="flex flex-col gap-1">
          <Checkbox
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            label={t("account.terms")}
          />
          {errors.terms && <p className="animate-fade-up text-sm text-danger">{errors.terms}</p>}
        </div>
        {errors.form && (
          <p role="alert" className="text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" loading={busy === "email"} disabled={busy === "google"}>
          {busy === "email" ? t("account.creating") : t("account.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        {t("funnel.hasAccount")}{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          {t("funnel.signIn")}
        </Link>
      </p>
    </Card>
  );
}
