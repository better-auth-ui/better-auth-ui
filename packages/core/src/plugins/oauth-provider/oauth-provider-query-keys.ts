/** Query keys contributed by the OAuth provider plugin. */
export const oauthProviderQueryKeys = {
  /** Prefix matching every OAuth provider query. */
  all: ["auth", "oauthProvider"] as const,
  /** Prefix for public OAuth client metadata queries. */
  publicClients: ["auth", "oauthProvider", "publicClient"] as const,
  /** Key for the public metadata of a specific OAuth client. */
  publicClient: (clientId: string | undefined) =>
    [...oauthProviderQueryKeys.publicClients, clientId ?? null] as const
} as const
