"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandScope } from "@/components/brand/brand-scope";
import { LanguageToggle } from "@/components/shell/language-toggle";
import { careersPath } from "@/lib/careers";
import { useLocale } from "@/lib/i18n/locale-context";
import type { OrgPublicProfile } from "@/types";

/** Page frame for everything an applicant sees. Wears the company's brand, not Rankr's. */
export function CareersShell({ org, children }: { org: OrgPublicProfile; children: ReactNode }) {
  const { t } = useLocale();
  const { branding } = org;
  return (
    <BrandScope branding={branding} className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-border-default bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Link href={careersPath(org.slug)} className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus">
            {branding.logoUrl && (
              <Image src={branding.logoUrl} alt="" width={36} height={36} unoptimized className="size-9 object-contain" />
            )}
            <span className="font-display text-lg font-bold text-text-primary">{branding.name}</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-border-default bg-surface">
        <p className="mx-auto w-full max-w-3xl px-4 py-4 text-sm text-text-secondary">{t("careers.footer")}</p>
      </footer>
    </BrandScope>
  );
}
