/**
 * Better Auth stores a member's or invitation's roles as one comma-joined
 * string, so `"admin,member"` is a single value rather than two. Anything that
 * compares, filters, or renders a role has to split it first.
 */
export function parseMemberRoles(role: string | null | undefined) {
  if (!role) return []

  return role
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

/**
 * Join roles back into the comma-joined form Better Auth persists. Endpoints
 * accept an array too, so this is only needed for optimistic local state.
 */
export function formatMemberRoles(roles: readonly string[]) {
  return roles.join(",")
}

/**
 * Whether a member holds a role, regardless of any others they hold.
 *
 * Use this instead of `member.role === "owner"`, which silently misses an
 * owner who also carries a second role.
 */
export function hasMemberRole(
  role: string | null | undefined,
  candidate: string
) {
  return parseMemberRoles(role).includes(candidate)
}

/**
 * Resolve each of a member's roles to its configured label, falling back to
 * the raw role name for roles the UI has no label for.
 *
 * @param role - The raw comma-joined role value.
 * @param labels - The `roles` label map from the organization plugin.
 */
export function memberRoleLabels(
  role: string | null | undefined,
  labels: Record<string, string> | undefined
) {
  return parseMemberRoles(role).map((entry) => labels?.[entry] ?? entry)
}

export type DynamicOrganizationRole = {
  id: string
  role: string
  permission: Record<string, string[]>
}

/** Merge configured labels with roles stored by Better Auth. */
export function mergeOrganizationRoleLabels(
  labels: Record<string, string> | undefined,
  dynamicRoles:
    | readonly Pick<DynamicOrganizationRole, "role">[]
    | null
    | undefined
) {
  const merged = { ...labels }

  for (const dynamicRole of dynamicRoles ?? []) {
    if (!Object.hasOwn(merged, dynamicRole.role)) {
      merged[dynamicRole.role] = dynamicRole.role
    }
  }

  return merged
}

/** Return members that currently hold the supplied role. */
export function membersWithRole<T extends { role?: string | null }>(
  members: readonly T[] | undefined,
  role: string
) {
  return (members ?? []).filter((member) => hasMemberRole(member.role, role))
}
