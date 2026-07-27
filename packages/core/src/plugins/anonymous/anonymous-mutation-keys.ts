/**
 * Mutation keys for Better Auth's anonymous plugin.
 *
 * Anonymous sign-in stays under the shared sign-in namespace so global auth
 * pending and error handling can observe it.
 */
export const anonymousMutationKeys = {
  signIn: ["auth", "signIn", "anonymous"] as const
} as const
