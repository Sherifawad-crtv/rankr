import { currentAccount } from "@/lib/mocks/auth";
import { simulateLatency } from "@/lib/mocks/latency";
import { mockSettings } from "@/lib/mocks/settings";
import type { AccountProfile, MemberInvite, SessionUser, Workspace, WorkspaceInput } from "@/types";

let createdWorkspace: Workspace | null = null;

// TODO(backend): wire to real endpoint. Returns the signed-in user's account details.
export async function getAccountProfile(): Promise<AccountProfile> {
  return simulateLatency(currentAccount());
}

// TODO(backend): wire to real endpoint. Creates the company and returns the user as its admin,
// on the plan they paid for.
export async function createWorkspace(input: WorkspaceInput): Promise<SessionUser> {
  await simulateLatency(undefined, 800);
  createdWorkspace = { companyName: input.companyName, companySize: input.companySize, plan: input.plan };
  return {
    id: "user-new-admin",
    name: input.fullName,
    email: currentAccount().email,
    role: "company_admin",
    planMode: input.plan.plan,
  };
}

// TODO(backend): wire to real endpoint. The signed-in user's workspace, or null if none yet.
export async function getWorkspace(): Promise<Workspace | null> {
  return simulateLatency(createdWorkspace);
}

// TODO(backend): wire to real endpoint. Emails each person an invitation (Enterprise only).
export async function inviteMembers(invites: MemberInvite[]): Promise<void> {
  await simulateLatency(undefined, 800);
  for (const invite of invites) {
    mockSettings.team.push({
      id: `invite-${invite.email}`,
      name: invite.email,
      email: invite.email,
      role: invite.role,
      status: "invited",
    });
  }
}
