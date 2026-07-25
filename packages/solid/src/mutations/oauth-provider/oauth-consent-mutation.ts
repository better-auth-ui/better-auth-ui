import { oauthProviderMutationKeys } from "@better-auth-ui/core/plugins"

import type { OAuthProviderAuthClient } from "../../lib/auth-client"
import { createAuthMutationOptions } from "../create-auth-mutation"

export type OAuthConsentParams<
  TAuthClient extends OAuthProviderAuthClient = OAuthProviderAuthClient
> = Parameters<TAuthClient["oauth2"]["consent"]>[0]

/**
 * Mutation options factory for accepting or denying an OAuth request.
 *
 * Better Auth reads the signed authorization query from the current URL and
 * validates the resulting redirect.
 */
export function oauthConsentOptions<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient) {
  return createAuthMutationOptions(
    authClient.oauth2.consent,
    oauthProviderMutationKeys.consent
  )
}
