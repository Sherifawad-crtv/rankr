// TODO(spec): password rules are not specified; 8 characters is a placeholder.
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/**
 * Where to send someone after signing in. Only same-site paths are allowed, so a crafted
 * `?next=https://evil.example` link can't bounce a signed-in user to another site.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (next.startsWith("/sign-in")) return null;
  return next;
}
