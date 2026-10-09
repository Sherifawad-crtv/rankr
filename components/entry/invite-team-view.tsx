"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card, Icon, Input, Select } from "@/components/ui";
import { stagger } from "@/components/ui/cn";
import { inviteMembers } from "@/lib/api";
import { isValidEmail } from "@/lib/auth";
import { planQuery } from "@/lib/entry-flow";
import { useLocale } from "@/lib/i18n/locale-context";
import { INVITE_ROLES, type InviteRole, type MemberInvite, type PlanSelection } from "@/types";

/** Pulls email addresses out of pasted text (commas, spaces, semicolons or new lines). */
function splitEmails(text: string): string[] {
  return text.split(/[\s,;]+/).filter(Boolean);
}

export function InviteTeamView({ selection }: { selection: PlanSelection }) {
  const router = useRouter();
  const { t, tn } = useLocale();
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [text, setText] = useState("");
  const [role, setRole] = useState<InviteRole>("recruiter");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  function onAdd(event: FormEvent) {
    event.preventDefault();
    const known = new Set(invites.map((invite) => invite.email.toLowerCase()));
    const added: MemberInvite[] = [];
    const leftover: string[] = [];
    let problem: string | null = null;

    for (const email of splitEmails(text)) {
      if (!isValidEmail(email)) {
        problem ??= t("invite.error.invalid", { email });
        leftover.push(email);
      } else if (known.has(email.toLowerCase())) {
        problem ??= t("invite.error.duplicate", { email });
      } else {
        known.add(email.toLowerCase());
        added.push({ email, role });
      }
    }

    setInvites((current) => [...current, ...added]);
    setText(leftover.join(", "));
    setError(problem);
  }

  async function onSend() {
    setSending(true);
    setSendError(false);
    try {
      await inviteMembers(invites);
      router.push(`/welcome?${planQuery(selection)}&invited=${invites.length}`);
    } catch {
      setSendError(true);
      setSending(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t("invite.title")}</h1>
        <p className="mt-1 text-base text-text-secondary">{t("invite.subtitle")}</p>
      </div>

      <form onSubmit={onAdd} noValidate className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <Input
            label={t("invite.email")}
            type="email"
            multiple
            autoFocus
            autoComplete="off"
            placeholder={t("invite.emailPlaceholder")}
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={error ?? undefined}
            hint={error ? undefined : t("invite.pasteHint")}
          />
          <Select label={t("invite.role")} value={role} onChange={(event) => setRole(event.target.value as InviteRole)}>
            {INVITE_ROLES.map((item) => (
              <option key={item} value={item}>
                {t(`role.${item}`)}
              </option>
            ))}
          </Select>
        </div>
        {/* TODO(spec): what each role is allowed to do */}
        <p className="text-sm text-text-secondary">{t("invite.roleHelp")}</p>
        <Button type="submit" variant="secondary" className="self-start" disabled={!text.trim()}>
          <Icon name="plus" variant="bold" size={16} /> {t("invite.add")}
        </Button>
      </form>

      <section aria-live="polite" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text-secondary">
          {invites.length === 0 ? t("invite.empty") : tn("invite.listTitle", invites.length)}
        </h2>
        {invites.length > 0 && (
          <ul className="flex flex-col divide-y divide-border-default rounded-lg border border-border-default">
            {invites.map((invite, index) => (
              <li
                key={invite.email}
                className="animate-stagger flex items-center gap-3 px-4 py-2"
                style={stagger(index)}
              >
                <span className="min-w-0 flex-1 truncate text-base text-text-primary">{invite.email}</span>
                <Badge tone={invite.role === "company_admin" ? "primary" : "neutral"}>
                  {t(`role.${invite.role}`)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t("invite.remove", { email: invite.email })}
                  onClick={() => setInvites((current) => current.filter((item) => item.email !== invite.email))}
                >
                  <Icon name="close" size={16} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sendError && (
        <p role="alert" className="text-sm text-danger">
          {t("invite.sendError")}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          disabled={sending}
          onClick={() => router.push(`/welcome?${planQuery(selection)}`)}
        >
          {t("invite.skip")}
        </Button>
        <Button size="lg" disabled={invites.length === 0} loading={sending} onClick={onSend}>
          {invites.length === 0 ? t("invite.send.other", { count: 0 }) : tn("invite.send", invites.length)}
        </Button>
      </div>
    </Card>
  );
}
