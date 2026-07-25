import { oauthProviderMutationKeys } from "@better-auth-ui/core/plugins"
import { useMutation } from "@tanstack/react-query"

import type { OAuthProviderAuthClient } from "../../lib/auth-client"
import { authMutationOptions } from "../auth-mutation-options"

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
  return authMutationOptions(
    authClient.oauth2.consent,
    oauthProviderMutationKeys.consent
  )
}

export function useOAuthConsent<TAuthClient extends OAuthProviderAuthClient>(
  authClient: TAuthClient,
  options?: OAuthConsentOptions<TAuthClient>
) {
  return useMutation({
    ...oauthConsentOptions(authClient),
    ...options
  })
}
