import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError } from "better-auth/client"
import type { OAuthProviderAuthClient } from "./oauth-provider-auth-client"
import { oauthProviderMutationKeys } from "./oauth-provider-mutation-keys"

export type OAuthConsentParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["consent"]>[0]

export type OAuthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Omit<
  ReturnType<typeof oauthConsentOptions<TAuthClient>>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for accepting or denying an OAuth request.
 *
 * Better Auth reads the signed authorization query from the current URL and
 * validates the resulting redirect.
 */
export function oauthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  const mutationKey = oauthProviderMutationKeys.consent

  const mutationFn = (params: OAuthConsentParams<TAuthClient>) =>
    authClient.oauth2.consent({
      ...params,
      fetchOptions: { ...params?.fetchOptions, throw: true }
    })

  return {
    mutationKey,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    Parameters<typeof mutationFn>[0]
  >
}
