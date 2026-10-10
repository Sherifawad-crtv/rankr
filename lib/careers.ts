/** Lower-case, hyphen-separated text for a public link segment. Arabic letters are kept. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Path of a company's careers page. */
export function careersPath(orgSlug: string): string {
  return `/careers/${orgSlug}`;
}

/** Path of a job's public page. */
export function jobPublicPath(orgSlug: string, jobSlug: string): string {
  return `${careersPath(orgSlug)}/${jobSlug}`;
}
