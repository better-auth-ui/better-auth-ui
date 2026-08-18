import { authQueryKeys } from "../../lib/auth-query-keys"

/** Query keys contributed by the OAuth provider plugin. */
export const oauthProviderQueryKeys = {
  /** Prefix matching every OAuth provider query. */
  all: ["auth", "oauthProvider"] as const,
  /** Prefix for public OAuth client metadata queries. */
  publicClients: ["auth", "oauthProvider", "publicClient"] as const,
  /** Key for the public metadata of a specific OAuth client. */
  publicClient: (clientId: string | undefined) =>
    [...oauthProviderQueryKeys.publicClients, clientId ?? null] as const,

  /**
   * Prefix for the signed-in user's OAuth consent queries.
   *
   * Scoped under `authQueryKeys.user(userId)` so one account's authorized
   * applications can never surface in another account's view.
   */
  consents: (userId: string | undefined) =>
    [...authQueryKeys.user(userId), "oauthProvider", "consents"] as const,
  /** Key for the signed-in user's consent list. */
  listConsents: <TQuery = undefined>(
    userId: string | undefined,
    query?: TQuery
  ) => [...oauthProviderQueryKeys.consents(userId), query ?? null] as const,
  /** OAuth clients owned by one explicit user or organization cache scope. */
  clients: (ownerKey: string | undefined) =>
    ["auth", "oauthProvider", "clients", ownerKey ?? null] as const
} as const
