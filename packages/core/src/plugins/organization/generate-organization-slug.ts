/** Generate a slug candidate. Creation checks availability before using it. */
export function generateOrganizationSlug(name: string, suffix?: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const candidate = slug || crypto.randomUUID()
  return suffix ? `${candidate}-${suffix}` : candidate
}
