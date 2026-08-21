/**
 * Mutation keys contributed by the admin plugin.
 */
export const adminMutationKeys = {
  /** Root key for every admin mutation. */
  all: ["auth", "admin"] as const,
  banUser: ["auth", "admin", "banUser"] as const,
  createUser: ["auth", "admin", "createUser"] as const,
  impersonateUser: ["auth", "admin", "impersonateUser"] as const,
  removeUser: ["auth", "admin", "removeUser"] as const,
  revokeUserSession: ["auth", "admin", "revokeUserSession"] as const,
  revokeUserSessions: ["auth", "admin", "revokeUserSessions"] as const,
  setRole: ["auth", "admin", "setRole"] as const,
  setUserPassword: ["auth", "admin", "setUserPassword"] as const,
  /** Key for `admin.stopImpersonating`. */
  stopImpersonating: ["auth", "admin", "stopImpersonating"] as const,
  unbanUser: ["auth", "admin", "unbanUser"] as const,
  updateUser: ["auth", "admin", "updateUser"] as const
} as const
