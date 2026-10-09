import { isValidEmail } from "@/lib/auth";
import type { InviteRole, MemberInvite } from "@/types";

/** Pulls email addresses out of pasted text (commas, spaces, semicolons or new lines). */
export function splitEmails(text: string): string[] {
  return text.split(/[\s,;]+/).filter(Boolean);
}

export interface InviteParse {
  added: MemberInvite[];
  /** Entries that were not valid, kept so the person can fix them. */
  leftover: string[];
  /** The first thing that went wrong, as a message key plus the offending email. */
  problem: { kind: "invalid" | "duplicate"; email: string } | null;
}

/** Turns typed or pasted text into invites, skipping bad and repeated addresses. */
export function parseInvites(text: string, role: InviteRole, knownEmails: string[]): InviteParse {
  const known = new Set(knownEmails.map((email) => email.toLowerCase()));
  const added: MemberInvite[] = [];
  const leftover: string[] = [];
  let problem: InviteParse["problem"] = null;

  for (const email of splitEmails(text)) {
    if (!isValidEmail(email)) {
      problem ??= { kind: "invalid", email };
      leftover.push(email);
    } else if (known.has(email.toLowerCase())) {
      problem ??= { kind: "duplicate", email };
    } else {
      known.add(email.toLowerCase());
      added.push({ email, role });
    }
  }
  return { added, leftover, problem };
}
