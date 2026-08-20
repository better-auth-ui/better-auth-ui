/**
 * Hierarchical mutation key factory for every Better Auth mutation managed by
 * this library.
 *
 * Mutation keys are mostly used for `useIsMutating` and global
 * `MutationCache` observers (e.g. toast handling), so the keys are static
 * tuples rather than parameterised factories. Each grouping exposes an
 * `all` prefix so consumers can match a whole feature at once:
 *
 * ```ts
 * useIsMutating({ mutationKey: authMutationKeys.all })
 * useIsMutating({ mutationKey: authMutationKeys.signIn.all })
 * useIsMutating({ mutationKey: authMutationKeys.signIn.email })
 * ```
 *
 * This factory lives in `@better-auth-ui/core` so it can be shared across
 * framework packages (`@better-auth-ui/react`, a future `/solid` package,
 * etc.) — the mutation cache entries line up regardless of which framework
 * package the mutation options factory came from.
 *
 * Plugin-specific mutation keys live alongside their plugin (e.g.
 * `apiKeyMutationKeys`, `deviceAuthorizationMutationKeys`,
 * `organizationMutationKeys`, `passkeyMutationKeys`, `magicLinkMutationKeys`,
 * `multiSessionMutationKeys`, `usernameMutationKeys`, `deleteUserMutationKeys`).
 * User-initiated plugin sign-in strategies stay under the shared
 * `["auth", "signIn", ...]` namespace so
 * `useIsMutating({ mutationKey: authMutationKeys.signIn.all })` still
 * matches them. Background authentication work can use a separate key when it
 * must not put interactive sign-in controls into a pending state.
 *
 * For query keys, see `authQueryKeys` in `./auth-query-keys`.
 */
export const authMutationKeys = {
  /** Root key for every Better Auth mutation. */
  all: ["auth"] as const,

  /** Sign-in mutations, grouped by strategy. */
  signIn: {
    /** Prefix matching every sign-in mutation (including plugin strategies). */
    all: ["auth", "signIn"] as const,
    /** Key for `signIn.email`. */
    email: ["auth", "signIn", "email"] as const,
    /** Key for `signIn.social`. */
    social: ["auth", "signIn", "social"] as const
  },

  /** Sign-up mutations, grouped by strategy. */
  signUp: {
    /** Prefix matching every sign-up mutation. */
    all: ["auth", "signUp"] as const,
    /** Key for `signUp.email`. */
    email: ["auth", "signUp", "email"] as const
  },

  /** Key for `signOut`. */
  signOut: ["auth", "signOut"] as const,

  /** Key for `requestPasswordReset`. */
  requestPasswordReset: ["auth", "requestPasswordReset"] as const,
  /** Key for `resetPassword`. */
  resetPassword: ["auth", "resetPassword"] as const,
  /** Key for `sendVerificationEmail`. */
  sendVerificationEmail: ["auth", "sendVerificationEmail"] as const,

  /** Key for `changeEmail`. */
  changeEmail: ["auth", "changeEmail"] as const,
  /** Key for `changePassword`. */
  changePassword: ["auth", "changePassword"] as const,
  /** Key for `linkSocial`. */
  linkSocial: ["auth", "linkSocial"] as const,
  /** Key for `revokeSession`. */
  revokeSession: ["auth", "revokeSession"] as const,
  /** Key for `revokeOtherSessions`. */
  revokeOtherSessions: ["auth", "revokeOtherSessions"] as const,
  /** Key for `revokeSessions`. */
  revokeSessions: ["auth", "revokeSessions"] as const,
  /** Key for `unlinkAccount`. */
  unlinkAccount: ["auth", "unlinkAccount"] as const,
  /** Key for `updateSession`. */
  updateSession: ["auth", "updateSession"] as const,
  /** Key for `updateUser`. */
  updateUser: ["auth", "updateUser"] as const
} as const
