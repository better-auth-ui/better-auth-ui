/** Slugs are public identifiers. Availability checks resolve collisions on every platform. */
export const generateOrganizationSlugSuffix = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

/** Generate a slug candidate. Creation checks availability before using it. */
export function generateOrganizationSlug(name: string, suffix?: string) {
  const slug = name
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")

  const candidate = slug || `organization-${generateOrganizationSlugSuffix()}`
  return suffix ? `${candidate}-${suffix}` : candidate
}
