"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import { resendVerificationEmail, verifyEmail } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import { useLocale } from "@/lib/i18n/locale-context";
import type { PlanSelection } from "@/types";

// TODO(spec): link vs code verification, and the resend cooldown, are not specified.
const RESEND_COOLDOWN_SECONDS = 30;

type ResendState = "idle" | "sending" | "sent" | "error";

export function VerifyEmailView({ email, selection }: { email: string; selection: PlanSelection }) {
  const router = useRouter();
  const { t } = useLocale();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resend, setResend] = useState<ResendState>("idle");
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onResend() {
    setResend("sending");
    try {
      await resendVerificationEmail(email);
      setResend("sent");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setResend("error");
    }
  }

  async function onSimulateLink() {
    setSimulating(true);
    await verifyEmail("mock-token");
    router.push(`/checkout?${planQuery(selection)}`);
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <span className="flex size-14 animate-pop items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="mail" variant="bold" size={28} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-text-primary">{t("verify.title")}</h1>
        <p className="text-base text-text-secondary">
          {t("verify.before")} <span className="font-semibold text-text-primary">{email}</span>. {t("verify.after")}
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <Button
          variant="secondary"
          className="w-full"
          disabled={cooldown > 0 || resend === "sending"}
          onClick={onResend}
        >
          {resend === "sending"
            ? t("verify.sending")
            : cooldown > 0
              ? t("verify.resendIn", { seconds: cooldown })
              : t("verify.resend")}
        </Button>
        <p role="status" className="min-h-5 text-sm text-text-secondary">
          {resend === "sent" && t("verify.sent")}
        </p>
        {resend === "error" && (
          <p role="alert" className="text-sm text-danger">
            {t("verify.resendError")}
          </p>
        )}
      </div>

      <Link
        href={`/create-account?${planQuery(selection)}`}
        className="text-sm font-semibold text-primary hover:underline"
      >
        {t("verify.different")}
      </Link>

      {process.env.NODE_ENV !== "production" && (
        <Button variant="ghost" size="sm" disabled={simulating} onClick={onSimulateLink}>
          Dev: simulate clicking the email link
        </Button>
      )}
    </Card>
  );
}
