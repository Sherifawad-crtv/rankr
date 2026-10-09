"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Button, ErrorPanel, Input, LoadingPanel, PasswordInput, Segmented, useToast } from "@/components/ui";
import { changePassword, getProfile, updateProfile, WrongPasswordError } from "@/lib/api";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { flags } from "@/lib/flags";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";
import type { Locale, UserProfile } from "@/types";
import { SaveBar } from "./save-bar";
import { SettingsSection } from "./settings-section";

function ProfileForm({ profile }: { profile: UserProfile }) {
  const { t } = useLocale();
  const toast = useToast();
  const { updateUser } = useSession();
  const [saved, setSaved] = useState(profile);
  const [fullName, setFullName] = useState(profile.fullName);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const dirty = fullName !== saved.fullName || jobTitle !== saved.jobTitle;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim()) {
      setNameError(t("settings.profile.error.name"));
      return;
    }
    setNameError(null);
    setSaving(true);
    setFailed(false);
    try {
      const next = await updateProfile({ fullName: fullName.trim(), jobTitle: jobTitle.trim() });
      setSaved(next);
      setFullName(next.fullName);
      setJobTitle(next.jobTitle);
      updateUser({ name: next.fullName });
      toast.show(t("settings.saved"), "match");
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  function onDiscard() {
    setFullName(saved.fullName);
    setJobTitle(saved.jobTitle);
    setNameError(null);
    setFailed(false);
  }

  return (
    <SettingsSection title={t("settings.profile.title")} description={t("settings.profile.description")}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t("settings.profile.name")}
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={nameError ?? undefined}
        />
        <Input
          label={t("settings.profile.jobTitle")}
          autoComplete="organization-title"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
        />
        <Input label={t("settings.profile.email")} value={saved.email} readOnly disabled hint={t("settings.profile.emailHint")} />
        <SaveBar dirty={dirty} saving={saving} error={failed ? t("settings.error") : null} onDiscard={onDiscard} />
      </form>
    </SettingsSection>
  );
}

function LanguageCard() {
  const { t, locale, setLocale } = useLocale();
  return (
    <SettingsSection title={t("settings.language.title")} description={t("settings.language.description")}>
      <Segmented<Locale>
        label={t("settings.language.title")}
        value={locale}
        onChange={setLocale}
        options={[
          { value: "en", label: t("settings.language.en") },
          { value: "ar", label: t("settings.language.ar") },
        ]}
      />
    </SettingsSection>
  );
}

function PasswordCard() {
  const { t } = useLocale();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    if (!current) found.current = t("settings.password.error.current");
    if (next.length < MIN_PASSWORD_LENGTH) found.next = t("auth.reset.error.short", { min: MIN_PASSWORD_LENGTH });
    else if (confirm !== next) found.confirm = t("auth.reset.error.mismatch");
    setErrors(found);
    setFailed(false);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await changePassword({ current, next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.show(t("settings.password.done"), "match");
    } catch (error) {
      if (error instanceof WrongPasswordError) setErrors({ current: t("settings.password.error.wrong") });
      else setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection title={t("settings.password.title")} description={t("settings.password.description")}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <PasswordInput
          label={t("settings.password.current")}
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          error={errors.current}
        />
        <PasswordInput
          label={t("settings.password.new")}
          autoComplete="new-password"
          value={next}
          onChange={(event) => setNext(event.target.value)}
          error={errors.next}
          hint={t("auth.reset.subtitle", { min: MIN_PASSWORD_LENGTH })}
        />
        <PasswordInput
          label={t("settings.password.confirm")}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />
        {failed && (
          <p role="alert" className="text-sm text-danger">
            {t("settings.error")}
          </p>
        )}
        <Button type="submit" className="self-start" loading={saving} disabled={!current && !next && !confirm}>
          {t("settings.password.submit")}
        </Button>
      </form>
    </SettingsSection>
  );
}

export function ProfileView() {
  const { t } = useLocale();
  const load = useCallback(() => getProfile(), []);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("settings.loadError")} onRetry={retry} />;
  return (
    <>
      <ProfileForm profile={state.data} />
      {(flags.arabicUi() || process.env.NODE_ENV !== "production") && <LanguageCard />}
      <PasswordCard />
    </>
  );
}
