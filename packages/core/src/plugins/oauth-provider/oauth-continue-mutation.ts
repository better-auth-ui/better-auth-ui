import type { MutationOptions } from "@tanstack/query-core"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"
import type { OAuthProviderAuthClient } from "./oauth-provider-auth-client"
import { oauthProviderMutationKeys } from "./oauth-provider-mutation-keys"
import type { OAuthContinueVariables } from "./oauth-provider-plugin"

export type OAuthContinueParams = OAuthContinueVariables & {
  fetchOptions?: BetterFetchOption
}

export type OAuthContinueOptions = Omit<
  ReturnType<typeof oauthContinueOptions>,
  "mutationKey" | "mutationFn"
>

/**
 * Mutation options factory for resuming a signed authorization request.
 *
 * Call this after a redirect screen finishes its own job: signup
 * (`{ created: true }`), account selection (`{ selected: true }`), or an
 * application-owned post-login screen (`{ postLogin: true }`).
 */
export function oauthContinueOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (variables: OAuthContinueParams) =>
    authClient.oauth2.continue({
      ...variables,
      fetchOptions: { ...variables.fetchOptions, throw: true }
    })

  return {
    mutationKey: oauthProviderMutationKeys.continue,
    mutationFn
  } as MutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    OAuthContinueParams
  >
}
