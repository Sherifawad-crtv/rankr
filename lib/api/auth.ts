import { simulateLatency } from "@/lib/mocks/latency";
import { userForEmail } from "@/lib/mocks/auth";
import type { CreateAccountInput, SessionUser } from "@/types";

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

export class InvalidCredentialsError extends Error {}
export class EmailNotVerifiedError extends Error {}
export class TooManyAttemptsError extends Error {
  constructor(readonly retryInMinutes: number) {
    super("Too many sign-in attempts");
  }
}
export class ExpiredLinkError extends Error {}

// TODO(backend): wire to real endpoint (Supabase Auth, email and password).
export async function signIn(input: { email: string; password: string }): Promise<SessionUser> {
  await simulateLatency(undefined, 700);
  if (input.email === "wrong@example.com") throw new InvalidCredentialsError();
  if (input.email === "unverified@example.com") throw new EmailNotVerifiedError();
  if (input.email === "locked@example.com") throw new TooManyAttemptsError(15);
  return userForEmail(input.email);
}

// TODO(backend): wire to real endpoint (Supabase Auth, Google OAuth). In production this redirects to
// Google and returns to the app signed in; the mock just resolves with a user.
export async function signInWithGoogle(): Promise<SessionUser> {
  await simulateLatency(undefined, 900);
  return userForEmail("google.user@example.com");
}

// TODO(backend): wire to real endpoint. Always resolves, so the screen can't be used to find out
// which emails have accounts.
export async function requestPasswordReset(email: string): Promise<void> {
  void email;
  await simulateLatency(undefined, 600);
}

// TODO(backend): wire to real endpoint. Rejects with an expired-link error when the emailed link is
// too old or already used. The mock treats the token "expired" that way.
export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await simulateLatency(undefined, 600);
  if (input.token === "expired") throw new ExpiredLinkError();
}

// TODO(backend): wire to real endpoint
export async function signOut(): Promise<void> {
  await simulateLatency(undefined, 200);
}
