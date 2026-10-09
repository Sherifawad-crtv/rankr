"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyPanel,
  ErrorPanel,
  Icon,
  Input,
  LoadingPanel,
  Select,
  useToast,
  type Column,
} from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { controlClass } from "@/components/ui/field";
import { inviteMembers, LastAdminError, listTeam, removeMember, resendInvite, updateMemberRole } from "@/lib/api";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/locale-context";
import { parseInvites } from "@/lib/invites";
import { useSession } from "@/lib/session";
import { INVITE_ROLES, type InviteRole, type TeamMember } from "@/types";
import { SettingsSection } from "./settings-section";

function TeamManager({ initial, canManage }: { initial: TeamMember[]; canManage: boolean }) {
  const { t, tn } = useLocale();
  const toast = useToast();
  const { user } = useSession();
  const [members, setMembers] = useState(initial);
  const [text, setText] = useState("");
  const [role, setRole] = useState<InviteRole>("recruiter");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);
  const [pending, setPending] = useState<TeamMember | null>(null);

  async function refresh() {
    setMembers(await listTeam());
  }

  async function onInvite(event: FormEvent) {
    event.preventDefault();
    const { added, leftover, problem } = parseInvites(text, role, members.map((member) => member.email));
    setText(leftover.join(", "));
    setInviteError(problem ? t(`invite.error.${problem.kind}`, { email: problem.email }) : null);
    if (added.length === 0) return;
    setSending(true);
    try {
      await inviteMembers(added);
      await refresh();
      toast.show(tn("settings.team.invited", added.length), "match");
    } catch {
      setInviteError(t("invite.sendError"));
      setText(added.map((invite) => invite.email).join(", "));
    } finally {
      setSending(false);
    }
  }

  async function guard(action: () => Promise<void>) {
    setRowError(null);
    try {
      await action();
      await refresh();
    } catch (error) {
      setRowError(error instanceof LastAdminError ? t("settings.team.error.lastAdmin") : t("settings.error"));
      await refresh();
    }
  }

  async function onResend(member: TeamMember) {
    await guard(async () => {
      await resendInvite(member.id);
      toast.show(t("settings.team.toast.resent"), "match");
    });
  }

  async function onConfirmRemove() {
    if (!pending) return;
    const member = pending;
    await guard(async () => {
      await removeMember(member.id);
      toast.show(
        member.status === "invited"
          ? t("settings.team.toast.cancelled")
          : t("settings.team.toast.removed", { name: member.name }),
        "match",
      );
    });
  }

  const columns: Column<TeamMember>[] = [
    {
      id: "member",
      header: t("settings.team.col.member"),
      sortValue: (member) => member.name.toLowerCase(),
      cell: (member) => (
        <div className="flex min-w-48 items-center gap-3">
          <Avatar name={member.name} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-semibold text-text-primary">
              {member.status === "invited" ? member.email : member.name}
              {member.email === user.email && <Badge tone="primary">{t("settings.team.you")}</Badge>}
            </p>
            {member.status === "active" && <p className="truncate text-sm text-text-secondary">{member.email}</p>}
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: t("settings.team.col.role"),
      sortValue: (member) => member.role,
      cell: (member) =>
        canManage ? (
          <select
            aria-label={t("settings.team.roleFor", { name: member.name })}
            className={cn(controlClass, "h-9 w-auto min-w-32")}
            value={member.role}
            onChange={(event) =>
              guard(async () => {
                await updateMemberRole(member.id, event.target.value as InviteRole);
                toast.show(t("settings.team.toast.role"), "match");
              })
            }
          >
            {INVITE_ROLES.map((item) => (
              <option key={item} value={item}>
                {t(`role.${item}`)}
              </option>
            ))}
          </select>
        ) : (
          t(`role.${member.role}`)
        ),
    },
    {
      id: "status",
      header: t("settings.team.col.status"),
      sortValue: (member) => member.status,
      cell: (member) => (
        <Badge tone={member.status === "active" ? "match" : "warning"}>
          {t(`settings.team.status.${member.status}`)}
        </Badge>
      ),
    },
    ...(canManage
      ? [
          {
            id: "actions",
            header: <span className="sr-only">{t("common.edit")}</span>,
            align: "end" as const,
            cell: (member: TeamMember) => (
              <div className="flex justify-end gap-1">
                {member.status === "invited" && (
                  <Button variant="ghost" size="sm" onClick={() => onResend(member)}>
                    {t("settings.team.resend")}
                  </Button>
                )}
                {member.email !== user.email && (
                  <Button variant="ghost" size="sm" onClick={() => setPending(member)}>
                    {member.status === "invited" ? t("settings.team.cancelInvite") : t("settings.team.remove")}
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {canManage && (
        <SettingsSection title={t("settings.team.inviteTitle")} description={t("settings.team.subtitle")}>
          <form onSubmit={onInvite} noValidate className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <Input
                label={t("invite.email")}
                type="email"
                multiple
                autoComplete="off"
                placeholder={t("invite.emailPlaceholder")}
                value={text}
                onChange={(event) => setText(event.target.value)}
                error={inviteError ?? undefined}
                hint={inviteError ? undefined : t("invite.pasteHint")}
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
            <Button type="submit" className="self-start" loading={sending} disabled={!text.trim()}>
              <Icon name="mail" size={16} /> {t("settings.team.inviteSend")}
            </Button>
          </form>
        </SettingsSection>
      )}

      <SettingsSection title={t("settings.team.members")} description={canManage ? undefined : t("settings.team.subtitle")}>
        {rowError && (
          <p role="alert" className="animate-fade-up text-sm text-danger">
            {rowError}
          </p>
        )}
        <DataTable columns={columns} rows={members} getRowId={(member) => member.id} />
      </SettingsSection>

      <ConfirmDialog
        open={pending !== null}
        tone="danger"
        title={
          pending?.status === "invited"
            ? t("settings.team.cancelTitle")
            : t("settings.team.removeTitle", { name: pending?.name ?? "" })
        }
        description={
          pending?.status === "invited"
            ? t("settings.team.cancelBody", { name: pending.email })
            : t("settings.team.removeBody")
        }
        confirmLabel={pending?.status === "invited" ? t("settings.team.cancelConfirm") : t("settings.team.remove")}
        onConfirm={onConfirmRemove}
        onClose={() => setPending(null)}
      />
    </>
  );
}

export function TeamView() {
  const { t } = useLocale();
  const { user } = useSession();
  const load = useCallback(() => listTeam(), []);
  const { state, retry } = useAsync(load);

  if (user.planMode === "solo") {
    return <EmptyPanel icon="users" title={t("settings.team.soloTitle")} description={t("settings.team.soloBody")} />;
  }
  if (state.status === "loading") return <LoadingPanel label={t("common.loading")} />;
  if (state.status === "error") return <ErrorPanel message={t("settings.loadError")} onRetry={retry} />;
  return <TeamManager initial={state.data} canManage={user.role !== "recruiter"} />;
}
