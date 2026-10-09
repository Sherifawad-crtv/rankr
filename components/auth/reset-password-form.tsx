"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Icon, PasswordInput } from "@/components/ui";
import { ExpiredLinkError, resetPassword } from "@/lib/api";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { buttonClass } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

type Outcome = "form" | "done" | "expired";

/** Landing page for the emailed reset link. `token` comes from the link; a missing one counts as expired. */
export function ResetPasswordForm({ token }: { token: string | null }) {
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(token ? "form" : "expired");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    if (password.length < MIN_PASSWORD_LENGTH) found.password = t("auth.reset.error.short", { min: MIN_PASSWORD_LENGTH });
    else if (confirm !== password) found.confirm = t("auth.reset.error.mismatch");
    setErrors(found);
    if (Object.keys(found).length > 0 || !token) return;

    setSaving(true);
    try {
      await resetPassword({ token, password });
      setOutcome("done");
    } catch (error) {
      if (error instanceof ExpiredLinkError) setOutcome("expired");
      else setErrors({ form: t("auth.error.generic") });
      setSaving(false);
    }
  }

  if (outcome === "done") {
    return (
      <div className="flex animate-fade-up flex-col items-start gap-5">
        <span className="flex size-14 animate-pop items-center justify-center rounded-full bg-match/15 text-match">
          <Icon name="check" variant="bold" size={28} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t("auth.reset.done.title")}</h1>
          <p className="mt-1 text-base text-text-secondary">{t("auth.reset.done.body")}</p>
        </div>
        <Link href="/sign-in" className={buttonClass("primary", "lg")}>
          {t("auth.reset.done.action")}
        </Link>
      </div>
    );
  }

  if (outcome === "expired") {
    return (
      <div className="flex animate-fade-up flex-col items-start gap-5">
        <span className="flex size-14 animate-pop items-center justify-center rounded-full bg-warning/10 text-warning">
          <Icon name="clock" variant="bold" size={28} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t("auth.reset.expired.title")}</h1>
          <p className="mt-1 text-base text-text-secondary">{t("auth.reset.expired.body")}</p>
        </div>
        <Link href="/forgot-password" className={buttonClass("primary", "lg")}>
          {t("auth.reset.expired.action")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("auth.reset.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("auth.reset.subtitle", { min: MIN_PASSWORD_LENGTH })}</p>
      </div>
      <PasswordInput
        label={t("auth.reset.password")}
        autoComplete="new-password"
        autoFocus
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <PasswordInput
        label={t("auth.reset.confirm")}
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm}
      />
      {errors.form && (
        <p role="alert" className="text-sm text-danger">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" loading={saving}>
        {t("auth.reset.submit")}
      </Button>
    </form>
  );
}
