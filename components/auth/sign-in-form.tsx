"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleIcon } from "@/components/brand/google-icon";
import { Button, Input, PasswordInput } from "@/components/ui";
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  TooManyAttemptsError,
  resendVerificationEmail,
  signIn,
  signInWithGoogle,
} from "@/lib/api";
import { isValidEmail, safeNext } from "@/lib/auth";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";
import type { SessionUser } from "@/types";

interface FieldErrors {
  email?: string;
  password?: string;
}

type Problem =
  | { kind: "message"; text: string }
  | { kind: "unverified"; email: string };

interface SignInFormProps {
  /** Where to go after signing in, from `?next=`. Checked before use. */
  next: string | null;
  /** The sign-up entry, or null while the sign-up flow is hidden. */
  signUpHref: string | null;
}

export function SignInForm({ next, signUpHref }: SignInFormProps) {
  const router = useRouter();
  const session = useSession();
  const { t, tn } = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<Problem | null>(null);
  const [busy, setBusy] = useState<"password" | "google" | null>(null);
  const [resent, setResent] = useState(false);

  function finish(user: SessionUser) {
    session.signIn(user);
    router.replace(safeNext(next) ?? "/dashboard");
    // The app keeps this page mounted while it is out of view, so clear what was typed and the busy state.
    setEmail("");
    setPassword("");
    setBusy(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: FieldErrors = {};
    if (!isValidEmail(email)) found.email = t("auth.error.email");
    if (!password) found.password = t("auth.error.passwordRequired");
    setErrors(found);
    setProblem(null);
    setResent(false);
    if (Object.keys(found).length > 0) return;

    setBusy("password");
    try {
      finish(await signIn({ email, password }));
    } catch (error) {
      if (error instanceof InvalidCredentialsError) setProblem({ kind: "message", text: t("auth.error.invalid") });
      else if (error instanceof EmailNotVerifiedError) setProblem({ kind: "unverified", email });
      else if (error instanceof TooManyAttemptsError) {
        setProblem({ kind: "message", text: tn("auth.error.locked", error.retryInMinutes) });
      } else setProblem({ kind: "message", text: t("auth.error.generic") });
      setBusy(null);
    }
  }

  async function onGoogle() {
    setProblem(null);
    setBusy("google");
    try {
      finish(await signInWithGoogle());
    } catch {
      setProblem({ kind: "message", text: t("auth.error.google") });
      setBusy(null);
    }
  }

  async function onResend(address: string) {
    setResent(false);
    try {
      await resendVerificationEmail(address);
      setResent(true);
    } catch {
      setProblem({ kind: "message", text: t("auth.error.generic") });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("auth.signIn.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("auth.signIn.subtitle")}</p>
      </div>

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
          label={t("auth.signIn.email")}
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-1">
          <PasswordInput
            label={t("auth.signIn.password")}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
          />
          <Link
            href="/forgot-password"
            className="self-end text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-border-focus"
          >
            {t("auth.signIn.forgot")}
          </Link>
        </div>

        {problem?.kind === "message" && (
          <p role="alert" className="animate-fade-up rounded-lg bg-danger/5 px-4 py-3 text-sm text-danger">
            {problem.text}
          </p>
        )}
        {problem?.kind === "unverified" && (
          <div role="alert" className="flex animate-fade-up flex-col gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">{t("auth.unverified.title")}</p>
            <p className="text-sm text-text-secondary">{t("auth.unverified.body", { email: problem.email })}</p>
            {resent ? (
              <p role="status" className="text-sm font-semibold text-match">
                {t("auth.unverified.sent")}
              </p>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => onResend(problem.email)}>
                {t("auth.unverified.resend")}
              </Button>
            )}
          </div>
        )}

        <Button type="submit" size="lg" loading={busy === "password"} disabled={busy === "google"}>
          {t("auth.signIn.submit")}
        </Button>
      </form>

      {signUpHref && (
        <p className="text-center text-sm text-text-secondary">
          {t("auth.signIn.newHere")}{" "}
          <Link href={signUpHref} className="font-semibold text-primary hover:underline">
            {t("auth.signIn.create")}
          </Link>
        </p>
      )}

      {process.env.NODE_ENV !== "production" && (
        <p className="rounded-lg bg-subtle px-3 py-2 text-xs text-text-secondary">
          Dev: any email signs in. Try wrong@example.com, unverified@example.com, locked@example.com, admin@… or
          staff@rankr.example.
        </p>
      )}
    </div>
  );
}
