// Since all queries are for the active org, which auth client always fetches from, i dont need ids.

export const organizationQueryKeys = {
  all: ["organization"] as const,

  listOrganizations: () => ["organization", "list"] as const,
  getActiveOrganization: () => ["organization", "active"] as const,
  getActiveMemberRole: () => ["organization", "active", "member-role"] as const,
  listOrganizationMembers: () => ["organization", "active", "members"] as const,
  listOrganizationInvitations: () =>
    ["organization", "active", "invitations"] as const
} as const
