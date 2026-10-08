import { simulateLatency } from "@/lib/mocks/latency";
import type { CreateAccountInput } from "@/types";

export class EmailTakenError extends Error {}

// TODO(backend): wire to real endpoint. Should send the verification email.
export async function createAccount(input: CreateAccountInput): Promise<void> {
  // Mock: this address simulates an existing account so the error state can be seen.
  if (input.email === "taken@example.com") {
    await simulateLatency(null);
    throw new EmailTakenError("An account with this email already exists.");
  }
  await simulateLatency(undefined);
}

// TODO(backend): wire to real endpoint
export async function resendVerificationEmail(email: string): Promise<void> {
  void email;
  await simulateLatency(undefined);
}

// TODO(backend): wire to real endpoint. The real flow confirms a token from the emailed link.
export async function verifyEmail(token: string): Promise<void> {
  void token;
  await simulateLatency(undefined);
}
