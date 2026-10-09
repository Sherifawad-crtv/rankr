"use client";

import { Card } from "@/components/ui";
import { degreeLabel } from "@/lib/hardfilters";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Candidate } from "@/types";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-text-secondary">{title}</h3>
      {children}
    </section>
  );
}

/** What we read from the CV. Shows contact details and work, study and language history, never a photo or personal attributes. */
export function ProfileCard({ candidate }: { candidate: Candidate }) {
  const { t, tn, locale } = useLocale();
  const { cv } = candidate;
  const none = <p className="text-base text-text-secondary">{t("detail.profile.none")}</p>;

  return (
    <Card className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-text-primary">{t("detail.profile.title")}</h2>

      <Block title={t("detail.profile.contact")}>
        <p className="text-base text-text-primary">{cv.email}</p>
        {cv.phone && <p className="text-base text-text-primary">{cv.phone}</p>}
      </Block>

      <Block title={t("detail.profile.experience")}>
        <p className="text-base text-text-primary">{tn("detail.profile.years", cv.experienceYears)}</p>
        {cv.roles.length === 0 ? (
          none
        ) : (
          <ul className="flex flex-col gap-2">
            {cv.roles.map((role) => (
              <li key={`${role.title}-${role.company}-${role.period}`} className="flex flex-col">
                <span className="text-base font-semibold text-text-primary">{role.title}</span>
                <span className="text-sm text-text-secondary">
                  {role.company} · {role.period}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title={t("detail.profile.education")}>
        {cv.education.length === 0 ? (
          none
        ) : (
          <ul className="flex flex-col gap-2">
            {cv.education.map((item) => (
              <li key={`${item.institution}-${item.field}`} className="flex flex-col">
                <span className="text-base font-semibold text-text-primary">
                  {degreeLabel(item.degree, locale)} · {item.field}
                </span>
                <span className="text-sm text-text-secondary">{item.institution}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title={t("detail.profile.languages")}>
        {cv.languages.length === 0 ? (
          none
        ) : (
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {cv.languages.map((item) => (
              <li key={item.language} className="text-base text-text-primary">
                {item.language} <span className="text-text-secondary">· {t(`level.${item.level}`)}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
    </Card>
  );
}
