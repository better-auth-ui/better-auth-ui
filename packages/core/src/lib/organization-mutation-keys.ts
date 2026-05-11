export const organizationMutationKeys = {
  all: ["organization"] as const,

  create: ["organization", "create"] as const,

  invite: ["organization", "invite"] as const,

  update: ["organization", "update"] as const
} as const
