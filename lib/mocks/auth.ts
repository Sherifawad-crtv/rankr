import type { SessionUser, UserRole } from "@/types";

/**
 * Mock accounts. Any email signs in, with these exceptions so every state can be seen:
 *   wrong@example.com       -> wrong email or password
 *   unverified@example.com  -> email not verified yet
 *   locked@example.com      -> too many attempts
 *   staff@... / admin@...   -> Rankr staff / company admin (anything else is a recruiter)
 */
export function roleForEmail(email: string): UserRole {
  const name = email.split("@")[0].toLowerCase();
  if (name === "staff") return "staff";
  if (name === "admin") return "company_admin";
  return "recruiter";
}

export function userForEmail(email: string): SessionUser {
  const local = email.split("@")[0];
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    id: `user-${local.toLowerCase()}`,
    name: name || "Rankr user",
    email,
    role: roleForEmail(email),
    planMode: "enterprise",
  };
}
