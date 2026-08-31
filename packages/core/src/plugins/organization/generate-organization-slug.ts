/** Generate a valid slug when the organization slug field is hidden. */
export function generateOrganizationSlug(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return slug || crypto.randomUUID()
}
