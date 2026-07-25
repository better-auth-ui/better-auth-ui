/**
 * Mutation keys contributed by the device-authorization plugin.
 *
 * All keys live under the shared `["auth"]` namespace so global auth
 * mutation observers handle errors consistently.
 */
export const deviceAuthorizationMutationKeys = {
  /** Prefix matching every device-authorization mutation. */
  all: ["auth", "deviceAuthorization"] as const,
  /** Key for verifying and claiming a user code. */
  verify: ["auth", "deviceAuthorization", "verify"] as const,
  /** Key for approving a pending device request. */
  approve: ["auth", "deviceAuthorization", "approve"] as const,
  /** Key for denying a pending device request. */
  deny: ["auth", "deviceAuthorization", "deny"] as const
} as const
