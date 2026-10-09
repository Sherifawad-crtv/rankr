"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { BrandScope } from "@/components/brand/brand-scope";
import { Badge, Button, ChoiceChips, ErrorPanel, Icon, Input, LoadingPanel, useToast } from "@/components/ui";
import { getCompany, updateCompany, uploadCompanyLogo } from "@/lib/api";
import { isValidHex } from "@/lib/branding";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { useSession } from "@/lib/session";
import { COMPANY_SIZES, type CompanySettings } from "@/types";
import { SaveBar } from "./save-bar";
import { SettingsSection } from "./settings-section";

const MAX_LOGO_BYTES = 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

function CompanyForm({ company, canEdit }: { company: CompanySettings; canEdit: boolean }) {
  const { t } = useLocale();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(company);
  const [draft, setDraft] = useState(company);
  const [colorText, setColorText] = useState(company.branding.primaryColor);
  const [nameError, setNameError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function setBranding(changes: Partial<CompanySettings["branding"]>) {
    setDraft((current) => ({ ...current, branding: { ...current.branding, ...changes } }));
  }

  function onColorText(value: string) {
    const hex = value.startsWith("#") ? value : `#${value}`;
    setColorText(value);
    if (isValidHex(hex)) {
      setColorError(null);
      setBranding({ primaryColor: hex });
    }
  }

  async function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return setLogoError(t("settings.brand.logoErrorType"));
    if (file.size > MAX_LOGO_BYTES) return setLogoError(t("settings.brand.logoErrorSize"));
    setLogoError(null);
    setUploading(true);
    try {
      setBranding({ logoUrl: await uploadCompanyLogo(file) });
    } catch {
      setLogoError(t("settings.brand.logoErrorUpload"));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nameMissing = !draft.name.trim();
    const colorBad = !isValidHex(draft.branding.primaryColor) || (colorText !== draft.branding.primaryColor && !isValidHex(colorText.startsWith("#") ? colorText : `#${colorText}`));
    setNameError(nameMissing ? t("settings.company.error.name") : null);
    setColorError(colorBad ? t("settings.brand.colorInvalid") : null);
    if (nameMissing || colorBad) return;

    setSaving(true);
    setFailed(false);
    try {
      const next = await updateCompany({
        ...draft,
        name: draft.name.trim(),
        branding: { ...draft.branding, name: draft.branding.name.trim() || draft.name.trim() },
      });
      setSaved(next);
      setDraft(next);
      setColorText(next.branding.primaryColor);
      toast.show(t("settings.saved"), "match");
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  function onDiscard() {
    setDraft(saved);
    setColorText(saved.branding.primaryColor);
    setNameError(null);
    setColorError(null);
    setLogoError(null);
    setFailed(false);
  }

  const { branding } = draft;
  const displayName = branding.name.trim() || draft.name;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {!canEdit && (
        <p className="rounded-lg bg-subtle px-4 py-3 text-sm text-text-secondary">{t("settings.adminOnly")}</p>
      )}
      <SettingsSection title={t("settings.company.title")} description={t("settings.company.description")}>
        <Input
          label={t("settings.company.name")}
          autoComplete="organization"
          value={draft.name}
          disabled={!canEdit}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          error={nameError ?? undefined}
        />
        <fieldset disabled={!canEdit} className="min-w-0 disabled:opacity-60">
          <ChoiceChips
            label={t("settings.company.size")}
            options={COMPANY_SIZES}
            value={draft.size}
            onChange={(size) => setDraft({ ...draft, size })}
          />
        </fieldset>
      </SettingsSection>

      <SettingsSection title={t("settings.brand.title")} description={t("settings.brand.description")}>
        <Input
          label={t("settings.brand.displayName")}
          value={branding.name}
          disabled={!canEdit}
          onChange={(event) => setBranding({ name: event.target.value })}
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-text-primary">{t("settings.brand.color")}</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label={t("settings.brand.color")}
              value={branding.primaryColor}
              disabled={!canEdit}
              onChange={(event) => {
                setColorText(event.target.value);
                setColorError(null);
                setBranding({ primaryColor: event.target.value });
              }}
              className="h-10 w-14 cursor-pointer rounded-md border border-border-default bg-surface p-1 disabled:cursor-not-allowed"
            />
            <div className="w-36">
              <Input
                label={t("settings.brand.color")}
                value={colorText}
                disabled={!canEdit}
                maxLength={7}
                spellCheck={false}
                onChange={(event) => onColorText(event.target.value)}
                error={colorError ?? undefined}
                className="uppercase"
              />
            </div>
          </div>
          <p className="text-sm text-text-secondary">{t("settings.brand.colorHint")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">{t("settings.brand.logo")}</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex size-16 items-center justify-center overflow-hidden rounded-lg border border-border-default bg-subtle">
              {branding.logoUrl ? (
                <Image src={branding.logoUrl} alt="" width={64} height={64} unoptimized className="size-full object-contain" />
              ) : (
                <Icon name="building" size={24} className="text-text-disabled" />
              )}
            </span>
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept={LOGO_TYPES.join(",")}
                  className="sr-only"
                  tabIndex={-1}
                  aria-label={t("settings.brand.logo")}
                  onChange={onLogo}
                />
                <Button type="button" variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
                  <Icon name="upload" size={16} />
                  {uploading
                    ? t("settings.brand.logoUploading")
                    : branding.logoUrl
                      ? t("settings.brand.logoReplace")
                      : t("settings.brand.logoUpload")}
                </Button>
                {branding.logoUrl && !uploading && (
                  <Button type="button" variant="ghost" onClick={() => setBranding({ logoUrl: null })}>
                    {t("settings.brand.logoRemove")}
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className={logoError ? "text-sm text-danger" : "text-sm text-text-secondary"} role={logoError ? "alert" : undefined}>
            {logoError ?? t("settings.brand.logoHint")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">{t("settings.brand.preview")}</span>
          <BrandScope branding={branding} className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-subtle p-4">
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} alt="" width={32} height={32} unoptimized className="size-8 object-contain" />
            ) : null}
            <span className="font-display text-base font-bold text-text-primary">{displayName}</span>
            <Badge tone="primary">{t("settings.brand.previewBadge")}</Badge>
            <span className="rounded-lg bg-primary px-4 py-2 text-base font-semibold text-primary-contrast">
              {t("settings.brand.previewButton")}
            </span>
          </BrandScope>
        </div>
      </SettingsSection>

      {canEdit && (
        <SaveBar dirty={dirty} saving={saving} error={failed ? t("settings.error") : null} onDiscard={onDiscard} />
      )}
    </form>
  );
}

export function CompanyView() {
  const { t } = useLocale();
  const { user } = useSession();
  const load = useCallback(() => getCompany(), []);
  const { state, retry } = useAsync(load);

  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("settings.loadError")} onRetry={retry} />;
  return <CompanyForm company={state.data} canEdit={user.role !== "recruiter"} />;
}
