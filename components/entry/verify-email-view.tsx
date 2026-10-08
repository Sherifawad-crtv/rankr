"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Icon } from "@/components/ui";
import { resendVerificationEmail, verifyEmail } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import type { PlanSelection } from "@/types";

// TODO(spec): link vs code verification, and the resend cooldown, are not specified.
const RESEND_COOLDOWN_SECONDS = 30;

type ResendState = "idle" | "sending" | "sent" | "error";

export function VerifyEmailView({ email, selection }: { email: string; selection: PlanSelection }) {
  const router = useRouter();
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
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="message" size={24} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium text-text-primary">Check your inbox</h1>
        <p className="text-base text-text-secondary">
          We sent a verification link to{" "}
          <span className="font-medium text-text-primary">{email}</span>. Open it to continue to
          checkout.
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
            ? "Sending…"
            : cooldown > 0
              ? `Resend email in ${cooldown}s`
              : "Resend email"}
        </Button>
        <p role="status" className="min-h-5 text-sm text-text-secondary">
          {resend === "sent" && "Verification email sent again."}
        </p>
        {resend === "error" && (
          <p role="alert" className="text-sm text-danger">
            We couldn&apos;t resend the email. Please try again.
          </p>
        )}
      </div>

      <Link
        href={`/create-account?${planQuery(selection)}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        Use a different email
      </Link>

      {process.env.NODE_ENV !== "production" && (
        <Button variant="ghost" size="sm" disabled={simulating} onClick={onSimulateLink}>
          Dev: simulate clicking the email link
        </Button>
      )}
    </Card>
  );
}
