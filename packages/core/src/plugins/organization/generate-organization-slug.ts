/** Slugs are public identifiers. Availability checks resolve collisions on every platform. */
export const generateOrganizationSlugSuffix = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

/** Generate a slug candidate. Creation checks availability before using it. */
export function generateOrganizationSlug(
  name: string,
  suffix?: string
): string {
  const slug = name
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036F]/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "")

  const candidate = slug || `organization-${generateOrganizationSlugSuffix()}`
  return suffix ? `${candidate}-${suffix}` : candidate
}
