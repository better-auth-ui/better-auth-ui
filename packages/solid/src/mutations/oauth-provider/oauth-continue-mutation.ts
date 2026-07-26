import type { OAuthContinueVariables } from "@better-auth-ui/core/plugins"
import { oauthProviderMutationKeys } from "@better-auth-ui/core/plugins"
import { mutationOptions } from "@tanstack/solid-query"
import type { BetterFetchError, BetterFetchOption } from "better-auth/client"

import type { OAuthProviderAuthClient } from "../../lib/auth-client"

export type OAuthContinueParams = OAuthContinueVariables & {
  fetchOptions?: BetterFetchOption
}

/**
 * Mutation options factory for resuming a signed authorization request.
 *
 * Call this after a redirect screen finishes its own job — signup
 * (`{ created: true }`), account selection (`{ selected: true }`), or an
 * application-owned post-login screen (`{ postLogin: true }`).
 *
 * The variables are forwarded to `oauth2.continue` untouched.
 * `oauthProviderClient()` re-attaches the signed OAuth query from the current
 * URL, so never rebuild the query string or the redirect URL yourself.
 */
export function oauthContinueOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  const mutationFn = (variables: OAuthContinueParams) =>
    authClient.oauth2.continue({
      ...variables,
      fetchOptions: { ...variables?.fetchOptions, throw: true }
    })

  return mutationOptions<
    Awaited<ReturnType<typeof mutationFn>>,
    BetterFetchError,
    OAuthContinueParams
  >({
    mutationKey: oauthProviderMutationKeys.continue,
    mutationFn
  })
}
