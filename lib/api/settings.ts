import { simulateLatency } from "@/lib/mocks/latency";
import { mockSettings } from "@/lib/mocks/settings";
import type {
  CompanySettings,
  InviteRole,
  NotificationPreferences,
  TeamMember,
  UserProfile,
} from "@/types";

export class WrongPasswordError extends Error {}
export class LastAdminError extends Error {}

const SAVE_MS = 600;

// TODO(backend): wire to real endpoint
export async function getProfile(): Promise<UserProfile> {
  return simulateLatency({ ...mockSettings.profile });
}

// TODO(backend): wire to real endpoint
export async function updateProfile(input: Pick<UserProfile, "fullName" | "jobTitle">): Promise<UserProfile> {
  mockSettings.profile = { ...mockSettings.profile, ...input };
  return simulateLatency({ ...mockSettings.profile }, SAVE_MS);
}

// TODO(backend): wire to real endpoint. Rejects when the current password is wrong
// (the mock treats the text "wrong" that way).
export async function changePassword(input: { current: string; next: string }): Promise<void> {
  await simulateLatency(undefined, SAVE_MS);
  if (input.current === "wrong") throw new WrongPasswordError();
}

// TODO(backend): wire to real endpoint
export async function getCompany(): Promise<CompanySettings> {
  return simulateLatency(structuredClone(mockSettings.company));
}

// TODO(backend): wire to real endpoint. Admins only.
export async function updateCompany(input: CompanySettings): Promise<CompanySettings> {
  mockSettings.company = structuredClone(input);
  return simulateLatency(structuredClone(mockSettings.company), SAVE_MS);
}

// TODO(backend): wire to real endpoint. Uploads the logo to storage and returns its URL
// (the mock keeps it in the browser for this visit only).
export async function uploadCompanyLogo(file: File): Promise<string> {
  await simulateLatency(undefined, SAVE_MS);
  return URL.createObjectURL(file);
}

// TODO(backend): wire to real endpoint
export async function listTeam(): Promise<TeamMember[]> {
  return simulateLatency(mockSettings.team.map((member) => ({ ...member })));
}

// TODO(backend): wire to real endpoint. Rejects with a last-admin error rather than leave a company
// without an admin.
export async function updateMemberRole(memberId: string, role: InviteRole): Promise<void> {
  await simulateLatency(undefined, SAVE_MS);
  const member = mockSettings.team.find((item) => item.id === memberId);
  if (!member) return;
  const admins = mockSettings.team.filter((item) => item.role === "company_admin" && item.status === "active");
  if (member.role === "company_admin" && role !== "company_admin" && admins.length <= 1) throw new LastAdminError();
  member.role = role;
}

// TODO(backend): wire to real endpoint. Also cancels a pending invite.
export async function removeMember(memberId: string): Promise<void> {
  await simulateLatency(undefined, SAVE_MS);
  const member = mockSettings.team.find((item) => item.id === memberId);
  if (!member) return;
  const admins = mockSettings.team.filter((item) => item.role === "company_admin" && item.status === "active");
  if (member.role === "company_admin" && member.status === "active" && admins.length <= 1) throw new LastAdminError();
  mockSettings.team = mockSettings.team.filter((item) => item.id !== memberId);
}

// TODO(backend): wire to real endpoint
export async function resendInvite(memberId: string): Promise<void> {
  void memberId;
  await simulateLatency(undefined, SAVE_MS);
}

// TODO(backend): wire to real endpoint
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return simulateLatency({ ...mockSettings.notifications });
}

// TODO(backend): wire to real endpoint
export async function updateNotificationPreferences(
  input: NotificationPreferences,
): Promise<NotificationPreferences> {
  mockSettings.notifications = { ...input };
  return simulateLatency({ ...mockSettings.notifications }, SAVE_MS);
}
