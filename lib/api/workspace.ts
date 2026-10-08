import { simulateLatency } from "@/lib/mocks/latency";
import type { AccountProfile, WorkspaceInput } from "@/types";

// TODO(backend): wire to real endpoint. Returns the signed-in user's account details.
export async function getAccountProfile(): Promise<AccountProfile> {
  return simulateLatency({ fullName: "Mock Recruiter", email: "recruiter@example.com" });
}

// TODO(backend): wire to real endpoint
export async function createWorkspace(input: WorkspaceInput): Promise<void> {
  void input;
  await simulateLatency(undefined, 800);
}
