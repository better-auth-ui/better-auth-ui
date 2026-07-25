/**
 * Mutation keys contributed by the admin plugin.
 */
export const adminMutationKeys = {
  /** Root key for every admin mutation. */
  all: ["auth", "admin"] as const,
  /** Key for `admin.stopImpersonating`. */
  stopImpersonating: ["auth", "admin", "stopImpersonating"] as const
} as const
