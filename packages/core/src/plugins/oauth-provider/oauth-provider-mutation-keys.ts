/**
 * Mutation keys contributed by the OAuth provider plugin.
 *
 * All keys live under the shared `["auth"]` namespace so global auth
 * mutation observers handle errors consistently.
 */
export const oauthProviderMutationKeys = {
  /** Prefix matching every OAuth provider mutation. */
  all: ["auth", "oauthProvider"] as const,
  /** Key for accepting or denying an OAuth authorization request. */
  consent: ["auth", "oauthProvider", "consent"] as const
} as const
