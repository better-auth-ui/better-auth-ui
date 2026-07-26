export type OrganizationPathOptions = {
  basePath: string
  slug: string
  slugPrefix?: string
  path: string
}

export function createOrganizationPath({
  basePath,
  slug,
  slugPrefix = "",
  path
}: OrganizationPathOptions) {
  return `${basePath}/${slugPrefix}${slug}/${path}`
}
