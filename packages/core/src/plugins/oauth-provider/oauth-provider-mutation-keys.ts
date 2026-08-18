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
  consent: ["auth", "oauthProvider", "consent"] as const,
  /** Key for resuming a signed authorization request after a redirect screen. */
  continue: ["auth", "oauthProvider", "continue"] as const,
  /** Key for deleting a stored OAuth consent record. */
  deleteConsent: ["auth", "oauthProvider", "deleteConsent"] as const,
  createClient: ["auth", "oauthProvider", "createClient"] as const,
  updateClient: ["auth", "oauthProvider", "updateClient"] as const,
  deleteClient: ["auth", "oauthProvider", "deleteClient"] as const,
  rotateClientSecret: ["auth", "oauthProvider", "rotateClientSecret"] as const,
  setClientDisabled: ["auth", "oauthProvider", "setClientDisabled"] as const
} as const
