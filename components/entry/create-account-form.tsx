"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Input } from "@/components/ui";
import { EmailTakenError, createAccount } from "@/lib/api";
import { planQuery } from "@/lib/entry-flow";
import type { PlanSelection } from "@/types";
import { PlanSummary } from "./plan-summary";

// TODO(spec): password rules and terms/privacy acceptance are not specified.
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  terms?: string;
  form?: string;
}

function validate(values: {
  fullName: string;
  email: string;
  password: string;
  terms: boolean;
}): Errors {
  const errors: Errors = {};
  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";
  if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address.";
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!values.terms) errors.terms = "You need to accept the terms to continue.";
  return errors;
}

export function CreateAccountForm({ selection }: { selection: PlanSelection }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate({ fullName, email, password, terms });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await createAccount({ fullName: fullName.trim(), email, password, plan: selection });
      const params = new URLSearchParams(planQuery(selection));
      params.set("email", email);
      router.push(`/verify-email?${params.toString()}`);
    } catch (error) {
      setErrors(
        error instanceof EmailTakenError
          ? { email: error.message }
          : { form: "Something went wrong. Please try again." },
      );
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-text-primary">Create your account</h1>
        <p className="mt-1 text-base text-text-secondary">
          We&apos;ll email you a link to verify your address before checkout.
        </p>
      </div>
      <PlanSummary selection={selection} />
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={errors.fullName}
        />
        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={errors.password}
        />
        <div className="flex flex-col gap-1">
          <Checkbox
            checked={terms}
            onChange={(event) => setTerms(event.target.checked)}
            label="I accept the terms of service and privacy policy."
          />
          {errors.terms && <p className="text-sm text-danger">{errors.terms}</p>}
        </div>
        {errors.form && (
          <p role="alert" className="text-sm text-danger">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
