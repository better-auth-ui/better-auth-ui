import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OAuthProviderAuthClient } from "./oauth-provider-auth-client"
import { oauthProviderMutationKeys } from "./oauth-provider-mutation-keys"
import { oauthProviderQueryKeys } from "./oauth-provider-query-keys"

export type DeleteOAuthConsentParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["deleteConsent"]>[0]

export type DeleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<
  ReturnType<typeof deleteOAuthConsentOptions<TAuthClient>>,
  "mutationKey" | "mutationFn" | "meta"
>

/**
 * Mutation options factory for deleting a stored OAuth consent record.
 *
 * Deleting a consent means the application has to ask for approval again. It
 * does not revoke access tokens that were already issued.
 *
 * @param authClient - The Better Auth client with the OAuth provider plugin.
 * @param userId - The signed-in user's ID. Used to invalidate consent queries.
 */
export function deleteOAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient, userId?: string) {
  const mutationFn = (params: DeleteOAuthConsentParams<TAuthClient>) =>
    authClient.oauth2.deleteConsent({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey: oauthProviderMutationKeys.deleteConsent,
    mutationFn,
    meta: {
      awaits: [oauthProviderQueryKeys.consents(userId)]
    }
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
