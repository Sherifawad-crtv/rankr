"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Icon, Input } from "@/components/ui";
import { requestPasswordReset } from "@/lib/api";
import { isValidEmail } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/locale-context";

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(t("auth.error.email"));
      return;
    }
    setError(null);
    setSending(true);
    try {
      await requestPasswordReset(email);
      setSentTo(email);
    } catch {
      setError(t("auth.error.generic"));
    } finally {
      setSending(false);
    }
  }

  const backLink = (
    <Link href="/sign-in" className="text-sm font-semibold text-primary hover:underline">
      {t("auth.forgot.back")}
    </Link>
  );

  if (sentTo) {
    return (
      <div className="flex animate-fade-up flex-col items-start gap-5">
        <span className="flex size-14 animate-pop items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="mail" variant="bold" size={28} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{t("auth.forgot.sent.title")}</h1>
          <p className="mt-1 text-base text-text-secondary">{t("auth.forgot.sent.body", { email: sentTo })}</p>
        </div>
        <Button variant="secondary" onClick={() => setSentTo(null)}>
          {t("auth.forgot.sent.other")}
        </Button>
        {backLink}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("auth.forgot.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("auth.forgot.subtitle")}</p>
      </div>
      <Input
        label={t("auth.signIn.email")}
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error ?? undefined}
      />
      <Button type="submit" size="lg" loading={sending}>
        {t("auth.forgot.submit")}
      </Button>
      {backLink}
    </form>
  );
}
